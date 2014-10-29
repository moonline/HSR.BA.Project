# --- !Ups

-- Creating PPTs
INSERT INTO PPT ( ID , NAME ) VALUES (nextval('ppt_seq'), 'Redmine'), (nextval('ppt_seq'), 'Jira');

-- Creating Demo-User
INSERT INTO PERSON ( ID , NAME , PASSWORDHASH , SALT ) VALUES (nextval('user_seq'), 'demo', 'aa3930e18d032220288660c7f43e9640e38e08b8', 'e0cf15d8f8651ec060313b6d7601e0afc458d5c8');
INSERT INTO PPTACCOUNT ( ID , PPTURL , PPT_ID , PPTUSERNAME, PPTPASSWORD  , USER_ID) VALUES (nextval('pptaccount_seq'), 'http://localhost:9920', currval('ppt_seq'), 'admin', 'admin', currval('user_seq'));



# --- !Downs

delete from pptaccount where 1=1;
delete from person where 1=1;
delete from ppt where 1=1;
