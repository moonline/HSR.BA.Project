#!/bin/bash

sudo apt-get update
sudo apt-get -y autoremove

echo "====== Starting installation and configuration of ADRepo ======"

echo "== Downloading ADRepo =="
if [ ! -s /vagrant/downloads/adrepo-0.1.1-SNAPSHOT.zip ]; then
	mkdir /vagrant/downloads
	curl -sS -o /vagrant/downloads/adrepo-0.1.1-SNAPSHOT.zip "https://owncloud.hsr.ch/public.php?service=files&t=8b145e68e306d226a5ad837e3209bc0d&download" ;
fi
chmod +x /vagrant/downloads/adrepo-0.1.1-SNAPSHOT.zip

echo "== Installing Unzip and Java =="
sudo apt-get -y install unzip default-jre

echo "== Extracting ADRepo =="
unzip /vagrant/downloads/adrepo-0.1.1-SNAPSHOT.zip -d /home/vagrant/ADRepo

echo "== Starting up ADRepo =="
sudo /home/vagrant/ADRepo/adrepo-0.1.1-SNAPSHOT/bin/adrepo -Dhttp.port=9940 &

echo "== Create Crontab to start ADRepo after reboot =="
( crontab -l 2>/dev/null | grep -Fv ntpdate ; printf -- "@reboot sudo /home/vagrant/ADRepo/adrepo-0.1.1-SNAPSHOT/bin/adrepo -Dhttp.port=9940 &\n" ) | crontab

echo "------ Installation and configuration of ADRepo done ------"

echo "||==================================================||"
echo "|| ADRepo is now available at http://localhost:9940 ||"
echo "||==================================================||"
