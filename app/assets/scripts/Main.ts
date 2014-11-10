/// <reference path='libraries/declarations/angularJs/angular.d.ts' />
/// <reference path='classes/module/MainModule.ts' />


module app {
    'use strict';

	var mainModule = new app.mod.MainModule(angular,"MainModule");
    angular.bootstrap(document, [mainModule.name]);
}