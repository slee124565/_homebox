
from django.views.generic import TemplateView, View
from django.http import HttpResponse, Http404
from django.conf import settings

import os

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
        
class SiteConfigAPI(View):
    
    def get(self, request, *args, **kwargs):
        logger.debug('SiteConfigAPI GET API')
        return HttpResponse('GET API')
    
    def post(self, request, *args, **kwargs):
        logger.debug('SiteConfigAPI POST API')
        return HttpResponse('POST API')
        