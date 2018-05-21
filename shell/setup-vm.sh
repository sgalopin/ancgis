#!/bin/bash
set -e
set -o pipefail

echo "--------------------------------------------------"
echo " Setup the VM "
echo "--------------------------------------------------"

# Port 80 requires elevated privileges
# https://docs.requarks.io/wiki/troubleshooting#error-listening-on-port-xx-requires-elevated-privileges
sudo apt-get install -y libcap2-bin
sudo setcap 'cap_net_bind_service=+ep' `which node`

# MongoDB
sudo apt-get install -y mongodb
sed -i 's/bind_ip = 127.0.0.1/#bind_ip = 127.0.0.1/g' /etc/mongodb.conf
service mongodb restart

# Setup the database
/bin/bash ./populate-db.sh