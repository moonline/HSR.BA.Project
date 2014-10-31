HSR.BA.Project
==============

"Entwurfsentscheidungen als Projektplanungsinstrument" (EEPPI) Bachelorarbeit Implementierung

The description for the API is generated at runtime and can then be found under [/api/documentation](http://localhost:9000/api/documentation).


Requirements for development
----------------------------

* JDK Version 1.8.0_25 or later
* Typescript compiler
  1. Install [Node.js](http://nodejs.org/)
  	* Linux: `sudo apt-get install nodejs`
  	* Windows / Mac OS X: [http://nodejs.org/download/]
  2. Install Typescript compiler
  	* Linux/Mac OS X:  `sudo npm install -g typescript`
* Firefox to run client tests
  1. Install [Firefox](https://www.mozilla.org/)
* This project


Testing in development
----------------------

* Run `./activator` in this project to start the Play console
  * Optional restrict the memory for java: `./activator -mem 256`
  * Optional debug mode: `./activator -jvm-debug 9999`
  * Optional exclude integration tests: `./activator -DtestScope=noIntegrationTests`
* In the play console the following commands are especially useful:
  * `run` to start this project under http://localhost:9000
  * `test` to run all tests
  * `build` to build the project to target/universal/eeppi-0.2-SNAPSHOT.zip
  * `compile` to just compile the code without running anyting


Setup instructions
------------------

1. Get and unzip the latest build
2. run `bin/eeppi` on Unix or `bin/eeppi.bat` on Windows
3. Find it at http://localhost:9000


Environment test VM's
---------------------

There are some virtual environments you can use to test EEPPI:

- ADRepo Installation: /test/integration/ADRepo
- CDAR Installation: /test/integration/CDAR
- Redmine/Jira Installation: /test/integration/PPT
	* Please copy your Jira License to /test/integration/PPT before start the environment


There is a vagrant environment containing EEPPI, ADRepo and Jira you can use to test EEPPI fully integrated:
- /project/vagrant/
	* Please copy your Jira License to /test/integration/PPT before starting the environment




# Requirements

- Virtualbox
- Vagrant


# usage

To start an virtual environment:

1. Go to the corresponding directory (e.q. 'cd /test/integration/ADRepo' on linux)
2. Run 'vagrant up' to start the environment
	- This will take some time and needs an internet connection to load the box and the software packages
	- After successfull installation and configuration, the environment is ready and the services are reachable using the printed host:port.
3. To stop the environment, run 'vagrant halt', to destroy 'vagrant destroy'.


Manual compilation of the client
--------------------------------

# Application

tsc --target ES5 --out public/scripts/Main.js app/assets/scripts/Main.ts

# Tests

tsc --target ES5 --out public/test/Tests.js public/test/Tests.ts


Run client tests
----------------

1. Compile tests manual if you didn't start the server app (play compiles the TS for you)
2. Open public/test/index.html using Firefox