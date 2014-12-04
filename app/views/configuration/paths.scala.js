if(!window.configuration) { window.configuration = {}; }

window.configuration.paths = {
	dks: {
		remoteProxy: { url: '@controllers.dks.routes.DecisionKnowledgeSystemController.getFromDKS("{target}")' }
	},
	problem: {
		list: { method: 'GET', url: '/element?query=type%2520is%2520%2522ProblemTemplate%2522' }
	},
	decision: {
		list: { method: 'GET', url: '/element?query=type%2520is%2520%2522ProblemOccurrence%2522' }
	},
	alternative: {
		list: { method: 'GET', url: '/element?query=type%2520is%2520%2522OptionTemplate%2522' }
	},
	option: {
		list: { method: 'GET', url: '/element?query=type%2520is%2520%2522OptionOccurrence%2522' }
	},
	decisionKnowledgeSystem: {
		list: { method: 'GET', url: '@controllers.dks.routes.DecisionKnowledgeSystemController.readAll()' },
		detail: { method: 'GET', url: '@controllers.dks.routes.DecisionKnowledgeSystemController.read(42).url.replaceAll("42","{id}")' },
		update: { method: 'POST', url: '@controllers.dks.routes.DecisionKnowledgeSystemController.update(42).url.replaceAll("42","{id}")' }
	},
	project: {
		list: { method: 'GET', url: '@controllers.user.routes.ProjectController.readAll()' }
	},
	projectPlanningTool: {
		list: { method: 'GET', url: '@controllers.ppt.routes.ProjectPlanningToolController.readAll()' },
		transmit: { method: 'POST', url: '@controllers.ppt.routes.ProjectPlanningToolController.createPPTTask()'}
	},
	mapping: {
		list: { method: 'GET', url: '@controllers.dks.routes.DecisionKnowledgeSystemMappingController.readAll()' },
		detail: { method: 'GET', url: '@controllers.dks.routes.DecisionKnowledgeSystemMappingController.read(42).url.replaceAll("42","{id}")' },
		create: { method: 'POST', url: '@controllers.dks.routes.DecisionKnowledgeSystemMappingController.create()' },
		update: { method: 'POST', url: '@controllers.dks.routes.DecisionKnowledgeSystemMappingController.update(42).url.replaceAll("42","{id}")' },
		remove: { method: 'POST', url: '@controllers.dks.routes.DecisionKnowledgeSystemMappingController.delete(42).url.replaceAll("42","{id}")/delete' }
	},
	processor: {
		list: { method: 'GET', url: '@controllers.ppt.routes.ProcessorController.readAll()' },
		detail: { method: 'GET', url: '@controllers.ppt.routes.ProcessorController.read(42).url.replaceAll("42","{id}")' },
		create: { method: 'POST', url: '@controllers.ppt.routes.ProcessorController.create()' },
		update: { method: 'POST', url: '@controllers.ppt.routes.ProcessorController.update(42).url.replaceAll("42","{id}")' },
		remove: { method: 'POST', url: '@controllers.ppt.routes.ProcessorController.delete(42).url.replaceAll("42","{id}")/delete' }
	},
	taskTemplate: {
		list: { method: 'GET', url: '@controllers.task.routes.TaskTemplateController.readAll()' },
		detail: { method: 'GET', url: '@controllers.task.routes.TaskTemplateController.read(42).url.replaceAll("42","{id}")' },
		create: { method: 'POST', url: '@controllers.task.routes.TaskTemplateController.create()' },
		update: { method: 'POST', url: '@controllers.task.routes.TaskTemplateController.update(42).url.replaceAll("42","{id}")' },
		remove: { method: 'POST', url: '@controllers.task.routes.TaskTemplateController.delete(42).url.replaceAll("42","{id}")/delete' },
		updateProperty: { method: 'POST', url: '@controllers.task.routes.TaskTemplateController.updateProperty(123, 42).url.replaceAll("42","{id}").replaceAll("123","{propertyId}")'},
		addProperty: { method: 'POST', url: '@controllers.task.routes.TaskTemplateController.addProperty(42).url.replaceAll("42","{id}")'},
		removeProperty: { method: 'POST', url: '@controllers.task.routes.TaskTemplateController.deleteProperty(123, 42).url.replaceAll("42","{id}").replaceAll("123","{propertyValueId}")/delete' }
	},
	pptAccount: {
		list: { method: 'GET', url: '@controllers.user.routes.PPTAccountController.readAll()' },
		detail: { method: 'GET', url: '@controllers.user.routes.PPTAccountController.read(42).url.replaceAll("42","{id}")' },
		create: { method: 'POST', url: '@controllers.user.routes.PPTAccountController.create()' },
		update: { method: 'POST', url: '@controllers.user.routes.PPTAccountController.update(42).url.replaceAll("42","{id}")' },
		remove: { method: 'POST', url: '@controllers.user.routes.PPTAccountController.delete(42).url.replaceAll("42","{id}")/delete' }
	},
	taskProperty: {
		list: { method: 'GET', url: '@controllers.task.routes.TaskPropertyController.readAll()' },
		detail: { method: 'GET', url: '@controllers.task.routes.TaskPropertyController.read(42).url.replaceAll("42","{id}")' },
		create: { method: 'POST', url: '@controllers.task.routes.TaskPropertyController.create()' },
		update: { method: 'POST', url: '@controllers.task.routes.TaskPropertyController.update(42).url.replaceAll("42","{id}")' },
		remove: { method: 'POST', url: '@controllers.task.routes.TaskPropertyController.delete(42).url.replaceAll("42","{id}")/delete' }
	},
	requestTemplate: {
		list: { method: 'GET', url: '@controllers.ppt.routes.RequestTemplateController.readAll()' },
		detail: { method: 'GET', url: '@controllers.ppt.routes.RequestTemplateController.read(42).url.replaceAll("42","{id}")' },
		create: { method: 'POST', url: '@controllers.ppt.routes.RequestTemplateController.create()' },
		update: { method: 'POST', url: '@controllers.ppt.routes.RequestTemplateController.update(42).url.replaceAll("42","{id}")' },
		remove: { method: 'POST', url: '@controllers.ppt.routes.RequestTemplateController.delete(42).url.replaceAll("42","{id}")/delete' }
	},
	user: {
		login: { method: 'POST', url: '@controllers.user.routes.UserController.login()' },
		logout: { method: 'POST', url: '@controllers.user.routes.UserController.logout()' },
		status: { method: 'GET', url: '@controllers.user.routes.UserController.loginStatus()' },
		register: { method: 'POST', url: '@controllers.user.routes.UserController.register()' },
		changePassword: { method: 'POST', url: '@controllers.user.routes.UserController.changePassword()' }
	}
};