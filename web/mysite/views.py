
from django.views.generic import TemplateView, View
from django.http import HttpResponse, Http404, JsonResponse, HttpResponseServerError
from django.conf import settings

import os
import json
import re
import subprocess

import logging
from pip._vendor.requests.api import post
logger = logging.getLogger(__name__)

class HomePageView(TemplateView):
    
    template_name = 'index.html'
    
    def get_context_data(self, **kwargs):
        context = super(HomePageView, self).get_context_data(**kwargs)
        context['site'] = {
            'title': 'FLH Homebox',
            'description': 'Make your Fibaro HC2/HCL connected with Homekit APP',
            'header': 'System Configurations',
            'ssid_list': ['SSID1','SSID2','SSID3']
            
            }
        return context

class AngularTemplateView(View):
    def get(self, request, item=None, *args, **kwargs):
        #print(item)
        #template_dir_path = settings.TEMPLATES[0]["DIRS"][0]
        final_path = os.path.join(settings.BASE_DIR,'ngapp','app','views',item+".html" )
        try:
            html = open(final_path)
            return HttpResponse(html)
        except:
            raise Http404

def load_homebox_hc2_config_json():
    with open('/var/homebridge/config.json','r') as fh:
        config = json.loads(fh.read())

    for platform in config['platforms']:
        if platform['platform'] == 'HC2ScenePlatform':
            return platform['hc2']

    logger.warning('no HC2ScenePlatform platform config found!')
    return {}            

def load_wifi_config_json():
    with open('/etc/wpa_supplicant/wpa_supplicant.conf','r') as fh:
        content = fh.read()
    
    config = {}
    founds = re.findall(r'ssid=\"(.+?)\"',content)
    if len(founds) == 1:
        config['ssid'] = founds[0]

    founds = re.findall(r'psk=\"(.+?)\"',content)
    if len(founds) == 1:
        config['psk'] = founds[0]

    return config

def wifi_ssid_scan():
    scan_log = subprocess.check_output(['sudo', 'iwlist', 'wlan0', 'scan'])
    scan_log = scan_log.decode("utf-8") 
    founds = re.findall(r'ESSID:\"(.+?)\"',scan_log)
    return [{'name': ssid} for ssid in founds]

def setup_homebridge(config):
    logger.debug('setup_homebridge')
    setup_hombridge_shell = os.path.join(os.path.dirname(settings.BASE_DIR),
                                         'utils', 'setup_homebox')
    subprocess.check_call([setup_hombridge_shell,
                           '-h', config['hc2_hostname'],
                           '-u', config['hc2_account'],
                           '-p', config['hc2_password']]) 

def setup_wifi(config):
    logger.debug('setup_wifi')
    setup_wifi_shell = os.path.join(os.path.dirname(settings.BASE_DIR),
                                         'utils', 'setup_wifi')
    subprocess.check_call([setup_wifi_shell,
                           '-s', config['wifi_ssid'],
                           '-p', config['wifi_password']]) 

class SiteConfigAPI(View):
    
    def get(self, request, *args, **kwargs):
        logger.debug('SiteConfigAPI GET API')
        siteConfig = {
            'hc2': load_homebox_hc2_config_json(),
            'wifi': load_wifi_config_json(),
            'ssidOptions': wifi_ssid_scan(),
        }
        return JsonResponse(siteConfig)
    
    def post(self, request, *args, **kwargs):
        logger.debug('SiteConfigAPI POST API')
        try:
            post_config = json.loads(request.body.decode('utf-8'))
            new_config = {
                'hc2_hostname': post_config.get('hc2IPAddress',''),
                'hc2_account': post_config.get('hc2Account',''),
                'hc2_password': post_config.get('hc2Password',''),
                'wifi_ssid': post_config.get('ssidSelected',{}).get('name',''),
                'wifi_password': post_config.get('wifiPassword',''),
                }
            check_passed = True
            for key in new_config:
                if new_config[key] == '':
                    check_passed = False
            new_config['check_passed'] = check_passed
            
            if check_passed:
                logger.debug('check passed and post config %s' % new_config)
                setup_homebridge(new_config)
                setup_wifi(new_config)
                pass
            else:
                logger.warning('new config check fail, %s' % new_config)
                return JsonResponse(new_config)
                
            siteConfig = {
                'hc2': load_homebox_hc2_config_json(),
                'wifi': load_wifi_config_json(),
                'ssidOptions': post_config.get('ssidOptions'),
            }
            return JsonResponse(siteConfig)
        
        except:
            logger.warning('SiteConfigAPI Exception Error', exc_info=True)
            return HttpResponseServerError()

def do_factory_reset():
    logger.debug('do_factory_reset')
    factory_reset_shell = os.path.join(os.path.dirname(settings.BASE_DIR),
                                         'utils', 'factory_reset')
    subprocess.call([factory_reset_shell, '&']) 

class SiteResetAPI(View):
    
    def post(self, request, *args, **kwargs):
        logger.debug('SiteResetAPI POST API')
        try:
            post_config = json.loads(request.body.decode('utf-8'))
            if post_config.token == 'flhomebox':
                logger.warning('factory reset triggered by web api!')
                do_factory_reset()
            else:
                logger.warning('SiteResetAPI triggered with wrong token %s' % post_config)
            
            return HttpResponse('OK')
        except:
            logger.warning('SiteResetAPI Exception Error', exc_info=True)
            return HttpResponseServerError()
                
    
    
    
    
    
    
    
    