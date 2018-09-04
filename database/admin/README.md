# Note on AdminMongo:

The ```config.json``` file is used to set the adminMongo connections.

The adminMongo interface is available on the ```1234``` port (ex: http://ancgis.dev.net:1234 ).

The adminMongo application can be launched via the following vagrant command:
```
$ vagrant provision --provision-with launch-dba
```
or directly via the ssh console:
```
vagrant@ancgis:~$ cd /var/www/adminMongo && npm start
```

Please visit the [adminMongo](https://adminmongo.markmoffat.com/) website for more information.
