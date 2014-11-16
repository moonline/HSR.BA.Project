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
		project: {
			list: { method: 'GET', url: '/project' }
		},
		projectPlanningTool: {
			list: { method: 'GET', url: '/ppt' }
		},
		mapping: {
			list: { method: 'GET', url: '/dksMapping' },
			detail: { method: 'GET', url: '/dksMapping/{id}' },
			create: { method: 'POST', url: '/dksMapping' },
			update: { method: 'POST', url: '/dksMapping/{id}' },
			remove: { method: 'POST', url: '/dksMapping/{id}/delete' }
		},
		processor: {
			list: { method: 'GET', url: '/processor' },
			detail: { method: 'GET', url: '/processor/{id}' },
			create: { method: 'POST', url: '/processor' },
			update: { method: 'POST', url: '/processor/{id}' },
			remove: { method: 'POST', url: '/processor/{id}/delete' }
		},
		taskTemplate: {
			list: { method: 'GET', url: '/taskTemplate' },
			detail: { method: 'GET', url: '/taskTemplate/{id}' },
			create: { method: 'POST', url: '/taskTemplate' },
			remove: { method: 'POST', url: '/taskTemplate/{id}/delete' },
			update: { method: 'POST', url: '/taskTemplate/{id}' },
			updateProperty: { method: 'POST', url: '/taskTemplate/{id}/properties/{propertyId}'},
			addProperty: { method: 'POST', url: '/taskTemplate/{id}/addProperty'},
			removeProperty: { method: 'POST', url: '/taskTemplate/{id}/properties/{propertyValueId}/delete' }
		},
		pptAccount: {
			list: { method: 'GET', url: '/user/pptAccount' },
			detail: { method: 'GET', url: '/user/pptAccount/{id}' },
			create: { method: 'POST', url: '/user/pptAccount' },
			update: { method: 'POST', url: '/user/pptAccount/{id}' },
			remove: { method: 'POST', url: '/user/pptAccount/{id}/delete' }
		},
		taskProperty: {
			list: { method: 'GET', url: '/taskProperty' },
			detail: { method: 'GET', url: '/taskProperty/{id}' },
			create: { method: 'POST', url: '/taskProperty' },
			update: { method: 'POST', url: '/taskProperty/{id}' },
			remove: { method: 'POST', url: '/taskProperty/{id}/delete' }
		},
		requestTemplate: {
			list: { method: 'GET', url: '/pptMapping' },
			detail: { method: 'GET', url: '/pptMapping/{id}' },
			create: { method: 'POST', url: '/pptMapping' },
			update: { method: 'POST', url: '/pptMapping/{id}' },
			remove: { method: 'POST', url: '/pptMapping/{id}/delete' }
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