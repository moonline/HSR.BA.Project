# Vagrant EEPPI Test Environment

This Vagrant configuration sets up an EEPPI-Server and some additional software that interacts with it.
It can be used for testing or demonstration purpose.

## Features
* an EEPPI-Server
* an [Atlassian JIRA](https://www.atlassian.com/software/jira)
* a [Redmine](http://www.redmine.org/)
* an [ADRepo](http://www.ifs.hsr.ch/Architectural-Refactoring-for.12044.0.html)

## Setup instructions
1. Get your own JIRA (evaluation) license from https://my.atlassian.com if you want a working Jira installed
2. Save it in a new `jira-license.key`-file next to the `Vagrantfile`
3. Simply run `vagrant up` (assuming you have installed [Vagrant](https://www.vagrantup.com/downloads.html) and [are ready to start](https://docs.vagrantup.com/v2/getting-started/index.html) with it)

## Access

Feature | URL | Username | Password
--------|-----|:--------:|:--------:
EEPPI | http://localhost:9990 | demo | demo
Jira | http://localhost:9920 | admin | admin
Redmine | http://localhost:9930 | admin | admin
ADRepo | http://localhost:9940 | |