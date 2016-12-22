
import os, django, json

os.environ['DJANGO_SETTINGS_MODULE'] = 'mysite.settings'
django.setup()
from mysite.views import *

#config = load_wifi_config_json()
#print(config)

#for ssid in wifi_ssid_scan():
#    print(ssid)

config = {
    'hc2IPAddress': '192.168.10.5',
    'hc2Account': 'account',
    'hc2Password': 'password',
    'ssidSelected': 'FLH-ShowRoom',
    'wifiPassword': '12345678',
}

#setup_homebridge(config)
setup_wifi(config)
