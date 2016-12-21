
from django.views.generic import TemplateView, View
from django.http import HttpResponse, Http404, JsonResponse
from django.conf import settings

import os
import json
import re
import subprocess

import logging
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
    return founds

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
        return HttpResponse('POST API')
        
