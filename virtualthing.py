#from pyembedded.gps_module.gps import GPS

import geocoder
import time
import json
import sys
from datetime import datetime

from AWSIoTPythonSDK.MQTTLib import AWSIoTMQTTClient



myMQTTClient = AWSIoTMQTTClient("a39ulgrkvuv6qf-ats.iot.us-east-1.amazonaws.com") #random key, if another connection using the same key is opened the previous one is auto closed by AWS IOT
myMQTTClient.configureEndpoint("a39ulgrkvuv6qf-ats.iot.us-east-1.amazonaws.com", 8883)

myMQTTClient.configureCredentials("/Users/kitiojor/PycharmProjects/pythonProject3/virtualthingfile/virtualthingCA1.pem", "//Users/kitiojor/PycharmProjects/pythonProject3/virtualthingfile/virtualthingprivate.pem.key", "/Users/kitiojor/PycharmProjects/pythonProject3/virtualthingfile/virtualthing_devicecert.pem.crt")

myMQTTClient.configureOfflinePublishQueueing(-1)
myMQTTClient.configureConnectDisconnectTimeout(10)
myMQTTClient.configureMQTTOperationTimeout(5)
print('Initiating  Data Transfer ')
myMQTTClient.connect()
try:
    myMQTTClient.connect()
    print("Connected to AWS IoT")
except Exception as e:
    print("Error connecting to AWS IoT:", str(e))
    sys.exit(1)  # Exit the program if the connection fails
#
print (" connecting to GPS ")

time.sleep(3)
print("publishing...")
x= 0
while True:

    g = geocoder.ip('me')
    locations= g.latlng
    current_time = str(datetime.now())
    current_time_obj = datetime.strptime(current_time, "%Y-%m-%d %H:%M:%S.%f")  # Adjust the format as needed
    timestamp = current_time_obj.timestamp()
    for i in locations:  # seperate those coordinate in assigned vaiable lat and long
        lat = locations[0]
        long = locations[1]

    message1 = {"DeviceID": "virtualdevice1","time":current_time}
    message2 = {"Ip": {"IpAddress":"104.28.50.189"}}
   #message = {"DeviceID": "virtualdevice1","latitude": "{:.4f}".format(locations[0]) ,"longitude": "{:.4f}".format(locations[1]),"time": current_time, "timestamp": timestamp}
    myMQTTClient.publish(topic="virtualthing1/data", QoS=1, payload=json.dumps(message1))
    myMQTTClient.publish(topic="$aws/device_location/virtualthing1/get_position_estimate", QoS=1, payload=json.dumps(message2))

    x=x+1
    print("posted " + str(x) + " times")
    time.sleep(15)
