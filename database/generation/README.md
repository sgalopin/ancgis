# Data generation

The rawdata and the data are not stored into the code repository.
You have to get the rawdata from the various providers.
Put the rawdata into the rawdata directory and launch the generation of the data.

## Get the raw data from the providers
- Taxons raw data:
> Go the [contact page](https://apinutriculture.org/contact/) of apinutriculture.org and ask a dump of the database.

## Check your raw data

You can decide to edit you own database for any reason. In that case, you can check your data with the provided scripts and schemas.
- On the host:
 - Add your raw data into the "rawdata" directory,
 - Set the parameters into the "config.json" file,
 - Stop the folders synchronizations to avoid the generated data files drop (only if you work on the guest for the next part).


- On the guest (or more easily on the host if Node.js is installed on it):
 - Install the required packages:  
 ```cd /var/tmp/ancgis/database/generation```  
 ```npm install```,
 - Launch the check:  
    - Taxons:  
    ```cd /var/tmp/ancgis/database/generation/taxons```  
    ```node check-taxons.js```,

## Generation of the data
- On the host:
 - Add the raw data into the "rawdata" directory,
 - Set the parameters into the "config.json" file,
 - Stop the folders synchronizations to avoid the generated data files drop (only if you work on the guest for the next part).


- On the guest (or more easily on the host if Node.js is installed on it):
 - Install the required packages:  
 ```cd /var/tmp/ancgis/database/generation```  
 ```npm install```,
 - Launch the generation:  
 ```npm run start```,
 - Launch the db populate:  
 ```/bin/bash /var/www/ancgis/sources/database/shell/populate-db.sh```.
