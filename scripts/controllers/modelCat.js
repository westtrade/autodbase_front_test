'use strict';





angular.module('autodbaseApp')


.controller('ModelcatCtrl', function ($scope, $http, $stateParams, Site,  $cookieStore, $state) {
	$scope.$state = $state;
	$scope.reverse = false;
	$scope.predicate = 'type';
	$scope.catalog = {};
	$scope.catType =  $cookieStore.get('catType') || 1;
	$scope.Site = Site;
	$scope.brandID = $stateParams.brand;

	$scope.setCatType = function(type) { $cookieStore.put('catType', type); $scope.catType = type; };

	var query = {};

	if(Site.brands) query.MFA_CODE = Site.brands[$stateParams.brand].id;
	else query.MFC_CODE = $stateParams.brand;

	$http.get('/api/', { cache : true, params : query})
	.success(function(data){

		var rows = [], index = {}, i = 0;
		if(data.brands && !Site.brands) Site.brands = data.brands;
		
		if(data.models) data.models.forEach(function(v, i){	var t = v.type.split(' ')[0]; if(!index[t]) index[t] = [i];	else index[t].push(i);	});
		$.each(index, function (k, v) { if(i++ % 4) rows[rows.length - 1].push(k); else rows[rows.length] = [k]; });
		
		$scope.catalog.rows = rows;
		$scope.catalog.index = index;
		$scope.data = data;	
	})
	.error(function(err){  });

	
})


.controller('TypecatCtrl', function ($scope, $http, $stateParams, Site) {
	$scope.predicate = 'longName';
	$scope.Site = Site;
	$scope.brandID = $stateParams.brand;

	var query = { MOD_ID : $stateParams.model };
	if(Site.brands) query.MFA_CODE = Site.brands[$stateParams.brand].id;
	else query.MFC_CODE = $stateParams.brand;



	$http.get('/api/', { cache : true, params : query})
	.success(function(data){ $scope.data = data; })
	.error(function(){  })	
})


.controller('TreecatCtrl', function ($scope, $http, $stateParams, $state, Site, $document) {  

	var query = {  MOD_ID : $stateParams.model , TYP_ID : $stateParams.type };

	$scope.$state = $state;	
	$scope.Site = Site;

	$scope.tree = { root : [] }
	$scope.menuDisplay = true;
	$scope.brandID = $stateParams.brand;

	$scope.reverse = false;
	$scope.predicate = 'ART_ARTICLE_NR';



	if(Site.brands) {
		$scope.brands =  Site.brands;
		query.MFA_CODE = Site.brands[$stateParams.brand].id;
	}
	else query.MFC_CODE = $stateParams.brand;
	

	function getLevel(level, parent){
		var lq = $.extend({},query, { level: level, parent : parent });

		return $http.get('/api/tree', { params : lq, cache : false })
			.success(function (data) {  $scope.tree[level] = data.level;  })
			.error(function (err) { });
	}	

	function showTable (STR_ID) {
		var lq = $.extend({}, query, {STR_ID : STR_ID });
		$http.get('/api/', { cache: false, params : lq })
		.success(function (data) {
			$scope.table = data.items;
			$scope.menuDisplay = false;
		})
	}

	if($stateParams.STR_ID) showTable ($stateParams.STR_ID);


	$scope.showMenu = function () { 
		$scope.menuDisplay = !$scope.menuDisplay; 
	}	

	/*$document.on('click', function (e) {
		if(!$(e.target).parents(".tree").length) $scope.menuDisplay = !$scope.menuDisplay;
	});*/



    $scope.add = function(data, $index) {
    	if(data.folder != 0) $scope.tree[data.level][$index].expanded = $scope.tree[data.level][$index].expanded === undefined 
    		? true : !$scope.tree[data.level][$index].expanded;
    	else //showTable(data.children) ;
    		$state.transitionTo('cat.treeCat', $.extend({}, $stateParams, {STR_ID : data.children}));    		
    	
        if(data.folder != 0 && $scope.tree[data.level+'_'+data.children] === undefined) getLevel(data.level + '_' + data.children, data.children);
    };


	$http.get('/api/', { cache : false, params: query })
	.success(function(data){ 
		if(data.brands) {
			Site.brands = data.brands;
			$scope.brands = Site.brands;
		}

		$scope.data = data; 
		getLevel('root');		
	})
	.error(function(){  });
})


.controller('IteminfoCtrl', function ($scope, $http, $stateParams, $state, Basket) {
	$scope.data = {};
	$scope.$state = $state;

	$http.get('/api/info/'+$stateParams.brand+'/'+$stateParams.id, { cache : false})
	.success(function (data) {
		$scope.data = data;
	}).error(function (err) {
		
	});
})


.controller('FrontPageCtrl', function ($scope) {
	
})


.controller('SearchCtrl', function ($scope, $stateParams, $state, $http, Site) {
	Site.search = $stateParams.search;
	Site.title = 'Поиск автозапчастей';
	$scope.$state = $state;
	$scope.search = $stateParams.search;
	$scope.loading = true;


	$scope.form = { artid : $stateParams.search	}

	$http.get('/api/search/', { 	
		cache : false, 
		params : { BRA_BRAND : $stateParams.brand,  ARL_SEARCH_NUMBER :  $stateParams.search  }
	})
	.success(function (data) {
		$scope.data = data;
		$scope.loading = false;
	})
	.error(function (err) {
		$scope.loading = false;
		console.log(err);		
	});

});

