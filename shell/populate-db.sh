#!/bin/bash

echo "--------------------------------------------------"
echo " Populate DB "
echo "--------------------------------------------------"

echo "--- Populating of the taxons collection."
mongo localhost/anc taxons.js
echo "--- Populating done."
echo "--- Populating of the vegetation zones collection."
mongo localhost/anc vegetation-zones.js
echo "--- Populating done."
echo "--- Populating of the hives collection."
mongo localhost/anc hives.js
echo "--- Populating done."
