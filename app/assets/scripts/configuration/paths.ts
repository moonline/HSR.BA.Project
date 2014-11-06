module configuration {
	export var paths:any = {
		dks: {
			remoteProxy: { url: '/dks/getFromDKS?url={target}' }
		},
		problem: {
			list: { method: 'GET', url: '/element' }
		},
		decision: {
			list: { method: 'GET', url: '/element' }
		},
		decisionKnowledgeSystem: {
			list: { method: 'GET', url: '/public/temporaryDevelopmentData/dks/decisionKnowledgeSystem.json' }
		},
		mapping: {
			list: { method: 'GET', url: '/public/temporaryDevelopmentData/eeppi/mapping/list.json' }
		},
		taskTemplate: {
			list: { method: 'GET', url: '/taskTemplate' },
			detail: { method: 'GET', url: '/taskTemplate/{id}' },
			create: { method: 'POST', url: '/taskTemplate' },
			remove: { method: 'POST', url: '/taskTemplate/{id}/delete' },
			update: { method: 'POST', url: '/taskTemplate/{id}' },
			updateProperty: { method: 'POST', url: '/taskTemplate/{id}/properties/{propertyId}'}
		},
		taskProperty: {
			list: { method: 'GET', url: '/public/temporaryDevelopmentData/eeppi/taskProperty.json' }
		},
		user: {
			login: { method: 'POST', url: '/user/login' },
			logout: { method: 'POST', url: '/user/logout' },
			status: { method: 'GET', url: '/user/loginStatus' },
			register: { method: 'POST', url: '/user/register' },
			changePassword: { method: 'POST', url: '/user/changePassword' }
		}
	}
}