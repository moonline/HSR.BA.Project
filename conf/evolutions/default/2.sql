# --- !Ups

-- Creating PPTs
INSERT INTO PPT ( ID , NAME ) VALUES (nextval('ppt_seq'), 'Redmine'), (nextval('ppt_seq'), 'Jira');

-- Creating Demo-User
INSERT INTO PERSON ( ID , NAME , PASSWORDHASH , SALT ) VALUES (nextval('user_seq'), 'demo', 'aa3930e18d032220288660c7f43e9640e38e08b8', 'e0cf15d8f8651ec060313b6d7601e0afc458d5c8');
INSERT INTO PPTACCOUNT ( ID , PPTURL , PPT_ID , PPTUSERNAME, PPTPASSWORD  , USER_ID) VALUES (nextval('pptaccount_seq'), 'http://localhost:9920', currval('ppt_seq'), 'admin', 'admin', currval('user_seq'));

-- Creating Task Properties
INSERT INTO TASKPROPERTY (ID, NAME) VALUES (nextval('taskproperty_seq'), 'Assignee'), (nextval('taskproperty_seq'), 'Type'), (nextval('taskproperty_seq'), 'Description');

-- Createing Task Templates
INSERT INTO TASKTEMPLATE (ID, NAME, PARENT_ID) VALUES (nextval('tasktemplate_seq'), 'Define criterions', null);
INSERT INTO TASKPROPERTYVALUE(ID, "VALUE", PROPERTY_ID, TASKTEMPLATE_ID) VALUES (nextval('taskpropertyvalue_seq'),'Project Planner',(SELECT id FROM TASKPROPERTY WHERE name='Assignee'),currval('tasktemplate_seq'));
INSERT INTO TASKPROPERTYVALUE(ID, "VALUE", PROPERTY_ID, TASKTEMPLATE_ID) VALUES (nextval('taskpropertyvalue_seq'),'Task',           (SELECT id FROM TASKPROPERTY WHERE name='Type'    ),currval('tasktemplate_seq'));
INSERT INTO NODE(TASKTEMPLATE_ID, DKSNODE) VALUES (currval('tasktemplate_seq'),'3');


INSERT INTO TASKTEMPLATE (ID, NAME, PARENT_ID) VALUES (nextval('tasktemplate_seq'), 'Rank criterions', null);
INSERT INTO TASKPROPERTYVALUE(ID, "VALUE", PROPERTY_ID, TASKTEMPLATE_ID) VALUES (nextval('taskpropertyvalue_seq'),'Customer',       (SELECT id FROM TASKPROPERTY WHERE name='Assignee'),currval('tasktemplate_seq'));
INSERT INTO TASKPROPERTYVALUE(ID, "VALUE", PROPERTY_ID, TASKTEMPLATE_ID) VALUES (nextval('taskpropertyvalue_seq'),'Task',           (SELECT id FROM TASKPROPERTY WHERE name='Type'    ),currval('tasktemplate_seq'));
INSERT INTO NODE(TASKTEMPLATE_ID, DKSNODE) VALUES (currval('tasktemplate_seq'),'3'), (currval('tasktemplate_seq'),'6');

INSERT INTO TASKTEMPLATE (ID, NAME, PARENT_ID) VALUES (nextval('tasktemplate_seq'), 'Define criterion values', null);
INSERT INTO TASKPROPERTYVALUE(ID, "VALUE", PROPERTY_ID, TASKTEMPLATE_ID) VALUES (nextval('taskpropertyvalue_seq'),'Project Planner',(SELECT id FROM TASKPROPERTY WHERE name='Assignee'),currval('tasktemplate_seq'));
INSERT INTO TASKPROPERTYVALUE(ID, "VALUE", PROPERTY_ID, TASKTEMPLATE_ID) VALUES (nextval('taskpropertyvalue_seq'),'Task',           (SELECT id FROM TASKPROPERTY WHERE name='Type'    ),currval('tasktemplate_seq'));
INSERT INTO TASKPROPERTYVALUE(ID, "VALUE", PROPERTY_ID, TASKTEMPLATE_ID) VALUES (nextval('taskpropertyvalue_seq'),'Rank every item for every criterion.',           (SELECT id FROM TASKPROPERTY WHERE name='Description'),currval('tasktemplate_seq'));
INSERT INTO NODE(TASKTEMPLATE_ID, DKSNODE) VALUES (currval('tasktemplate_seq'),'3');

INSERT INTO TASKTEMPLATE (ID, NAME, PARENT_ID) VALUES (nextval('tasktemplate_seq'), 'Hold decision meeting', null);
INSERT INTO TASKPROPERTYVALUE(ID, "VALUE", PROPERTY_ID, TASKTEMPLATE_ID) VALUES (nextval('taskpropertyvalue_seq'),'Task',           (SELECT id FROM TASKPROPERTY WHERE name='Type'    ),currval('tasktemplate_seq'));

INSERT INTO TASKTEMPLATE (ID, NAME, PARENT_ID) VALUES (nextval('tasktemplate_seq'), 'Invite to decision meeting', (SELECT id FROM TASKTEMPLATE WHERE name='Hold decision meeting'));
INSERT INTO TASKPROPERTYVALUE(ID, "VALUE", PROPERTY_ID, TASKTEMPLATE_ID) VALUES (nextval('taskpropertyvalue_seq'),'Sub Task',       (SELECT id FROM TASKPROPERTY WHERE name='Type'    ),currval('tasktemplate_seq'));


# --- !Downs

delete from pptaccount where 1=1;
delete from person where 1=1;
delete from ppt where 1=1;
delete from taskpropertyvalue;
delete from taskproperty;
delete from node;
delete from tasktemplate;
