#!/bin/bash

echo "====== Starting installation and configuration of ADRepo ======"

echo "== Downloading ADRepo =="
if [ ! -s /vagrant/downloads/adrepo-0.1.2-SNAPSHOT.zip ]; then
	mkdir /vagrant/downloads
	curl -sS -o /vagrant/downloads/adrepo-0.1.2-SNAPSHOT.zip "https://owncloud.hsr.ch/public.php?service=files&t=6888640fc33528dc02bb3807f1a8b7de&download" ;
fi
chmod +x /vagrant/downloads/adrepo-0.1.2-SNAPSHOT.zip

echo "== Installing Unzip =="
sudo apt-get -y install unzip

echo "== Installing Java 8 =="
sudo add-apt-repository -y ppa:webupd8team/java
sudo apt-get update
echo oracle-java8-installer shared/accepted-oracle-license-v1-1 select true | sudo /usr/bin/debconf-set-selections
sudo apt-get -y install oracle-java8-installer

echo "== Extracting ADRepo =="
unzip /vagrant/downloads/adrepo-0.1.2-SNAPSHOT.zip -d /home/vagrant/ADRepo

echo "== Starting up ADRepo =="
sudo /home/vagrant/ADRepo/adrepo-0.1.2-SNAPSHOT/bin/adrepo -Dhttp.port=9940 &

echo "== Create Crontab to start ADRepo after reboot =="
( crontab -l 2>/dev/null | grep -Fv ntpdate ; printf -- "@reboot sudo /home/vagrant/ADRepo/adrepo-0.1.2-SNAPSHOT/bin/adrepo -Dhttp.port=9940 &\n" ) | crontab

echo "------ Installation and configuration of ADRepo done ------"

echo "||==================================================||"
echo "|| ADRepo is now available at http://localhost:9940 ||"
echo "||==================================================||"

sudo apt-get -yqq autoremove
