'use strict';

angular.module('autodbaseApp')
.controller('UserCtrl', function ($scope, Site, $state) {
	$scope.$on('$stateChangeStart', 
	function(event, toState, toParams, fromState, fromParams){ 

	});

	if(!Site.user.uid) $state.transitionTo('profile.register');
});
