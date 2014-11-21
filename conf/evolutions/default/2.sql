# --- !Ups

-- Creating PPTs
INSERT INTO PPT ( ID , NAME ) VALUES (nextval('entity_seq'), 'Project Planning Tool');

-- Creating Project
INSERT INTO PROJECT ( ID , NAME ) VALUES (nextval('entity_seq'), 'Project');

-- Creating Demo-User
INSERT INTO PERSON ( ID , NAME , PASSWORDHASH , SALT ) VALUES (nextval('entity_seq'), 'demo', 'aa3930e18d032220288660c7f43e9640e38e08b8', 'e0cf15d8f8651ec060313b6d7601e0afc458d5c8');
INSERT INTO PPTACCOUNT ( ID , PPTURL , PPT_ID , PPTUSERNAME, PPTPASSWORD  , USER_ID) VALUES (nextval('entity_seq'), 'http://localhost:9920', (SELECT id FROM PPT WHERE name='Project Planning Tool'), 'admin', 'admin', (SELECT id FROM PERSON WHERE name='demo'));

-- Creating Task Properties
INSERT INTO TASKPROPERTY (ID, NAME) VALUES
	(nextval('entity_seq'), 'Assignee'),
	(nextval('entity_seq'), 'Type'),
	(nextval('entity_seq'), 'Description'),
	(nextval('entity_seq'), 'Priority'),
	(nextval('entity_seq'), 'Due Date'),
	(nextval('entity_seq'), 'Estimated Duration');

-- Creating Task Templates
INSERT INTO TASKTEMPLATE (ID, NAME, PARENT_ID) VALUES (nextval('entity_seq'), 'Define criterions', null);
INSERT INTO TASKPROPERTYVALUE(ID, "VALUE", PROPERTY_ID, TASK_ID) VALUES (nextval('entity_seq'),'Project Planner',(SELECT id FROM TASKPROPERTY WHERE name='Assignee'),(SELECT id FROM TASKTEMPLATE WHERE name='Define criterions'));
INSERT INTO TASKPROPERTYVALUE(ID, "VALUE", PROPERTY_ID, TASK_ID) VALUES (nextval('entity_seq'),'Task',           (SELECT id FROM TASKPROPERTY WHERE name='Type'    ),(SELECT id FROM TASKTEMPLATE WHERE name='Define criterions'));
INSERT INTO DKSMAPPING(ID, TASKTEMPLATE_ID, DKSNODE) VALUES (nextval('entity_seq'), (SELECT id FROM TASKTEMPLATE WHERE name='Define criterions'),'3');


INSERT INTO TASKTEMPLATE (ID, NAME, PARENT_ID) VALUES (nextval('entity_seq'), 'Rank criterions', null);
INSERT INTO TASKPROPERTYVALUE(ID, "VALUE", PROPERTY_ID, TASK_ID) VALUES (nextval('entity_seq'),'Customer',       (SELECT id FROM TASKPROPERTY WHERE name='Assignee'),(SELECT id FROM TASKTEMPLATE WHERE name='Rank criterions'));
INSERT INTO TASKPROPERTYVALUE(ID, "VALUE", PROPERTY_ID, TASK_ID) VALUES (nextval('entity_seq'),'Task',           (SELECT id FROM TASKPROPERTY WHERE name='Type'    ),(SELECT id FROM TASKTEMPLATE WHERE name='Rank criterions'));
INSERT INTO DKSMAPPING(ID, TASKTEMPLATE_ID, DKSNODE) VALUES (nextval('entity_seq'), (SELECT id FROM TASKTEMPLATE WHERE name='Rank criterions'),'3'), (nextval('entity_seq'), (SELECT id FROM TASKTEMPLATE WHERE name='Rank criterions'),'6');

INSERT INTO TASKTEMPLATE (ID, NAME, PARENT_ID) VALUES (nextval('entity_seq'), 'Define criterion values', null);
INSERT INTO TASKPROPERTYVALUE(ID, "VALUE", PROPERTY_ID, TASK_ID) VALUES (nextval('entity_seq'),'Project Planner',(SELECT id FROM TASKPROPERTY WHERE name='Assignee'),(SELECT id FROM TASKTEMPLATE WHERE name='Define criterion values'));
INSERT INTO TASKPROPERTYVALUE(ID, "VALUE", PROPERTY_ID, TASK_ID) VALUES (nextval('entity_seq'),'Task',           (SELECT id FROM TASKPROPERTY WHERE name='Type'    ),(SELECT id FROM TASKTEMPLATE WHERE name='Define criterion values'));
INSERT INTO TASKPROPERTYVALUE(ID, "VALUE", PROPERTY_ID, TASK_ID) VALUES (nextval('entity_seq'),'Rank every item for every criterion.',           (SELECT id FROM TASKPROPERTY WHERE name='Description'),(SELECT id FROM TASKTEMPLATE WHERE name='Define criterion values'));
INSERT INTO DKSMAPPING(ID, TASKTEMPLATE_ID, DKSNODE) VALUES (nextval('entity_seq'), (SELECT id FROM TASKTEMPLATE WHERE name='Define criterion values'),'3');

INSERT INTO TASKTEMPLATE (ID, NAME, PARENT_ID) VALUES (nextval('entity_seq'), 'Hold decision meeting', null);
INSERT INTO TASKPROPERTYVALUE(ID, "VALUE", PROPERTY_ID, TASK_ID) VALUES (nextval('entity_seq'),'Task',           (SELECT id FROM TASKPROPERTY WHERE name='Type'    ),(SELECT id FROM TASKTEMPLATE WHERE name='Hold decision meeting'));

INSERT INTO TASKTEMPLATE (ID, NAME, PARENT_ID) VALUES (nextval('entity_seq'), 'Invite to decision meeting', (SELECT id FROM TASKTEMPLATE WHERE name='Hold decision meeting'));
INSERT INTO TASKPROPERTYVALUE(ID, "VALUE", PROPERTY_ID, TASK_ID) VALUES (nextval('entity_seq'),'Sub Task',       (SELECT id FROM TASKPROPERTY WHERE name='Type'    ),(SELECT id FROM TASKTEMPLATE WHERE name='Hold decision meeting'));

-- Creating Mappings / Request templates
INSERT INTO MAPPING (ID, REQUESTTEMPLATE, URL, PROJECT_ID, PPT_ID) VALUES (nextval('entity_seq'),CONCAT('{
','	"fields": {
','		"project": {
','			"key": "${pptProject}"
','		},
','		"summary": "${taskTemplate.name}",
',' 	"description": "${taskTemplate.attributes.description}.
','
','Decision: ${decision.name}
','DKS link: ${decision.self}
','Attributes:
','$objecttostring:(decision.attributes, ": ", "
','")$",
',' 	"duedate": "${taskTemplate.attributes.dueDate}",
',' 	"issuetype": {
','			"name": "${taskTemplate.attributes.type}"
','		},
',' 	"priority": {
','			"name": "${taskTemplate.attributes.priority}"
','		},
',' 	"assignee": {
','			"name": "${taskTemplate.attributes.assignee}"
','		},
','		"timetracking": {
','			"originalEstimate": "${taskTemplate.attributes.remainingEstimate}"
','		}
','	}
}'),'/rest/api/2/issue',(SELECT id FROM PROJECT WHERE name='Project'),(SELECT id FROM PPT WHERE name='Project Planning Tool'));

-- Creating Processors
INSERT INTO PROCESSOR (ID, CODE, NAME, PROJECT_ID) VALUES (nextval('entity_seq'),CONCAT('function(list, separator1, separator2) {
','	var separator1 = separator1 || ": "&#SEMICOLON
','	var separator2 = separator2 || ", "&#SEMICOLON
','	var text = ""&#SEMICOLON
','	var keys = Object.keys(list)&#SEMICOLON
','	keys.forEach(function(key, index){
','		text += key+separator1+list[key]&#SEMICOLON
','		if(index < keys.length-1) { text += separator2&#SEMICOLON }
','	})&#SEMICOLON
','	return text&#SEMICOLON
}'),'objecttostring',(SELECT id FROM PROJECT WHERE name='Project'));

# --- !Downs

delete from task;
delete from mapping;
delete from processor;
delete from pptaccount;
delete from person;
delete from ppt;
delete from taskpropertyvalue;
delete from taskproperty;
delete from dksmapping;
delete from tasktemplate;
delete from project;
