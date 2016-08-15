'use strict';

angular.module('autodbaseApp')
	.controller('MainCtrl', function ($scope, $http, $state, Site) {
		$scope.isBrandCat = true;
		$scope.$state = $state;

		Site.title = "Передние фары и бампер, а так же глушители, стартер, тормозные колодки, капот в каталоге интернет-магазина запчастей";

		//filter:search|

		$http.get('/api/', {params : { fields : ['MFA_BRAND MFA_MFC_CODE'] }})
		.success(function(data) {  
			console.log(data.brands.rows);
			$scope.brands = data.brands.rows; 
	    });
	})

	.filter('group', function(){
		return function(array, groupSize) {
			if (!angular.isArray(array)) return array;
		  	var groups = [], inner;

		  	
		  	/*angular.forEach(array, function(value, key){
		  		if(key % groupSize === 0) { inner = [] ; groups.push(inner); }
		  		inner.push(value);
		  	});
			
			*/
		  	return groups;
		};
	

	})


;
 