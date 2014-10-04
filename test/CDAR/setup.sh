#!/bin/bash

set -o verbose

sudo apt-get -y autoremove


echo "====== Starting installation of MySQL ======"
sudo debconf-set-selections <<< 'mysql-server mysql-server/root_password password your_password'
sudo debconf-set-selections <<< 'mysql-server mysql-server/root_password_again password your_password'
sudo apt-get -y install mysql-server

sudo apt-get -y install mysql-client
echo "------ Installation of MySQL done ------"

echo "====== Starting setup of MySQL for CDAR ======"
mysql -u root -pyour_password < /vagrant/cdar.sql
mysql -u root -pyour_password -e "CREATE USER 'cdar'@'localhost' IDENTIFIED BY 'cdar';"
mysql -u root -pyour_password -e "GRANT ALL PRIVILEGES ON cdar.* TO 'cdar'@'localhost';"
mysql -u root -pyour_password -e "FLUSH PRIVILEGES;"
echo "------ Setup of MySQL for CDAR done ------"


echo "====== Starting installation of CDAR ======"
sudo apt-get -y install tomcat7

sudo cp /vagrant/CDAR.war /var/lib/tomcat7/webapps/
sudo chown tomcat7:tomcat7 /var/lib/tomcat7/webapps/CDAR.war
sudo service tomcat7 restart
echo "------ Installation of CDAR done ------"


echo "====== Starting setup of Test-User for CDAR ======"
mysql -u cdar -pcdar cdar -e "INSERT INTO User SET username='a', password='a', drill_hierarchy=4;"
echo "------ Setup of Test-User for CDAR done ------"


echo "====== Starting installation and configuration of Mediawiki ======"
#get old version
#sudo apt-get -y install mediawiki
sudo apt-get -y install apache2 php5 php5-mysql libapache2-mod-php5
#update to newest version
curl -sS -o /tmp/mediawiki-1.22.7.tar.gz http://releases.wikimedia.org/mediawiki/1.22/mediawiki-1.22.7.tar.gz
tar xz -C /tmp/ -f /tmp/mediawiki-*.tar.gz

#sudo rm -rf /var/lib/mediawiki
#sudo mv /tmp/mediawiki-1.22.7 /var/lib/mediawiki
#sudo rm -rf /etc/mediawiki
sudo mv /tmp/mediawiki-1.22.7 /etc/mediawiki

sudo rm /tmp/mediawiki-*.tar.gz
sudo ln -s /etc/mediawiki/ /var/www/html

#sudo mv /etc/mediawiki/apache.conf /etc/mediawiki/apache.conf.orig
#sudo cp /vagrant/apache.conf /etc/mediawiki/apache.conf

#sudo a2enconf mediawiki
sudo service apache2 restart

mysql -u root -pyour_password -e "CREATE USER 'wiki'@'localhost' IDENTIFIED BY 'wiki';"
mysql -u root -pyour_password -e "CREATE SCHEMA IF NOT EXISTS wiki DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ;"
mysql -u root -pyour_password -e "GRANT ALL PRIVILEGES ON wiki.* TO 'wiki'@'localhost';"
mysql -u root -pyour_password -e "FLUSH PRIVILEGES;"

#Wikiadmin: user: wikiadmin passwort: TjLjJ7Urw9veVmtv
sudo mv /etc/mediawiki/LocalSettings.php /etc/mediawiki/LocalSettings.php.orig
#sudo cp /vagrant/LocalSettings.php /etc/mediawiki/

#sudo php /var/lib/mediawiki/maintenance/install.php EEPPI-CDAR wikiadmin --pass TjLjJ7Urw9veVmtv --scriptpath /mediawiki --dbname wiki --dbuser wiki --dbpass wiki
sudo php /etc/mediawiki/maintenance/install.php EEPPI-CDAR wikiadmin --pass TjLjJ7Urw9veVmtv --scriptpath /mediawiki --dbname wiki --dbuser wiki --dbpass wiki --server http://localhost:18080
echo "------ Installation and configuration of Mediawiki done ------"


echo "||=================================================================||
echo "|| CDAR is now available at http://localhost:8080/CDAR/cdarclient/ ||
echo "||=================================================================||



#curl 'http://localhost/mediawiki/api.php/?' -X POST -H 'Host: localhost' -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:32.0) Gecko/20100101 Firefox/32.0' -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' -H 'Accept-Language: de-ch,de;q=0.8,en-gb;q=0.6,en;q=0.4,fr;q=0.2' -H 'Accept-Encoding: gzip, deflate' -H 'DNT: 1' -H 'Origin: http://localhost' -H 'Access-Control-Request-Method: POST' -H 'Access-Control-Request-Headers: cache-control,pragma' -H 'Connection: keep-alive' -H 'Pragma: no-cache' -H 'Cache-Control: no-cache'
#curl 'http://localhost:8080/CDAR/webapi/users' -H 'Host: localhost:8080' -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:32.0) Gecko/20100101 Firefox/32.0' -H 'Accept: application/json, text/plain, */*'                               -H 'Accept-Language: de-ch,de;q=0.8,en-gb;q=0.6,en;q=0.4,fr;q=0.2' -H 'Accept-Encoding: gzip, deflate' -H 'DNT: 1' -H 'Content-Type: application/json;charset=utf-8' -H 'Referer: http://localhost:8080/CDAR/cdarclient/' -H 'Content-Length: 32' -H 'Cookie: mw_installer_session=pb0fl1br5ebvv8uj9uhka0hbe2; wiki_session=sqho3iua4gikila8pl0gfkhpp6; wikiUserID=2; wikiUserName=Ab' -H 'Connection: keep-alive' -H 'Pragma: no-cache' -H 'Cache-Control: no-cache'
#curl 'http://localhost:8080/CDAR/webapi/users' -H 'Host: localhost:8080' -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:32.0) Gecko/20100101 Firefox/32.0' -H 'Accept: application/json, text/plain, */*' -H 'Accept-Language: de-ch,de;q=0.8,en-gb;q=0.6,en;q=0.4,fr;q=0.2' -H 'Accept-Encoding: gzip, deflate' -H 'DNT: 1' -H 'Content-Type: application/json;charset=utf-8' -H 'Referer: http://localhost:8080/CDAR/cdarclient/' -H 'Content-Length: 32' -H 'Cookie: mw_installer_session=pb0fl1br5ebvv8uj9uhka0hbe2; wiki_session=sqho3iua4gikila8pl0gfkhpp6; wikiUserID=2; wikiUserName=Ab' -H 'Connection: keep-alive' -H 'Pragma: no-cache' -H 'Cache-Control: no-cache'
#curl 'http://localhost:8080/CDAR/webapi/users' -H 'Accept: application/json, text/plain, */*' -H 'Referer: http://localhost:8080/CDAR/cdarclient/' -H 'Origin: http://localhost:8080' -H 'X-DevTools-Emulate-Network-Conditions-Client-Id: 279FB7AE-D9B8-FAD8-0834-CE6A21404FA5' -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.124 Safari/537.36' -H 'Content-Type: application/json;charset=UTF-8' --data-binary '{"username":"c1","password":"c"}' --compressed
#curl 'http://localhost/mediawiki/api.php/?' -X POST -H 'Accept: application/xml, text/plain, */*' -H 'Referer: http://localhost/'                  -H 'Origin: http://localhost'      -H 'X-DevTools-Emulate-Network-Conditions-Client-Id: 279FB7AE-D9B8-FAD8-0834-CE6A21404FA5' -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.124 Safari/537.36' -H 'Content-Type: application/json;charset=UTF-8' --data-binary '{"name":"sss1","password":"s","format":"xml","action":"createaccount"}' --compressed




set +o verbose
