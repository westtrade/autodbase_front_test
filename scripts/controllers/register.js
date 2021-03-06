'use strict';

angular.module('autodbaseApp')
.directive('unique', function ($http) {

	function checkValid (elm, attrs, ctrl) {
		if(!attrs.unique || !ctrl.$viewValue) return;

		ctrl.$setValidity('unique', false);
		elm.addClass("loading");

		return $http.get(attrs.unique, { params : { value : ctrl.$viewValue } })
		.success(function (data) {
			ctrl.$setValidity('unique', data.result ); 
		})
		.finally(function () {
			elm.removeClass("loading");
		});
	}

	return {
		restrict : "A",
		require: 'ngModel',
		link : function (scope, elm, attrs, ctrl) {
			//if(ctrl.$modelValue && ctrl.$modelValue.length) checkValid(elm, attrs, ctrl);				
			var oldVal;

			ctrl.$parsers.unshift(function(value) {
				if(oldVal) ctrl.$setValidity('unique', oldVal !== value ); 

				elm.on('blur', function() { 
					oldVal = value;
					checkValid(elm, attrs, ctrl); 	
				});

				return value;
			});
		}
	}
})

.controller('RegisterCtrl' , function ($scope, $http, Site, $log) {
	var title = "Регистрация в интернет-магазине";

	Site.title = title;
	$scope.$log = $log;


	$scope.places = {};
	$scope.data = {
		profile : {
			contractType  : undefined
			, country : undefined
			, region : undefined
			, city : undefined
			, choice : undefined
			, orgForm : undefined
			, orgName : undefined
			, orgRepresent : undefined
			, phone : undefined
			, phoneCode : undefined
		},
		user : {

		}		
	};

	$scope.user = Site.user;





	$scope.isValidOrg = function () {
		var form = $scope.registerForm;
		if($scope.data.profile.contractType === 1) return true;

		if(form['hiddenOrgForm'] && form['inputOrgName'] && form['selectRepr'])
			return form['hiddenOrgForm'].$valid && form['inputOrgName'].$valid && form['selectRepr'].$valid;
	}

	$scope.isValidPers = function () {
		var form = $scope.registerForm;

		if(form['email']&& form['firstname'] && form['secondname'] && form['lastname'] && form['phone'])
		return form['email'].$valid && form['secondname'].$valid && form['lastname'].$valid && form['phone'].$valid;
	}


	$scope.isValidLoc = function () {
		var form = $scope.registerForm;

		if(form['country']&& form['region'] && form['city'])
		return form['country'].$valid && form['region'].$valid && form['city'].$valid;
	}




	//$scope.tabs = [false, false, true, false];



	/*
	$scope.data.profile = {
		contractType : 1,
		orgType : "ООО",
		orgName : "sadfs",
		orgRepresent : 1,
		name : "Asdasd",
		midName : "asdasd",
		lastName : "asdasdasd",
		//phone : "9036996549",
		country : 3159,
		region : 4312,
		city: 4400
		
	}*/

	//$scope.data.user = { email : "rizolitmls@yandex.ru" }

	$scope.tabs = [ false, true, false, false];

	$scope.step = function (stID, data) {
		if(stID === 1 || stID === 2 ){		
			$scope.data.profile.contractType = data;
			if(data === 1) stID++;
			$scope.tabs[stID] = true;
		}
	}

	function findCur() {
		var cur;
		angular.forEach($scope.tabs, function(value, key){	if(value) cur = key; });
		return cur;
	}


	$scope.next = function () { 
		var c = findCur();
		c++;
		$scope.tabs[c] = true;
	}

	$scope.prev = function () {
		var c = findCur();
		if($scope.data.profile.contractType === 1 && c == 2) c -= 2
		else c--;
		$scope.tabs[c] = true;
	}

	$scope.$watch("data.profile.country", function () {
		//$scope.data.profile.region  = undefined;
		//$scope.data.profile.city  = undefined;


		if($scope.data.profile.country)
			$http.get('/api/site/places.json', {cache : true, params : {  country : $scope.data.profile.country }})
			.success(function (data) {
				$scope.places.regions = data;
			});
		else $scope.places.regions = [];
	});


	$scope.$watch("data.profile.region", function () {
		if($scope.data.profile.region)
			$http.get('/api/site/places.json', {cache : false, params : {  region : $scope.data.profile.region }})
			.success(function (data) {
				$scope.places.cities = data;
			});
		else $scope.places.cities = [];
	});

	$http.get('/api/site/places.json', { cache : true })
	.success(function (data) {
		$scope.places.countries = data;
		//$scope.data.profile.region  = undefined;
		//$scope.data.profile.country = 3159;

	});

	
	$scope.choice = function(choice) {
		$scope.data.profile.orgForm = choice;
	};

	$scope.allowSubmit = true;

	$scope.ok = function  () {
		if($scope.registerForm.$valid){
			$scope.allowSubmit = false;

			$http.post('/api/site/profile', { user : $scope.data } )
			.success(function(user) {
				if(user) Site.user['data'] = user;
			})
			.finally(function () {
				$scope.allowSubmit = true;
			})
		}
	}
});
