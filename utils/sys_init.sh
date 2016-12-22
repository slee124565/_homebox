#!/bin/bash -x

config_ssid_list=$(sudo grep -o 'ssid="[^"]*"' /etc/wpa_supplicant/wpa_supplicant.conf  | sed 's/ssid="//' | sed 's/"//')

ssid_list=$(sudo iwlist wlan0 scan | grep -o 'ESSID:"[^"]*"' | sed 's/ESSID:"//' | sed 's/"//' )

mac_addr=$(ifconfig wlan0 | grep -o 'HWaddr\s.*$' | sed 's/HWaddr\s//' | tr -d '[:space:]')
mac_addr=${mac_addr^^}


