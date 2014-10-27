DROP SCHEMA IF EXISTS `cdar` ;
CREATE SCHEMA IF NOT EXISTS `cdar` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ;
USE cdar ;

DROP TABLE IF EXISTS cdar.User;
DROP TABLE IF EXISTS cdar.Tree;
DROP TABLE IF EXISTS cdar.TreeXml;
DROP TABLE IF EXISTS cdar.TreeMapping;
DROP TABLE IF EXISTS cdar.Template;
DROP TABLE IF EXISTS cdar.Node;
DROP TABLE IF EXISTS cdar.Subnode;
DROP TABLE IF EXISTS cdar.NodeLink;
DROP TABLE IF EXISTS cdar.ProjectTree;
DROP TABLE IF EXISTS cdar.ProjectTreeXml;
DROP TABLE IF EXISTS cdar.ProjectNode;
DROP TABLE IF EXISTS cdar.ProjectSubnode;
DROP TABLE IF EXISTS cdar.UserComment;
DROP TABLE IF EXISTS cdar.ProjectTreeMapping;
DROP TABLE IF EXISTS cdar.ProjectNodeLink;
DROP TABLE IF EXISTS cdar.Directory;
DROP TABLE IF EXISTS cdar.ProjectDirectory;
DROP TABLE IF EXISTS cdar.NodeMapping;
DROP TABLE IF EXISTS cdar.ProjectNodeMapping;


CREATE TABLE IF NOT EXISTS cdar.User (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  creation_time VARCHAR(20) NULL,
  last_modification_time VARCHAR(20) NULL,
  username VARCHAR(20) NOT NULL UNIQUE,
  password VARCHAR(40) NOT NULL,
  accesstoken VARCHAR(40),
  drill_hierarchy INT NOT NULL
);

CREATE TABLE IF NOT EXISTS cdar.Tree (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  creation_time VARCHAR(20) NULL,
  last_modification_time VARCHAR(20) NULL,
  title VARCHAR(45) NOT NULL
);

CREATE TABLE IF NOT EXISTS cdar.TreeXml (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  creation_time VARCHAR(20) NULL,
  last_modification_time VARCHAR(20) NULL,
  title VARCHAR(45) NOT NULL,
  xmlstring TEXT NOT NULL,
  uid INT NOT NULL,
  ktrid INT NOT NULL,
  fullflag INT NOT NULL,
  FOREIGN KEY (uid) REFERENCES cdar.User (id) ON DELETE CASCADE,
  FOREIGN KEY (ktrid) REFERENCES cdar.Tree (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cdar.TreeMapping (
  uid INT NOT NULL,
  ktrid INT NOT NULL,
  FOREIGN KEY (uid) REFERENCES cdar.User (id) ON DELETE CASCADE,
  FOREIGN KEY (ktrid) REFERENCES cdar.Tree (id) ON DELETE CASCADE,
  PRIMARY KEY (uid, ktrid)
);

CREATE TABLE IF NOT EXISTS cdar.Template (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  creation_time VARCHAR(20) NULL,
  last_modification_time VARCHAR(20) NULL,
  ktrid INT,
  title VARCHAR(45) NOT NULL,
  templatetext TEXT NULL,
  isdefault INT NOT NULL,
  decisionmade INT NOT NULL,
  issubnode INT NOT NULL,
  FOREIGN KEY (ktrid) REFERENCES cdar.Tree (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cdar.Node (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  creation_time VARCHAR(20) NULL,
  last_modification_time VARCHAR(20) NULL,
  ktrid INT,
  title VARCHAR(45),
  wikititle VARCHAR(45),
  dynamictreeflag INT NOT NULL,
  FOREIGN KEY (ktrid) REFERENCES cdar.Tree (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cdar.Subnode (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  creation_time VARCHAR(20) NULL,
  last_modification_time VARCHAR(20) NULL,
  knid INT,
  title VARCHAR(45) NOT NULL,
  wikititle VARCHAR(45),
  position INT NOT NULL,
  FOREIGN KEY (knid) REFERENCES cdar.Node (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cdar.NodeLink (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  creation_time VARCHAR(20) NULL,
  last_modification_time VARCHAR(20) NULL,
  sourceid INT,
  targetid INT,
  ksnid INT NULL,
  ktrid INT,
  FOREIGN KEY (sourceid) REFERENCES cdar.Node (id) ON DELETE CASCADE,
  FOREIGN KEY (targetid) REFERENCES cdar.Node (id) ON DELETE CASCADE,
  FOREIGN KEY (ksnid) REFERENCES cdar.Subnode (id) ON DELETE CASCADE,
  FOREIGN KEY (ktrid) REFERENCES cdar.Tree (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cdar.ProjectTree (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  creation_time VARCHAR(20) NULL,
  last_modification_time VARCHAR(20) NULL,
  title VARCHAR(45) NOT NULL
);

CREATE TABLE IF NOT EXISTS cdar.ProjectTreeXml (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  creation_time VARCHAR(20) NULL,
  last_modification_time VARCHAR(20) NULL,
  title VARCHAR(45) NOT NULL,
  xmlstring TEXT NOT NULL,
  fullflag INT NOT NULL,
  uid INT NOT NULL,
  treeid INT NOT NULL,
  FOREIGN KEY (uid) REFERENCES cdar.User (id) ON DELETE CASCADE,
  FOREIGN KEY (treeid) REFERENCES cdar.ProjectTree (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cdar.ProjectNode (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  creation_time VARCHAR(20) NULL,
  last_modification_time VARCHAR(20) NULL,
  kptid INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  wikititle VARCHAR(45),
  dynamictreeflag INT NOT NULL,
  nodestatus INT NOT NULL,
  inheritedtreeid INT,
  FOREIGN KEY (kptid) REFERENCES cdar.ProjectTree (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cdar.ProjectSubnode (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  creation_time VARCHAR(20) NULL,
  last_modification_time VARCHAR(20) NULL,
  kpnid INT,
  title VARCHAR(45) NOT NULL,
  wikititle VARCHAR(45),
  position INT NOT NULL,
  subnodestatus INT NOT NULL,
  inheritedtreeid INT,
  FOREIGN KEY (kpnid) REFERENCES cdar.ProjectNode (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cdar.UserComment (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  creation_time VARCHAR(20) NULL,
  last_modification_time VARCHAR(20) NULL,
  uid INT,
  kpnid INT,
  comment VARCHAR(200) NOT NULL,
  FOREIGN KEY (uid) REFERENCES cdar.User (id) ON DELETE CASCADE,
  FOREIGN KEY (kpnid) REFERENCES cdar.ProjectNode (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cdar.ProjectTreeMapping (
  uid INT NOT NULL,
  kptid INT NOT NULL,
  PRIMARY KEY (uid, kptid),
  FOREIGN KEY (uid) REFERENCES cdar.User (id) ON DELETE CASCADE,
  FOREIGN KEY (kptid) REFERENCES cdar.ProjectTree (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cdar.ProjectNodeLink (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  creation_time VARCHAR(20) NULL,
  last_modification_time VARCHAR(20) NULL,
  sourceid INT NOT NULL,
  targetid INT NOT NULL,
  kpnsnid INT NULL,
  kptid INT NOT NULL,
  FOREIGN KEY (sourceid) REFERENCES cdar.ProjectNode (id) ON DELETE CASCADE,
  FOREIGN KEY (targetid) REFERENCES cdar.ProjectNode (id) ON DELETE CASCADE,
  FOREIGN KEY (kpnsnid) REFERENCES cdar.ProjectSubnode (id) ON DELETE CASCADE,
  FOREIGN KEY (kptid) REFERENCES cdar.ProjectTree (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cdar.Directory (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  creation_time VARCHAR(20) NULL,
  last_modification_time VARCHAR(20) NULL,
  parentid INT NULL,
  ktrid INT NOT NULL,
  title VARCHAR(45),
  FOREIGN KEY (parentid) REFERENCES cdar.Directory (id) ON DELETE CASCADE,
  FOREIGN KEY (ktrid) REFERENCES cdar.Tree (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cdar.ProjectDirectory (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  creation_time VARCHAR(20) NULL,
  last_modification_time VARCHAR(20) NULL,
  parentid INT NULL,
  ptreeid INT NOT NULL,
  title VARCHAR(45),
  FOREIGN KEY (parentid) REFERENCES cdar.ProjectDirectory (id) ON DELETE CASCADE,
  FOREIGN KEY (ptreeid) REFERENCES cdar.ProjectTree (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cdar.NodeMapping (
  knid INT NOT NULL,
  did INT NOT NULL,
  FOREIGN KEY (knid) REFERENCES cdar.Node (id) ON DELETE CASCADE,
  FOREIGN KEY (did) REFERENCES cdar.Directory (id) ON DELETE CASCADE,
  PRIMARY KEY (knid)
);

CREATE TABLE IF NOT EXISTS cdar.ProjectNodeMapping (
  kpnid INT NOT NULL,
  pdid INT NOT NULL,
  FOREIGN KEY (kpnid) REFERENCES cdar.ProjectNode (id) ON DELETE CASCADE,
  FOREIGN KEY (pdid) REFERENCES cdar.ProjectDirectory (id) ON DELETE CASCADE,
  PRIMARY KEY (kpnid)
);
