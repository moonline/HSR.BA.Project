#!/bin/bash

sudo apt-get -y autoremove

echo "====== Starting installation and configuration of JIRA ======"

echo "== Downloading Jira =="
if [ ! -s /vagrant/downloads/atlassian-jira-6.3.8-x32.bin ]; then
	mkdir /vagrant/downloads
	curl -sS -o /vagrant/downloads/atlassian-jira-6.3.8-x32.bin http://downloads.atlassian.com/software/jira/downloads/atlassian-jira-6.3.8-x32.bin ;
fi
chmod +x /vagrant/downloads/atlassian-jira-6.3.8-x32.bin

echo "== Installing Jira =="
sudo /vagrant/downloads/atlassian-jira-6.3.8-x32.bin -q -varfile /vagrant/jira-setup.varfile

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

echo "== Waiting for Jira to have started =="
until $(curl --output /dev/null --silent --head --fail http://localhost:9920/); do
	printf '.'
	sleep 1
done

echo "== Configuring Jira with first project =="
#Login
wget --save-cookies /tmp/cookies.txt                                 --keep-session-cookies --header='X-Atlassian-Token: no-check' --post-data 'os_username=admin&os_password=admin&os_captcha=' http://localhost:9920/rest/gadget/1.0/login -o /tmp/login.log -O /tmp/login.json
#Sudo
wget --save-cookies /tmp/cookies.txt --load-cookies /tmp/cookies.txt --keep-session-cookies --header='X-Atlassian-Token: no-check' --post-data 'webSudoPassword=admin&decorator=dialog&inline=true&webSudoIsPost=false&close=true&_=1413538948243' http://localhost:9920/secure/admin/WebSudoAuthenticate.jspa -o /tmp/websudo.log -O /tmp/websudo.json
#Source: http://stackoverflow.com/a/10660730/1937795
rawurlencode() {
  local string="${1}"
  local strlen=${#string}
  local encoded=""

  for (( pos=0 ; pos<strlen ; pos++ )); do
     c=${string:$pos:1}
     case "$c" in
        [-_.~a-zA-Z0-9] ) o="${c}" ;;
        * )               printf -v o '%%%02x' "'$c"
     esac
     encoded+="${o}"
  done
  echo "${encoded}"
}
#Update License
wget --save-cookies /tmp/cookies.txt --load-cookies /tmp/cookies.txt --keep-session-cookies --header='X-Atlassian-Token: no-check' --post-data "license=$(rawurlencode "$(cat /vagrant/jira-license.key)")&Add=Add" http://localhost:9920/secure/admin/ViewLicense.jspa -o /tmp/updateLicense.log -O /tmp/updateLicense.html
#Create Project
wget --save-cookies /tmp/cookies.txt --load-cookies /tmp/cookies.txt --keep-session-cookies --header='X-Atlassian-Token: no-check' --post-data "name=TestProjekt&key=TEST&keyEdited=true&projectTemplateWebItemKey=com.atlassian.jira-core-project-templates%3Ajira-issuetracking-item&projectTemplateModuleKey=com.atlassian.jira-core-project-templates%3Ajira-issuetracking-item" http://localhost:9920/rest/project-templates/1.0/templates -o /tmp/createProject.log -O /tmp/createProject.html


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
