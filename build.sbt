name := """eeppi"""

version := "1.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayJava)

scalaVersion := "2.11.1"

libraryDependencies ++= Seq(
  javaJdbc,
  javaEbean,
  cache,
  javaWs,
  //see latest versions under: http://mvnrepository.com/artifact/org.seleniumhq.selenium
  "org.seleniumhq.selenium"   % "selenium-api"             % "2.43.1",
  "org.seleniumhq.selenium"   % "selenium-java"            % "2.43.1",
  "org.seleniumhq.selenium"   % "selenium-support"         % "2.43.1",
  "org.seleniumhq.selenium"   % "selenium-firefox-driver"  % "2.43.1",
  "org.seleniumhq.selenium"   % "selenium-htmlunit-driver" % "2.43.1"
  //"org.seleniumhq.selenium" % "selenium-ie-driver"       % "2.43.1",
  //"org.seleniumhq.selenium" % "selenium-chrome-driver"   % "2.43.1",
)

// Jacoco
jacoco.settings

parallelExecution in jacoco.Config := false

jacoco.reportTitle in jacoco.Config := "EEPPI Code Coverage Report"

jacoco.reportFormats in jacoco.Config := Seq(de.johoop.jacoco4sbt.XMLReport(), de.johoop.jacoco4sbt.HTMLReport())

jacoco.excludes in jacoco.Config := Seq(
  "controllers.Reverse*",
  "controllers.routes*",
  "controllers.javascript.*",
  "controllers.ref.*",
  "Routes*",
  "views.*"
)
