#!/bin/bash

sudo apt-get -y autoremove


echo "====== Starting installation of MySQL ======"
echo "== Installing Server =="
sudo debconf-set-selections <<< 'mysql-server mysql-server/root_password password trVhFRXeDxYvN6js'
sudo debconf-set-selections <<< 'mysql-server mysql-server/root_password_again password trVhFRXeDxYvN6js'
sudo apt-get -y install mysql-server

echo "== Installing Client =="
sudo apt-get -y install mysql-client
echo "------ Installation of MySQL done ------"


echo "====== Starting setup of MySQL for CDAR ======"
echo "== Loading cdar.sql =="
mysql -u root -ptrVhFRXeDxYvN6js < /vagrant/cdar.sql
echo "== Creating cdar-User =="
mysql -u root -ptrVhFRXeDxYvN6js -e "CREATE USER 'cdar'@'localhost' IDENTIFIED BY 'cdar';"
echo "== Granting privileges to cdar-User =="
mysql -u root -ptrVhFRXeDxYvN6js -e "GRANT ALL PRIVILEGES ON cdar.* TO 'cdar'@'localhost';"
mysql -u root -ptrVhFRXeDxYvN6js -e "FLUSH PRIVILEGES;"
echo "------ Setup of MySQL for CDAR done ------"


echo "====== Starting installation of CDAR ======"
echo "== Installing Tomcat =="
sudo apt-get -y install tomcat7

echo "== Deploying CDAR.war =="
sudo cp /vagrant/CDAR.war /var/lib/tomcat7/webapps/
sudo chown tomcat7:tomcat7 /var/lib/tomcat7/webapps/CDAR.war
echo "== Changing port to 9900 =="
sudo sed -i "s/port=\"8080\"/port=\"9900\"/g" /etc/tomcat7/server.xml
echo "== Restarting Tomcat =="
sudo service tomcat7 restart
echo "------ Installation of CDAR done ------"


echo "====== Starting installation and configuration of Mediawiki ======"
echo "== Installing webserver =="
sudo apt-get -y install apache2 php5 php5-mysql libapache2-mod-php5

echo "== Downloading Mediawiki =="
curl -sS -o /tmp/mediawiki-1.22.7.tar.gz http://releases.wikimedia.org/mediawiki/1.22/mediawiki-1.22.7.tar.gz
echo "== Extracting Mediawiki =="
tar xz -C /tmp/ -f /tmp/mediawiki-*.tar.gz
echo "== Moving Mediawiki in place =="
sudo mv /tmp/mediawiki-1.22.7 /etc/mediawiki
echo "== Removing downloaded Mediawiki archive =="
sudo rm /tmp/mediawiki-*.tar.gz
echo "== Linking Mediawiki into webserver =="
sudo ln -s /etc/mediawiki/ /var/www/html

echo "== Changing port to 9901 =="
sudo echo "Listen 9901" >> /etc/apache2/ports.conf
sudo sed -i "s/VirtualHost \*:80/VirtualHost *:80 *:9901/g" /etc/apache2/sites-enabled/000-default.conf
echo "== Restarting webserver =="
sudo service apache2 restart

echo "== Setting up MySQL for Mediawiki (create user) =="
mysql -u root -ptrVhFRXeDxYvN6js -e "CREATE USER 'wiki'@'localhost' IDENTIFIED BY 'wiki';"
echo "== Setting up MySQL for Mediawiki (create schema) =="
mysql -u root -ptrVhFRXeDxYvN6js -e "CREATE SCHEMA IF NOT EXISTS wiki DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ;"
echo "== Setting up MySQL for Mediawiki (grant privileges) =="
mysql -u root -ptrVhFRXeDxYvN6js -e "GRANT ALL PRIVILEGES ON wiki.* TO 'wiki'@'localhost';"
echo "== Setting up MySQL for Mediawiki (flush privileges) =="
mysql -u root -ptrVhFRXeDxYvN6js -e "FLUSH PRIVILEGES;"

echo "== Configuring Mediawiki =="
sudo php /etc/mediawiki/maintenance/install.php EEPPI-CDAR wikiadmin --pass TjLjJ7Urw9veVmtv --scriptpath /mediawiki --dbname wiki --dbuser wiki --dbpass wiki --server http://localhost:9901
echo "------ Installation and configuration of Mediawiki done ------"


echo "||=================================================================||"
echo "|| CDAR is now available at http://localhost:8080/CDAR/cdarclient/ ||"
echo "||=================================================================||"
