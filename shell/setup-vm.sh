#!/bin/bash
#set -e
#set -o pipefail

echo "--------------------------------------------------"
echo " Setup the VM "
echo "--------------------------------------------------"

echo "-- Port 80 requires elevated privileges "
# https://www.digitalocean.com/community/tutorials/how-to-use-pm2-to-setup-a-node-js-production-environment-on-an-ubuntu-vps
# https://docs.requarks.io/wiki/troubleshooting#error-listening-on-port-xx-requires-elevated-privileges
# https://stackoverflow.com/questions/16573668/best-practices-when-running-node-js-with-port-80-ubuntu-linode
#sudo apt-get install -y libcap2-bin
#sudo setcap 'cap_net_bind_service=+ep' `which node`
sudo setcap cap_net_bind_service=+ep /usr/local/bin/node

echo "-- MongoDB "
#sudo apt-get install -y mongodb
#sudo sed -i 's/bind_ip = 127.0.0.1/#bind_ip = 127.0.0.1/g' /etc/mongodb.conf
#sudo service mongodb restart
