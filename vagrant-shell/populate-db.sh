#!/usr/bin/env bash
echo "--------------------------------------------------"
echo " Populate DB "
echo "--------------------------------------------------"

cd /var/tmp/anc/database
echo "--- Populating of the taxons collection."
mongo localhost/anc taxons.js
echo "--- Populating of the taxons collection done."
