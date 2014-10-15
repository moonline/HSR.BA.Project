#!/bin/bash

sudo apt-get -y autoremove

echo "====== Starting installation and configuration of JIRA ======"

echo "== Downloading Jira =="
if [ ! -s /vagrant/atlassian-jira.bin ]; then
	curl -sS -o /vagrant/atlassian-jira.bin http://downloads.atlassian.com/software/jira/downloads/atlassian-jira-6.3.7-x64.bin ;
fi
chmod +x /vagrant/atlassian-jira.bin

echo "== Installing Jira =="
sudo /vagrant/atlassian-jira.bin -q -varfile /vagrant/jira-setup.varfile

echo "== Waiting for first Jira startup =="
curl -sS http://localhost:9920 > /dev/null

echo "== Shutting down jira for further configuration =="
sudo -u jira /opt/atlassian/jira/bin/stop-jira.sh

echo "== Loading initial configuration =="
sudo cp -r /vagrant/jira-db/* /var/atlassian/application-data/jira/
sudo chown jira:jira -R /var/atlassian/application-data/jira/database
sudo chown jira:jira /var/atlassian/application-data/jira/dbconfig.xml

echo "== Adding license from file =="
sudo sed -i $'/MISSING LICENSE INFORMATION HERE/{r/vagrant/jira-license.key\n d}' /var/atlassian/application-data/jira/database/jiradb.script

echo "== Starting up jira again =="
sudo -u jira /opt/atlassian/jira/bin/start-jira.sh

echo "------ Installation and configuration of JIRA done ------"

echo "||================================================||"
echo "|| JIRA is now available at http://localhost:9920 ||"
echo "||================================================||"


echo


echo "====== Starting installation and configuration of Redmine ======"

echo "== Installing Redmine =="
sudo debconf-set-selections <<< 'redmine redmine/instances/default/dbconfig-install boolean true'
sudo debconf-set-selections <<< 'redmine redmine/instances/default/database-type select  sqlite3'
sudo apt-get -y install redmine-sqlite

echo "== Installing Apache =="
sudo apt-get -y install apache2 libapache2-mod-passenger libapache2-mod-fcgid

echo "== Configuring Apache to serve Redmine =="
sudo cp /usr/share/doc/redmine/examples/apache2-host.conf /etc/apache2/sites-enabled/redmine.conf

echo "== Enabling necessary Apache modules =="
sudo a2enmod rewrite

echo "== Changing port to 9930 =="
sudo bash -c 'echo "Listen 9930" >> /etc/apache2/ports.conf'
sudo sed -i "s/8080/9930/g" /etc/apache2/sites-enabled/redmine.conf

echo "== Installing necessary GEMs =="
sudo gem install passenger
sudo gem install bundler

echo "== Make Redmine-folder owned by Webserver-User =="
sudo chown www-data:www-data -R /usr/share/redmine

echo "== Restarting Apache =="
sudo service apache2 restart

echo "------ Installation and configuration of Redmine done ------"

echo "||===================================================||"
echo "|| Redmine is now available at http://localhost:9930 ||"
echo "||===================================================||"
