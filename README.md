HSR.BA.Project
==============

"Entwurfsentscheidungen als Projektplanungsinstrument" (EEPPI) Bachelorarbeit Implementierung


Requirements for development
----------------------------

* JDK Version 1.8.0_25 or later
* Typescript compiler
  1. Install [Node.js](http://nodejs.org/)
  2. Install Typescript compiler with `sudo npm install -g typescript`
* Firefox to run client tests
  1. Install [Firefox](https://www.mozilla.org/)
* This project


Testing in development
----------------------

* Run `./activator` in this project to start the Play console
* To exclude the integration tests, run `./activator -DtestScope=noIntegrationTests` instead
* In the play console the following commands are especially useful:
  * `run` to start this project under http://localhost:9000
  * `test` to run all tests
  * `build` to build the project to target/universal/eeppi-1.0-SNAPSHOT.zip
  * `compile` to just compile the code without running anyting


Setup instructions
------------------
1. Get and unzip the latest build
2. run `bin/eeppi` on Unix or `bin/eeppi.bat` on Windows
3. Find it at http://localhost:9000
