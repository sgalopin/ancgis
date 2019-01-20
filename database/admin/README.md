# Note on AdminMongo:

The ```config.json``` and the ```app.json``` files are used to set the adminMongo connections.

The adminMongo server is listen on the ```0.0.0.0``` IP address and the ```1234``` port on the guest machine.
The adminMongo interface is accessible at the ```http://ancgis.dev.net:1234``` address from your host machine.

The adminMongo application can be launched via the following vagrant command:
```
$ vagrant provision --provision-with launch-dba
```
or directly via the ssh console:
```
vagrant@ancgis:~$ cd /var/www/adminMongo && npm start
```

Please visit the [adminMongo](https://adminmongo.markmoffat.com/) website for more information.
