#!/bin/bash

# Data directory
SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )"
DATA_DIR="$SCRIPTPATH/../database/data"

# Environment variables
source "$SCRIPTPATH/.env"

echo "--------------------------------------------------"
echo " Populate DB "
echo "--------------------------------------------------"

echo "--- Populating of the taxons collection."
if [ $MONGODB_USER ]
then
  mongo $MONGODB_SHORTURI -u $MONGODB_USER -p $MONGODB_PASSWORD "$DATA_DIR/taxons.js"
else
  mongo $MONGODB_SHORTURI "$DATA_DIR/taxons.js"
fi
echo "--- Populating done."

echo "--- Populating of the accounts collection."
if [ $MONGODB_USER ]
then
  mongo $MONGODB_SHORTURI -u $MONGODB_USER -p $MONGODB_PASSWORD "$DATA_DIR/accounts.js"
else
  mongo $MONGODB_SHORTURI "$DATA_DIR/accounts.js"
fi
echo "--- Populating done."

echo "--- Populating of the vegetation zones collection."
if [ $MONGODB_USER ]
then
  mongo $MONGODB_SHORTURI -u $MONGODB_USER -p $MONGODB_PASSWORD "$DATA_DIR/vegetation-zones.js"
else
  mongo $MONGODB_SHORTURI "$DATA_DIR/vegetation-zones.js"
fi
echo "--- Populating done."

echo "--- Populating of the hives collection."
if [ $MONGODB_USER ]
then
  mongo $MONGODB_SHORTURI -u $MONGODB_USER -p $MONGODB_PASSWORD "$DATA_DIR/hives.js"
else
  mongo $MONGODB_SHORTURI "$DATA_DIR/hives.js"
fi
echo "--- Populating done."

echo "--- Populating of the extents collection."
if [ $MONGODB_USER ]
then
  mongo $MONGODB_SHORTURI -u $MONGODB_USER -p $MONGODB_PASSWORD "$DATA_DIR/extents.js"
else
  mongo $MONGODB_SHORTURI "$DATA_DIR/extents.js"
fi
echo "--- Populating done."

echo "--- Populating of the pedoclimatic zones collection."
if [ $MONGODB_USER ]
then
  mongo $MONGODB_SHORTURI -u $MONGODB_USER -p $MONGODB_PASSWORD "$DATA_DIR/pedoclimatic-zones.js"
else
  mongo $MONGODB_SHORTURI "$DATA_DIR/pedoclimatic-zones.js"
fi
echo "--- Populating done."
