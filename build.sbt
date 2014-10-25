//import com.arpnetworking.sbt.typescript.Import.TypescriptKeys._ //TODO Laurin: clean up this when https://github.com/ArpNetworking/sbt-typescript/issues/1 is solved

name := """eeppi"""

version := "1.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayJava, SbtWeb)

scalaVersion := "2.11.1"

libraryDependencies ++= Seq(
  javaJdbc,
  javaJpa.exclude("org.hibernate.javax.persistence", "hibernate-jpa-2.0-api"),
  javaWs,
  //see latest versions under: http://mvnrepository.com/artifact/org.hibernate
  "org.hibernate"             %  "hibernate-entitymanager" % "4.3.6.Final",
  //see latest version under: http://mvnrepository.com/artifact/postgresql
  "postgresql"                %  "postgresql"              % "9.1-901.jdbc4",
  //see latest version under: https://repository.jboss.org/nexus/content/repositories/thirdparty-releases/org/jetbrains/annotations/
  "org.jetbrains"             % "annotations"              % "7.0.2",
  //see latest version under: http://mvnrepository.com/artifact/org.mockito
  "org.mockito"               % "mockito-all"              % "1.10.8",
  //see latest version under: http://mvnrepository.com/artifact/org.powermock
  "org.powermock"             % "powermock-core"           % "1.5.6",
  "org.powermock"             % "powermock-module-junit4"  % "1.5.6",
  "org.powermock"             % "powermock-api-mockito"    % "1.5.6",
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

// Typescript compiler
lazy val compileTS = taskKey[Seq[File]]("Compiling the TypeScript files to JavaScript files")

compileTS := {
  "echo Compiling TypeScript files now.".!
  val sourceFile = (sourceDirectory in Assets).value / "scripts" / "Main.ts"
  val targetFile = WebKeys.webTarget.value / "Main.js"
  ("rmdir "+targetFile).!
  ("tsc --target ES5 --out "+targetFile+" "+sourceFile).!
  val testTargetFile = WebKeys.webTarget.value / "Tests.js"
  val testSourceFile = baseDirectory.value / "public" / "test" / "Tests.ts"
  ("rmdir "+testTargetFile).!
  ("tsc --target ES5 --out "+testTargetFile+" "+testSourceFile).!
  Seq(targetFile, testTargetFile)
}

(resourceGenerators in Assets) <+= compileTS
