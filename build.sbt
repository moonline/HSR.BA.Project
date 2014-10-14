//import com.arpnetworking.sbt.typescript.Import.TypescriptKeys._ //TODO Laurin: clean up this when https://github.com/ArpNetworking/sbt-typescript/issues/1 is solved

name := """eeppi"""

version := "1.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayJava, SbtWeb)

scalaVersion := "2.11.1"

libraryDependencies ++= Seq(
  javaJdbc,
  javaJpa.exclude("org.hibernate.javax.persistence", "hibernate-jpa-2.0-api"),
  //see latest versions under: http://mvnrepository.com/artifact/org.hibernate
  "org.hibernate"             %  "hibernate-entitymanager" % "4.3.6.Final",
  //see latest version under: http://mvnrepository.com/artifact/postgresql
  "postgresql"                %  "postgresql"              % "9.1-901.jdbc4",
  //see latest version under: https://repository.jboss.org/nexus/content/repositories/thirdparty-releases/org/jetbrains/annotations/
  "org.jetbrains"             % "annotations"              % "7.0.2",
  //see latest versions under: http://mvnrepository.com/artifact/org.seleniumhq.selenium
  "org.seleniumhq.selenium"   % "selenium-api"             % "2.43.1",
  "org.seleniumhq.selenium"   % "selenium-java"            % "2.43.1",
  "org.seleniumhq.selenium"   % "selenium-support"         % "2.43.1",
  "org.seleniumhq.selenium"   % "selenium-firefox-driver"  % "2.43.1",
  "org.seleniumhq.selenium"   % "selenium-htmlunit-driver" % "2.43.1"
  //"org.seleniumhq.selenium" % "selenium-ie-driver"       % "2.43.1",
  //"org.seleniumhq.selenium" % "selenium-chrome-driver"   % "2.43.1",
)

resolvers ++= Seq(
  // IDEA Nullable Annotations
  "idea nullable" at "https://repository.jboss.org/nexus/content/repositories/thirdparty-releases"
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

// LESS compiler
includeFilter in (Assets, LessKeys.less) := "*.less"

// for minified *.min.css files instead of "normal" *.css files generated from the *less files
// LessKeys.compress := true

///////// enables debuging in tests
Keys.fork in Test := false

///////// blames you, if you use unchecked conversions
javacOptions += "-Xlint:unchecked"


///////////////////////////// TODO Laurin: Clean up here /////////////////////////////

// Typescript compiler
// possible configurations if https://github.com/ArpNetworking/sbt-typescript/issues/1 is solved
//includeFilter in TypescriptKeys.typescript := "Main.ts"
//TypescriptKeys.removeComments := true
//outFile := "mainexample.js"
//moduleKind := "commonjs"
//outDir := "x"

lazy val compileTS = taskKey[Unit]("Compiling the TypeScript files to JavaScript files")

compileTS := {
  "tsc --target ES5 --out public/scripts/Main.js app/assets/scripts/Main.ts".!
}

//(compile in Compile) <<= (compile in Compile) dependsOn (compileTS)
(compile in Compile) <<= (compile in Compile) dependsOn compileTS
//sourceGenerators in Compile += compileTS.taskValue

mappings in (Compile, packageBin) += {
  (baseDirectory.value / "public" / "mainexample.js") -> "xyz.js"
}


//resourceGenerators in Compile += Def.task {
//  val file = (resourceManaged in Compile).value / "mainexample.js"
//  "tsc --target ES5 --out "+file.getPath+" app/assets/mainexample.ts".!
//  Seq(file)
//}.taskValue

///////////////////////////////////// until here /////////////////////////////////////
