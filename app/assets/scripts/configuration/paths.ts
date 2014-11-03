module configuration {
	export var paths = {
		dks: {
			remoteProxy: '/dks/getFromDKS?url={target}'
		},
		problem: {
			//list: '/public/temporaryDevelopmentData/dks/element.json'
			list: '/element'
		},
		decision: {
			list: '/element'
		},
		decisionKnowledgeSystem: {
			list: '/public/temporaryDevelopmentData/dks/decisionKnowledgeSystem.json'
		},
		mapping: {
			list: '/public/temporaryDevelopmentData/eeppi/mapping/list.json'
		},
		taskTemplate: {
			list: '/taskTemplate',
			detail: '/taskTemplate/{id}',
			create: '/taskTemplate'
		},
		taskProperty: {
			list: '/public/temporaryDevelopmentData/eeppi/taskProperty.json'
		},
		user: {
			'login':'/user/login',
			'logout':'/user/logout',
			'status': '/user/loginStatus',
			'register': '/user/register',
			'changePassword': '/user/changePassword'
		}
	}
}