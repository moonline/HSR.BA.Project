# Vagrant Projectplanningtool Test Environment

This Vagrant configuration sets up some project planning tools to be used for testing purpose.

## Features
* an [Atlassian JIRA](https://www.atlassian.com/software/jira) 6.3.7
* a [Redmine](http://www.redmine.org/) 2.4.2

## Setup instructions
1. Get your own JIRA (evaluation) license from https://my.atlassian.com
2. Save it in a new `jira-license.key`-file next to the `Vagrantfile`
3. Simply run `vagrant up` (assuming you have installed [Vagrant](https://www.vagrantup.com/downloads.html) and [are ready to start](https://docs.vagrantup.com/v2/getting-started/index.html) with it)

Note: Redmine doesn't need a license, it's licensed under the [GNU General Public License v2 (GPL)](http://www.gnu.org/licenses/old-licenses/gpl-2.0.html).


## Access

Feature | URL | Username | Password
--------|-----|:--------:|:--------:
Jira | http://localhost:9920 | admin | admin
Redmine | http://localhost:9930 | admin | admin