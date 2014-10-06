#!/bin/bash

sudo apt-get -y autoremove

echo "====== Starting installation and configuration of JIRA ======"

echo "== Downloading Jira =="
curl -sS -o /tmp/atlassian-jira.bin http://downloads.atlassian.com/software/jira/downloads/atlassian-jira-6.3.7-x64.bin
chmod +x /tmp/atlassian-jira.bin

echo "== Installing Jira =="
sudo /tmp/atlassian-jira.bin -q -varfile /vagrant/jira-setup.varfile

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

