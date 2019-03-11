# Data generation

The rawdata and the data are not stored into the code repository.
You have to get the rawdata from the various providers.
Put the rawdata into the rawdata directory and launch the generation of the data.

## Get the raw data from the providers
- Antennas raw data:
> Go the [stations page]( https://www.cartoradio.fr/index.html#/cartographie/stations). Create an account to download the data. Get the data in csv format and join the antennas and the associated pylons in a geojson file.

## Generation of the data
- Add the raw data into the "rawdata" directory,
- Set the parameters into the "config.json" file,
- Install the required packages:  
```npm install```,
- Launch the generation:  
```npm run start```,
- Launch the db populate:  
```cd /var/tmp/ancgis/database/data```  
```/bin/bash /var/tmp/ancgis/shell/populate-db.sh```.
