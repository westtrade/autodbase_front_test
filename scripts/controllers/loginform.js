'use strict';


angular.module('autodbaseApp')
.controller('loginFormCtrl', function ($scope, Site) {
	$scope.src = "/views/login-form.html";  
	$scope.isLoad = false;
	$scope.data = { "email" : "", "pass" : "" };

	$scope.user = Site.user;

	$scope.login = function(){
		//console.log($scope);
		//$.jGrowl("Hi");
		$scope.isLoad = true;    
	}
});  

