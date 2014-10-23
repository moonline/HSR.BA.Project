module configuration {
	export var paths = {
		problem: {
			list: '/public/temporaryDevelopmentData/dks/element.json'
		},
		decision: {
			list: '/public/temporaryDevelopmentData/dks/element.json'
		},
		decisionKnowledgeSystem: {
			list: '/public/temporaryDevelopmentData/dks/decisionKnowledgeSystem.json'
		},
		mapping: {
			list: 'public/temporaryDevelopmentData/eeppi/mapping/list.json'
		},
		taskTemplate: {
			list: 'public/temporaryDevelopmentData/eeppi/tasktemplate/list.json'
		},
		taskProperty: {
			list: 'public/temporaryDevelopmentData/eeppi/taskProperty.json'
		},
		user: {
			'login':'/user/login',
			'logout':'/user/logout',
			'status': '/user/login-status',
			'register': '/user/register',
			'changePassword': '/user/change_password'
		}
	}
}