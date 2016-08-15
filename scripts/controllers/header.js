'use strict';

angular.module('autodbaseApp')
  .controller('headerCtrl', function ($scope, $state, $location, Site) {
  	$scope.$state = $state;	
  	$scope.site = Site;
  	$scope.transition = function () {
  		if(Site.search && Site.search.length) 
  			$state.transitionTo('cat.search', { search : Site.search });
  	}
  });
