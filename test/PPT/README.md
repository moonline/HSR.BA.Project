# Vagrant Projectplanningtool Test Environment

This Vagrant configuration sets up some project planning tools to be used for testing purpose.

## Features
* an Atlassian Jira 6.3.7
* maybe later on also an Redmine under http://localhost:9930

## Setup instructions
1. Get your own JIRA (evaluation) license from https://my.atlassian.com
2. Save it in a new `jira-license.key`-file next to the `Vagrantfile`
3. Simply run `vagrant up` (assuming you have installed [Vagrant](https://www.vagrantup.com/downloads.html) and [are ready to start](https://docs.vagrantup.com/v2/getting-started/index.html) with it)

## Access

Feature | URL | Username | Password
--------|-----|:--------:|:--------:
Jira | http://localhost:9920 | admin | admin