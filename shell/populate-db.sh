#!/bin/bash

echo "--------------------------------------------------"
echo " Populate DB "
echo "--------------------------------------------------"

echo "--- Populating of the taxons collection."
mongo localhost/ancgis taxons.js
echo "--- Populating done."

echo "--- Populating of the accounts collection."
mongo localhost/ancgis accounts.js
echo "--- Populating done."

echo "--- Populating of the vegetation zones collection."
mongo localhost/ancgis vegetation-zones.js
echo "--- Populating done."

echo "--- Populating of the apiaries collection."
mongo localhost/ancgis apiaries.js
echo "--- Populating done."

echo "--- Populating of the hives collection."
mongo localhost/ancgis hives.js
echo "--- Populating done."

echo "--- Populating of the extents collection."
mongo localhost/ancgis extents.js
echo "--- Populating done."

echo "--- Populating of the antennas collection."
mongo localhost/ancgis antennas.js
echo "--- Populating done."

echo "--- Populating of the antenna sectors collection."
mongo localhost/ancgis antenna-sectors.js
echo "--- Populating done."
