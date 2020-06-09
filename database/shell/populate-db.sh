#!/bin/bash

# Data directory
SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )"
DATA_DIR="$SCRIPTPATH/../data"

# Environment variables
source "$SCRIPTPATH/.env"

echo "--------------------------------------------------"
echo " Populate DB "
echo "--------------------------------------------------"

cd $DATA_DIR
for f in *.js
do
    echo "--- Populating from the \"$f\" file..."
    if [ $MONGODB_USER ]
    then
      mongo $MONGODB_SHORTURI -u $MONGODB_USER -p $MONGODB_PASSWORD $f
    else
      mongo $MONGODB_SHORTURI $f
    fi
    echo "--- Populating done."
done
