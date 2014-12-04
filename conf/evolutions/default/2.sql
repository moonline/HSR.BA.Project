# --- !Ups

-- Creating PPTs
INSERT INTO PPT ( ID , NAME ) VALUES (nextval('entity_seq'), 'Project Planning Tool');

-- Creating Project
INSERT INTO PROJECT ( ID , NAME ) VALUES (nextval('entity_seq'), 'Project');

-- Creating DKSs
INSERT INTO DKS ( ID , NAME , URL ) VALUES (nextval('entity_seq'), 'DKS', 'http://localhost:9940');

-- Creating Demo-User
INSERT INTO PERSON ( ID , NAME , PASSWORDHASH , SALT ) VALUES (nextval('entity_seq'), 'demo', 'aa3930e18d032220288660c7f43e9640e38e08b8', 'e0cf15d8f8651ec060313b6d7601e0afc458d5c8');
INSERT INTO PPTACCOUNT ( ID , PPTURL , PPT_ID , PPTUSERNAME, PPTPASSWORD  , USER_ID) VALUES (nextval('entity_seq'), 'http://localhost:9920', (SELECT id FROM PPT WHERE name='Project Planning Tool'), 'admin', 'admin', (SELECT id FROM PERSON WHERE name='demo'));
INSERT INTO PPTACCOUNT ( ID , PPTURL , PPT_ID , PPTUSERNAME, PPTPASSWORD  , USER_ID) VALUES (nextval('entity_seq'), 'http://localhost:9930', (SELECT id FROM PPT WHERE name='Project Planning Tool'), 'admin', 'admin', (SELECT id FROM PERSON WHERE name='demo'));


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
INSERT INTO TASKPROPERTYVALUE(ID, "VALUE", PROPERTY_ID, TASK_ID) VALUES (nextval('entity_seq'),'Project Planner',
	(SELECT id FROM TASKPROPERTY WHERE name='Assignee'),(SELECT id FROM TASKTEMPLATE WHERE name='Define criterions'));
INSERT INTO TASKPROPERTYVALUE(ID, "VALUE", PROPERTY_ID, TASK_ID) VALUES (nextval('entity_seq'),'Task',
	(SELECT id FROM TASKPROPERTY WHERE name='Type'),(SELECT id FROM TASKTEMPLATE WHERE name='Define criterions'));
INSERT INTO TASKPROPERTYVALUE(ID, "VALUE", PROPERTY_ID, TASK_ID) VALUES (nextval('entity_seq'),'Define criterions for evaluation',
	(SELECT id FROM TASKPROPERTY WHERE name='Description'),(SELECT id FROM TASKTEMPLATE WHERE name='Define criterions'));
INSERT INTO TASKPROPERTYVALUE(ID, "VALUE", PROPERTY_ID, TASK_ID) VALUES (nextval('entity_seq'),'Major',
	(SELECT id FROM TASKPROPERTY WHERE name='Priority'),(SELECT id FROM TASKTEMPLATE WHERE name='Define criterions'));
INSERT INTO TASKPROPERTYVALUE(ID, "VALUE", PROPERTY_ID, TASK_ID) VALUES (nextval('entity_seq'),'2015-01-14',
	(SELECT id FROM TASKPROPERTY WHERE name='Due Date'),(SELECT id FROM TASKTEMPLATE WHERE name='Define criterions'));
INSERT INTO TASKPROPERTYVALUE(ID, "VALUE", PROPERTY_ID, TASK_ID) VALUES (nextval('entity_seq'),'10h',
	(SELECT id FROM TASKPROPERTY WHERE name='Estimated Duration'),(SELECT id FROM TASKTEMPLATE WHERE name='Define criterions'));


INSERT INTO DKSMAPPING(ID, TASKTEMPLATE_ID, DKSNODE) VALUES (nextval('entity_seq'),
	(SELECT id FROM TASKTEMPLATE WHERE name='Define criterions'),'3');


INSERT INTO TASKTEMPLATE (ID, NAME, PARENT_ID) VALUES (nextval('entity_seq'), 'Install DB', null);
INSERT INTO TASKPROPERTYVALUE(ID, "VALUE", PROPERTY_ID, TASK_ID) VALUES (nextval('entity_seq'),'DB Developer',
	(SELECT id FROM TASKPROPERTY WHERE name='Assignee'),(SELECT id FROM TASKTEMPLATE WHERE name='Install DB'));
INSERT INTO TASKPROPERTYVALUE(ID, "VALUE", PROPERTY_ID, TASK_ID) VALUES (nextval('entity_seq'),'Task',
	(SELECT id FROM TASKPROPERTY WHERE name='Type'    ),(SELECT id FROM TASKTEMPLATE WHERE name='Install DB'));

INSERT INTO TASKTEMPLATE (ID, NAME, PARENT_ID) VALUES (nextval('entity_seq'), 'Install Server', null);
INSERT INTO TASKPROPERTYVALUE(ID, "VALUE", PROPERTY_ID, TASK_ID) VALUES (nextval('entity_seq'),'Developer',
	(SELECT id FROM TASKPROPERTY WHERE name='Assignee'),(SELECT id FROM TASKTEMPLATE WHERE name='Install Server'));
INSERT INTO TASKPROPERTYVALUE(ID, "VALUE", PROPERTY_ID, TASK_ID) VALUES (nextval('entity_seq'),'Task',
	(SELECT id FROM TASKPROPERTY WHERE name='Type'    ),(SELECT id FROM TASKTEMPLATE WHERE name='Install Server'));


INSERT INTO TASKTEMPLATE (ID, NAME, PARENT_ID) VALUES (nextval('entity_seq'), 'Rank criterions', null);
INSERT INTO TASKPROPERTYVALUE(ID, "VALUE", PROPERTY_ID, TASK_ID) VALUES (nextval('entity_seq'),'Customer',
	(SELECT id FROM TASKPROPERTY WHERE name='Assignee'),(SELECT id FROM TASKTEMPLATE WHERE name='Rank criterions'));
INSERT INTO TASKPROPERTYVALUE(ID, "VALUE", PROPERTY_ID, TASK_ID) VALUES (nextval('entity_seq'),'Task',
	(SELECT id FROM TASKPROPERTY WHERE name='Type'    ),(SELECT id FROM TASKTEMPLATE WHERE name='Rank criterions'));
INSERT INTO DKSMAPPING(ID, TASKTEMPLATE_ID, DKSNODE) VALUES (nextval('entity_seq'),
	(SELECT id FROM TASKTEMPLATE WHERE name='Rank criterions'),'3'), (nextval('entity_seq'), (SELECT id FROM TASKTEMPLATE WHERE name='Rank criterions'),'6');

INSERT INTO TASKTEMPLATE (ID, NAME, PARENT_ID) VALUES (nextval('entity_seq'), 'Define criterion values', null);
INSERT INTO TASKPROPERTYVALUE(ID, "VALUE", PROPERTY_ID, TASK_ID) VALUES (nextval('entity_seq'),'Project Planner',
	(SELECT id FROM TASKPROPERTY WHERE name='Assignee'),(SELECT id FROM TASKTEMPLATE WHERE name='Define criterion values'));
INSERT INTO TASKPROPERTYVALUE(ID, "VALUE", PROPERTY_ID, TASK_ID) VALUES (nextval('entity_seq'),'Task',
	(SELECT id FROM TASKPROPERTY WHERE name='Type'    ),(SELECT id FROM TASKTEMPLATE WHERE name='Define criterion values'));
INSERT INTO TASKPROPERTYVALUE(ID, "VALUE", PROPERTY_ID, TASK_ID) VALUES (nextval('entity_seq'),'Rank every item for every criterion.',
	(SELECT id FROM TASKPROPERTY WHERE name='Description'),(SELECT id FROM TASKTEMPLATE WHERE name='Define criterion values'));
INSERT INTO DKSMAPPING(ID, TASKTEMPLATE_ID, DKSNODE) VALUES (nextval('entity_seq'),
	(SELECT id FROM TASKTEMPLATE WHERE name='Define criterion values'),'3');

INSERT INTO TASKTEMPLATE (ID, NAME, PARENT_ID) VALUES (nextval('entity_seq'), 'Hold decision meeting', null);
INSERT INTO TASKPROPERTYVALUE(ID, "VALUE", PROPERTY_ID, TASK_ID) VALUES (nextval('entity_seq'),'Task',
	(SELECT id FROM TASKPROPERTY WHERE name='Type'    ),(SELECT id FROM TASKTEMPLATE WHERE name='Hold decision meeting'));

INSERT INTO TASKTEMPLATE (ID, NAME, PARENT_ID) VALUES (nextval('entity_seq'), 'Invite to decision meeting',
	(SELECT id FROM TASKTEMPLATE WHERE name='Hold decision meeting'));

-- Creating Request Templates
INSERT INTO REQUESTTEMPLATE (ID, NAME, REQUESTBODYTEMPLATE, URL, PROJECT_ID, PPT_ID) VALUES (nextval('entity_seq'),'Jira Example Request Template',CONCAT('{
','	"fields": {
','		"project": {
','			"key": "${pptProject}"
','		},
','		$!ifElse:(parentRequestData.key," "parent": {
','			"key": "$!{parentRequestData.key}"
','		}\, ", "")$
','		"summary": "${taskTemplate.name}",
','		"description": "${taskTemplate.attributes.Description} \nDecision: ${node.name} \nDKS link: ${node.self} \nAttributes: \n$objectToString:(node.attributes, ": ", "\n")$",
','		$ifElse:(taskTemplate.attributes.Due Date," "duedate": "${taskTemplate.attributes.Due Date}"\, ", "")$
','		"issuetype": {
','			"name": "$!ifElse:(parentRequestData.key,"Sub-task", "${taskTemplate.attributes.Type}")$"
','		},
','		$ifElse:(taskTemplate.attributes.Priority, " "priority": {
','			"name": "${taskTemplate.attributes.Priority}"
','		}\, ", "")$
','		$mapExistingAssignees:(taskTemplate.attributes.Assignee, "Project Planner:admin\,Customer:admin\,Architect:admin"," "assignee": {
','			"name": "${taskTemplate.attributes.Assignee}"
','		}\, ")$
','		$ifElse:(taskTemplate.attributes.Estimated Duration, " "timetracking": {
','			"originalEstimate": "${taskTemplate.attributes.Estimated Duration}"
','		}\, ", "")$
','		"labels": ["${node.attributes.Intellectual Property Rights}", "${node.attributes.Project Stage}", "createdByEEPPI"]
','	}
}'),'/rest/api/2/issue',(SELECT id FROM PROJECT WHERE name='Project'),(SELECT id FROM PPT WHERE name='Project Planning Tool'));

INSERT INTO REQUESTTEMPLATE (ID, NAME, REQUESTBODYTEMPLATE, URL, PROJECT_ID, PPT_ID) VALUES (nextval('entity_seq'),'Redmine Example Request Template',CONCAT('{
','	"issue": {
','		"project_id": "${pptProject}",
','		$!ifElse:(parentRequestData.issue.id,""parent_issue_id": "$!{parentRequestData.issue.id}"\,", "")$
','		"subject": "${taskTemplate.name}",
','		$mapExistingAssignees:(taskTemplate.attributes.Assignee, "Project Planner:1\,Customer:1\,Architect:1",""assigned_to_id": ${taskTemplate.attributes.Assignee}\,")$
','		$replaceTaskTemplateValueByPPTValue:(taskTemplate.attributes.Type, "Bug:1\,Feature:2\,Support:3",""tracker_id": ${taskTemplate.attributes.Type}\,")$
','		"description": "${taskTemplate.attributes.Description} \nDecision: ${node.name} \nDKS link: ${node.self} \nAttributes: \n$objectToString:(node.attributes, ": ", "\n")$"
','	}
}'),'/issues.json',(SELECT id FROM PROJECT WHERE name='Project'),(SELECT id FROM PPT WHERE name='Project Planning Tool'));

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
}'),'objectToString',(SELECT id FROM PROJECT WHERE name='Project'));

INSERT INTO PROCESSOR (ID, CODE, NAME, PROJECT_ID) VALUES (nextval('entity_seq'),CONCAT('function(condition, ifField, elseField) {
','	if(condition && ifField) {
','		return ifField&#SEMICOLON
','	} else {
','		return elseField&#SEMICOLON
','	}
}'),'ifElse',(SELECT id FROM PROJECT WHERE name='Project'));

INSERT INTO PROCESSOR (ID, CODE, NAME, PROJECT_ID) VALUES (nextval('entity_seq'),CONCAT('function(assignee, existingAssignees, assigneeJSON) {
','	if(assignee && existingAssignees && assigneeJSON) {
','		var assigneeMappingList = existingAssignees.split(",")&#SEMICOLON
','		var assigneeMapping = {}&#SEMICOLON
','		for(var ami in assigneeMappingList) {
','			var assigneeName = assigneeMappingList[ami].split(":")[0].trim()&#SEMICOLON
','			assigneeMapping[assigneeName] = assigneeMappingList[ami].split(":")[1].trim()&#SEMICOLON
','		}
','		if(assigneeMapping[assignee]) {
','			return assigneeJSON.replace(assignee, assigneeMapping[assignee])&#SEMICOLON
','		} else {
','			return ""&#SEMICOLON
','		}
','	} else {
','		return ""&#SEMICOLON
','	}
}'),'mapExistingAssignees',(SELECT id FROM PROJECT WHERE name='Project'));


INSERT INTO PROCESSOR (ID, CODE, NAME, PROJECT_ID) VALUES (nextval('entity_seq'),CONCAT('function(values, name) {
','	return (values && name && values[name]) ? values[name] : ""&#SEMICOLON
}'),'taggedValue',(SELECT id FROM PROJECT WHERE name='Project'));

INSERT INTO PROCESSOR (ID, CODE, NAME, PROJECT_ID) VALUES (nextval('entity_seq'),CONCAT('function(taskTemplateValue, valueMapping, targetCode) {
','	if(taskTemplateValue && valueMapping && targetCode) {
','		var mappingList = valueMapping.split(",")&#SEMICOLON
','		var mapping = {}&#SEMICOLON
','		for(var ami in mappingList) {
','			var valueName = mappingList[ami].split(":")[0].trim()&#SEMICOLON
','			mapping[taskTemplateValue] = mappingList[ami].split(":")[1].trim()&#SEMICOLON
','		}
','		if(mapping[taskTemplateValue]) {
','			return targetCode.replace(taskTemplateValue, mapping[taskTemplateValue])&#SEMICOLON
','		} else {
','			return ""&#SEMICOLON
','		}
','	} else {
','		return ""&#SEMICOLON
','	}
}'),'replaceTaskTemplateValueByPPTValue',(SELECT id FROM PROJECT WHERE name='Project'));

# --- !Downs

delete from task;
delete from requesttemplate;
delete from processor;
delete from pptaccount;
delete from person;
delete from ppt;
delete from taskpropertyvalue;
delete from taskproperty;
delete from dksmapping;
delete from tasktemplate;
delete from project;
