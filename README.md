# anc
SIG Web pour l'analyse des ressources mellifères autour d'un rucher.

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
- Cloner le dépôt sgalopin/anc:
    - Ouvrir un Git Bash:
        - Se placer dans le répertoire dans lequel vous souhaitez installer le projet,
        - Cliquer sur le bouton droit de la souris,
        - Cliquer sur 'Git Bash',
        - Taper la ligne de commande suivante: 'git clone https://github.com/sgalopin/anc.git'.

### Lancer la VM et le serveur (NodeJS)

Se placer dans le répertoire dans lequel vous avez installé le projet:
- Ouvrir une console ('clic droit' puis 'Git Bash Here'),
- Taper la commande 'vagrant up',
- Ouvrir une autre console (Alt + F2),
- Taper la commande 'vagrant provision --provision-with launch-app',

### Accès à l'application
Lancer votre navigateur (Testé uniquement avec Chrome pour l'instant) et entrer l'adresse : http://192.168.50.11/

### Ajout de la résolution de l'hôte en local (Optionnel)
Dans "C:\Windows\System32\drivers\etc\hosts" ajouter la ligne suivante:
```
192.168.50.11 anc.dev.net
```
Vous pouvez maintenant accéder à l'application à l'adresse: http://anc.dev.net/.

## Désinstallation

- Dans Git Bash:
  - **$ vagrant halt**: Stope la VM.
  - **$ vagrant destroy**: Supprime la VM.
- Supprimer les sources,
- Supprimer VirtualBox, Vagrant, Git, Cygwin.

## Développement

### Commandes vagrant
- **$ vagrant rsync-auto**: Lance la synchronisation unilatérale (host -> guest) du répertoire 'app' (A lancer dans une nouvelle console).
- **$ vagrant gatling-rsync-auto**: Lance la synchronisation unilatérale (host -> guest) du répertoire 'app' avec le plugin vagrant [gatling-rsync](https://github.com/smerrill/vagrant-gatling-rsync) (A lancer dans une nouvelle console).
- **$ vagrant ssh**: Ouvre une console ssh vers le serveur.
- **$ vagrant halt**: Stope la VM.
- **$ vagrant destroy**: Supprime la VM.
- **$ vagrant provision --provision-with launch-app**: Lance le serveur sans la possibilité de l'arrêter et de le redémarrer.
- **$ vagrant provision --provision-with populate-db**: (Re)charge la base de données (MongoDB).

### Commandes serveur (via console ssh)
- **vagrant@anc:~$ cd /var/www/app && npm run dev**: Lance le serveur avec la possibilité de l'arrêter et de le redémarrer.
