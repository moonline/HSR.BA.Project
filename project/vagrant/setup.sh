#!/bin/bash

echo "== Downloading EEPPI =="
if [ ! -s /vagrant/downloads/eeppi-latest.zip ]; then
	mkdir /vagrant/downloads
	curl -L -z /vagrant/downloads/eeppi-latest.zip -sS -o /vagrant/downloads/eeppi-latest.zip "https://www.dropbox.com/s/86btsuiae9zungl/eeppi-latest.zip?dl=1"
fi
chmod +x /vagrant/downloads/eeppi-latest.zip

echo "== Installing Unzip =="
sudo apt-get -y install unzip

echo "== Installing Java 8 =="
sudo add-apt-repository -y ppa:webupd8team/java
sudo apt-get update
echo oracle-java8-installer shared/accepted-oracle-license-v1-1 select true | sudo /usr/bin/debconf-set-selections
sudo apt-get -y install oracle-java8-installer

echo "== Extracting EEPPI =="
unzip /vagrant/downloads/eeppi-latest.zip -d /home/vagrant/eeppi_zip/
mv /home/vagrant/eeppi_zip/`ls -1 /home/vagrant/eeppi_zip/ | tail -n 1` /home/vagrant/eeppi/
rmdir /home/vagrant/eeppi_zip

echo "== Starting up EEPPI =="
sudo /home/vagrant/eeppi/bin/eeppi -Dhttp.port=9990 -DapplyDownEvolutions.default=true -DapplyEvolutions.default=true &

echo "== Create Crontab to start EEPPI after reboot =="
( crontab -l 2>/dev/null | grep -Fv ntpdate ; printf -- "@reboot sudo /home/vagrant/eeppi/bin/eeppi -Dhttp.port=9990 -DapplyDownEvolutions.default=true -DapplyEvolutions.default=true &\n" ) | crontab

echo "------ Installation and configuration of EEPPI done ------"

echo "||=================================================||"
echo "|| EEPPI is now available at http://localhost:9990 ||"
echo "||=================================================||"
