
angular.module('autodbaseApp')
.service('cacheMan', function ($angularCacheFactory) {
    $angularCacheFactory('myNewCache', {
        capacity: 1000,  // This cache can hold 1000 items,
        maxAge: 90000, // Items added to this cache expire after 15 minutes
        aggressiveDelete: true, // Items will be actively deleted when they expire
        cacheFlushInterval: 3600000, // This cache will clear itself every hour,
        storageMode: 'localStorage', // This cache will sync itself with localStorage,
        onExpire: function (key, value) {
            // This callback is executed when the item specified by "key" expires.
            // At this point you could retrieve a fresh value for "key"
            // from the server and re-insert it into the cache.
        }
     });
}); 