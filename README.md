HSR.BA.Project
==============

Bachelor thesis "Design Decisions as Project Planning Instrument" (Entwurfsentscheidungen als Projektplanungsinstrument - EEPPI) implementation
by Laurin Murer and Tobias Blaser.



1. EEPPI API Documentation
--------------------------

The description for the API is generated on runtime by reflection and
can be found at [/rest/api/documentation](http://localhost:9000/rest/api/documentation).



2. Productive installation
--------------------------

### 2.1. Requirements

* Hosting Server, recommended Linux
* Database if you won't use the inmemory database of play
* JDK Version 1.8.0_25+
* Lates Build of EEPPI


### 2.2. Configuration

* Server: See [Additional configuration of Play](https://www.playframework.com/documentation/2.3.x/ProductionConfiguration).
* Client: The configuration in  [/public/configuration/application.js](http://localhost:9000/public/configuration/application.js) and [/configuration/paths.js](http://localhost:9000/configuration/paths.js) are rewritable by [/public/configuration/custom.js](http://localhost:9000/public/configuration/custom.js). Add your configuration there.
* Client visual appearance: Add style rules to [/public/configuration/custom.css](http://localhost:9000/public/configuration/custom.css) to rewrite the visual appearance of EEPPI, e.g. to integrate EEPPI in your corporation intranet.


### 2.3. Setup instructions

1. Get and unzip the latest build
2. run `bin/eeppi` on Unix or `bin/eeppi.bat` on Windows
3. Find EEPPI at http://localhost:9000 or the port you configured



3. Data import / export
-----------------------

The EEPPI application is independent of the choosen persistence.

* Inmemory DB: Simply copy the db file to another EEPPI installation to get your data to an other installation
* Hosted database, e.g. PostgreSQL, MariaDB: Use the shipped dumping tools to export and import your data.



4. Development
--------------

### 4.1. Requirements

* JDK Version 1.8.0_25
* Typescript compiler
  1. Install [Node.js](http://nodejs.org/)
  	* Linux: `sudo apt-get install nodejs`
  	* Windows / Mac OS X: [http://nodejs.org/download/]
  2. Install Typescript compiler
  	* Linux/Mac OS X:  `sudo npm install -g typescript`
* Firefox to run client tests and behaviour tests (selenium tests)
  1. Install [Firefox](https://www.mozilla.org/)
* (optional) Buildserver / Buildserver UI: If you would like to build EEPPI using a build server like Jenkins, you need to install a graphical user interface to run the client tests and the selenium tests.
    * Linux: `sudo apt-get install xvfb`

* [Play Framework](https://www.playframework.com/documentation/2.3.6/Installing) 2.3.6
* Latest EEPPI Build


### 4.2. Usage
* Run `./activator` in this project to start the Play console
  * Optional restrict the memory for java: `./activator -mem 256`
  * Optional debug mode: `./activator -jvm-debug 9999`
  * Optional exclude integration tests: `./activator -DtestScope=noVagrantTests`
* In the play console the following commands are especially useful:
  * `run` to start this project under http://localhost:9000
  * `test` to run all tests
  * `build` to build the project to target/universal/eeppi-1.0.zip
  * `compile` to just compile the code without running anyting


### 4.3. Environment integration test VM's

There are some virtual environments you can use to test EEPPI:

- ADRepo Installation: /test/tools/vagrants/ADRepo
- CDAR Installation: /test/tools/vagrants/CDAR
- Redmine/Jira Installation: /test/tools/vagrants/PPT
	* Please copy your Jira License to /test/tools/vagrants/PPT before start the environment

There is a vagrant environment containing EEPPI, ADRepo and Jira you can use to test EEPPI fully integrated.:
- /project/vagrant/
	* Please copy your Jira License to /test/tools/vagrants/PPT before starting the environment


#### 4.3.1. Requirements

- [Virtualbox](https://www.virtualbox.org)
- [Vagrant](www.vagrantup.com)


#### 4.3.2. Usage

To start an virtual environment:

1. Go to the corresponding directory (e.q. 'cd /test/tools/vagrants/ADRepo' on linux)
2. Run 'vagrant up' to start the environment
	- This will take some time and needs an internet connection to load the box and the software packages
	- After successfull installation and configuration, the environment is ready and the services are reachable using the printed host:port.
3. To stop the environment, run 'vagrant halt', to destroy (throw it away and generate it new on next 'vagrant up') run 'vagrant destroy'.


#### 4.3.3. Documentation

See the README files located near every virtual environment.



### 4.4. Manual compilation of the client

In development, play will compile the TypeScript for you. But if you won't to compile it by yourself, do the following:


#### 4.4.1. Application

tsc --target ES5 --out 'htmlMainJSIncludePath' app/assets/scripts/Main.ts


#### 4.4.2. Tests

tsc --target ES5 --out 'htmlTestJSIncludePath' public/test/Tests.ts


#### 4.4.3. Run client tests

1. Compile tests manual if you didn't start the server app
2. Open public/test/index.html using a browser, recommended Firefox



### 4.5 Manual generation of client documentation

#### Requirements

* Node
    * See development requirements
* typedoc
    * npm install typedoc --global

#### Usage

typedoc --out 'targetDirectory' app/assets/scripts/Main.ts --target ES5
