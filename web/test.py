
import os, django, json

os.environ['DJANGO_SETTINGS_MODULE'] = 'mysite.settings'
django.setup()
from mysite.views import *

#config = load_wifi_config_json()
#print(config)

for ssid in wifi_ssid_scan():
    print(ssid)

