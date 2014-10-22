module configuration {
	export var paths = {
		decision: {
			list: '/public/temporaryDevelopmentData/dks/decision/list.json'
		},
		mapping: {
			list: 'public/temporaryDevelopmentData/eeppi/mapping/list.json'
		},
		taskTemplate: {
			list: 'public/temporaryDevelopmentData/eeppi/tasktemplate/list.json'
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