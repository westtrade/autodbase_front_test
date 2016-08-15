'use strict';

angular.module('autodbaseApp', 
  ['ngAnimate', 'chieffancypants.loadingBar', 
  'ui.bootstrap', 'ui.select2', 'ui.utils',
  "ui.bootstrap.tpls",  'ui.router', 
  'angular-cache', 'vcRecaptcha', 
   'ngCookies'])
  .config(function ($stateProvider, $urlRouterProvider,  $locationProvider) {
     $(".select2-results").niceScroll();
     
     $locationProvider.html5Mode(true);
     $locationProvider.hashPrefix('!');

     var catalogTPL = '/views/cat.html';

     $stateProvider
     .state('cat', { 
        url : '/catalog.html',
        templateUrl: catalogTPL, 
        controller: 'MainCtrl'
      })     
     .state('cat.itemInfo', { 
        url : '/info/m:brand/t:id.html',
        templateUrl: '/views/iteminfo.html', 
        controller: 'IteminfoCtrl'
      })  

     .state('cat.search', {
        url : '^/search/:search.html',
        templateUrl: '/views/cat.search.html', 
        controller: 'SearchCtrl'        
     })
     .state('cat.searchbr', {
        url : '^/search/:search/:brand.html',
        templateUrl: '/views/cat.search.html', 
        controller: 'SearchCtrl'        
     })


     .state('cat.tree', { 
        url : '^/catalog/:brand/m:model/t:type.html',
        templateUrl: '/views/cat.tree.html', 
        controller: 'TreecatCtrl'
      })

     .state('cat.treeCat', { 
        url : '^/catalog/:brand/m:model/t:type/s:STR_ID.html',
        templateUrl: '/views/cat.tree.html', 
        controller: 'TreecatCtrl'
      })



      .state('cat.types', {
        url : '^/catalog/:brand/m:model.html',
        templateUrl: '/views/cat.types.html', 
        controller: 'TypecatCtrl'
     })
     .state('cat.brand', { 
        url : '^/catalog/:brand.html',
        templateUrl: '/views/cat.models.html', 
        controller: 'ModelcatCtrl'
      }) 

     




     
     .state('front', { 
        url : '/index.html',
        templateUrl: '/views/front.html', 
        controller: 'FrontPageCtrl'
      })     
      
      .state('cart',{ 
        url : '/cart.html',
        templateUrl: '/views/cart.html', 
        controller: 'CartCtrl'
      })


      .state('profile',{ 
        url : '/profile.html',
        templateUrl: '/views/user.html', 
        controller: 'UserCtrl'
      })
      .state('profile.userTerms',{ 
        url : '^/profile/userTerms.html',
        templateUrl: '/views/user.terms.html', 
        controller: 'UserCtrl'
      })
      .state('profile.delivers',{ 
        url : '^/profile/delivers.html',
        templateUrl: '/views/user.html', 
        controller: 'UserCtrl'
      })
      .state('profile.payers',{  
        url : '^/profile/payers.html',
        templateUrl: '/views/user.html', 
        controller: 'UserCtrl'
      })
      .state('profile.register',{  
        url : '^/profile/register.html',
        templateUrl: '/views/user.register.html',
        controller: 'RegisterCtrl'
      })
      .state('profile.forgot',{ 
        url : '^/profile/forgot.html',
        templateUrl: '/views/user.forgot.html',
        controller: 'ForgotpassCtrl'
      });
      
      $urlRouterProvider.otherwise("/"); //404
  })


.factory('Site', function () {
  return {
    search : null,
    page_title : null,
    brands : null,
    user : {}
  }
})

.factory('User', function () {
  return {
    data : {}
  }
})

.factory('Basket', function () {
  return {
    data : {}
  }
})

.factory('Notepad', function () {
  return {
    data : {}
  }
})


















  .run(function($angularCacheFactory, $http, $state, $document, $rootScope, Site){
      $state.transitionTo('front');
      //$document.find('body').niceScroll();
      $rootScope.site = Site;


      $angularCacheFactory('defaultCache', {
        capacity: 100000,  
        maxAge: 90000, 
        aggressiveDelete: true, 
        cacheFlushInterval: 3600000, 
        storageMode: 'localStorage' 
        /*, onExpire: function (key, value) {
            // This callback is executed when the item specified by "key" expires.
            // At this point you could retrieve a fresh value for "key"
            // from the server and re-insert it into the cache.
        }*/
    });

    $http.defaults.cache = $angularCacheFactory.get('defaultCache');
  })


  .filter('capitalise', function () {
    return function (str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }    
  })
 .filter('tecdocdate', function() {
    return function(date, type) {
      return date != null ? [ date.toString().substr(4) , date.toString().substr(0, 4) ].join('.') : (Boolean(type) ? 'до н.в.' : 'неизвестно');
    };
  });

