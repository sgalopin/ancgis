[![GitHub (pre-)elease](https://img.shields.io/github/release/sgalopin/ancgis/all.svg)](https://github.com/sgalopin/ancgis/releases)
[![AGPLv3 License](https://img.shields.io/github/license/sgalopin/ancgis.svg)](https://github.com/sgalopin/ancgis/blob/master/LICENSE)
&nbsp;&nbsp; [![Build Status](https://travis-ci.org/sgalopin/ancgis.svg?branch=master)](https://travis-ci.org/sgalopin/ancgis)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/937f624be4a14ed9a53bb4346ed6ba16)](https://www.codacy.com/app/sgalopin/ancgis?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=sgalopin/ancgis&amp;utm_campaign=Badge_Grade)
&nbsp;&nbsp; ![GitHub top language](https://img.shields.io/github/languages/top/badges/shields.svg)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/badges/shields.svg)

# AncGIS&trade;
SIG Web pour l'analyse des ressources mellifères autour d'un rucher.

AncGIS&trade; est un outil permettant de :
- Relevé la végétation autour des ruchers,
- Détecter des carences alimentaires (période et diversité),
- Aider à la sélection de plantes mellifères.

<br/>

![alt text](doc/img/home.png?raw=true "Page principale de l'application")

## Installation

### Installation de la machine virtuelle (VM)

Vagrant est utilisé pour instancier la machine virtuelle.
- Installer [VirtualBox](https://www.virtualbox.org/wiki/Downloads),
- Installer [Vagrant](https://www.vagrantup.com/downloads.html),
- Installer [Git](https://git-scm.com/downloads),
- Installer Rsync:
    - dans le [MinGW64](http://mingw-w64.org/doku.php#tools) de git (Git Bash):
        - Installer [Rsync](https://blog.tiger-workshop.com/add-rsync-to-git-bash-for-windows/)
    - dans Cygwin:
        - Installer [Cygwin](https://cygwin.com/install.html),
        - Dans le manageur cocher les packages 'rsync' et 'openssh',
        - Configurer [openssh](https://www.howtogeek.com/howto/41560/how-to-get-ssh-command-line-access-to-windows-7-using-cygwin/)
- Cloner le dépôt sgalopin/ancgis:
    - Ouvrir un Git Bash:
        - Se placer dans le répertoire dans lequel vous souhaitez installer le projet,
        - Cliquer sur le bouton droit de la souris,
        - Cliquer sur 'Git Bash',
        - Taper la ligne de commande suivante: 'git clone https://github.com/sgalopin/ancgis.git'.

### Lancer la VM et le serveur (NodeJS)

Se placer dans le répertoire dans lequel vous avez installé le projet:
- Ouvrir une console ('clic droit' puis 'Git Bash Here'),
- Taper la commande 'vagrant up' (Lance la VM),
- Ouvrir une autre console (Alt + F2),
- Taper la commande 'vagrant provision --provision-with launch-app' (Lance le serveur),

### Accès à l'application
Lancer votre navigateur (Testé uniquement avec Chrome pour l'instant) et entrer l'adresse : http://192.168.50.11/

### Ajout de la résolution de l'hôte en local (Optionnel)
Dans "C:\Windows\System32\drivers\etc\hosts" ajouter la ligne suivante:
```
192.168.50.11 ancgis.dev.net
```
Vous pouvez maintenant accéder à l'application à l'adresse: http://ancgis.dev.net/.

## Désinstallation

- Dans Git Bash:
  - **$ vagrant halt**: Stope la VM.
  - **$ vagrant destroy**: Supprime la VM.
- Supprimer les sources,
- Supprimer VirtualBox, Vagrant, Git, Cygwin.

## Développement

### Commandes vagrant
- **$ vagrant rsync-auto**: Lance la synchronisation unilatérale (host -> guest) des répertoires 'application' et 'database' (A lancer dans une nouvelle console).
- **$ vagrant gatling-rsync-auto**: Idem ci-dessus avec le plugin vagrant [gatling-rsync](https://github.com/smerrill/vagrant-gatling-rsync).
- **$ vagrant ssh**: Ouvre une console ssh vers le serveur.
- **$ vagrant halt**: Stope la VM.
- **$ vagrant destroy**: Supprime la VM.
- **$ vagrant provision --provision-with npm-install**: Lance l'installation des modules node requis par l'application.
- **$ vagrant provision --provision-with populate-db**: (Re)charge la base de données (MongoDB).
- **$ vagrant provision --provision-with launch-app**: Lance (avec node) le serveur SANS la possibilité de l'arrêter et de le redémarrer.

### Commandes serveur (via console ssh)
- **vagrant@anc:~$ cd /var/www/anc && npm run start**: Lance (avec node) le serveur AVEC la possibilité de l'arrêter et de le redémarrer.
- **vagrant@anc:~$ cd /var/www/anc && npm run dev**: Idem ci-dessus mais lancement fait avec nodemon (Redémarrage automatique du serveur après modification des sources).
- **vagrant@anc:~$ cd /var/www/anc && npm test**: Lance une batterie de tests UI (puppeteer, mocha, chai).
