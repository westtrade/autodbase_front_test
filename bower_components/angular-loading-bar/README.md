angular-loading-bar
===================

The idea is simple: Add a loading bar / progress bar whenever an XHR request goes out in angular.  Multiple requests within the same time period get bundled together such that each response increments the progress bar by the appropriate amount.

This is mostly cool because you simply include it in your app, and it works.  There's no complicated setup, and need to maintain the state of the loading bar; it's all handled automatically by the interceptor.

**Requirements:** AngularJS 1.2+


## Usage:

1. include the loading bar as a dependency for your app.  If you want animations, include `ngAnimate` as well.

    ```js
    angular.module('myApp', ['chieffancypants.loadingBar', 'ngAnimate'])
    ```
    
2. include the supplied CSS file (or create your own).
3. That's it -- you're done!



## Why I created this
There are a couple projects similar to this out there, but none are ideal.  All implementations I've seen require that you maintain state on behalf of the loading bar.  In other words, you're setting the value of the loading/progress bar manually from potentially many different locations.  This becomes complicated when you have a very large application with several services all making independant XHR requests.

Additionally, Angular was created as a highly testable framework, so it pains me to see Angular modules without tests.  That will not be the case here.


**Goals for this project:**

1. Make it automatic
2. Unit tests
3. Must work well with ngAnimate
4. Must be styled via external CSS (not inline)
5. No jQuery dependencies




## How it works:
This library is split into two files, an $http `interceptor`, and a `service`:

**Interceptor**  
The interceptor simply listens for all outgoing XHR requests, and then instructs the loadingBar service to start, stop, and increment accordingly.  There is no public API for the interceptor.

**Service**  
The service is responsible for the presentation of the loading bar.  It injects the loading bar into the DOM, adjusts the width whenever `set()` is called, and `complete()`s the whole show by removing the loading bar from the DOM.

## Service API (advanced usage)
Under normal circumstances you won't need to use this.  However, if you wish to use the loading bar without the interceptor, you can do that as well.  Simply include the loading bar service as a dependency instead of the interceptor in your angular module:

```js
angular.module('myApp', ['cfpLoadingBar'])
```


```js

cfpLoadingBar.start();
// will insert the loading bar into the DOM, and display its progress at 1%.
// It will automatically call `inc()` repeatedly to give the illusion that the page load is progressing.

cfpLoadingBar.inc();
// increments the loading bar by a random amount between .1% and .9%.
// It is important to note that the auto incrementing will begin to slow down at 70%
// and go very slowly at 90%.  This is to prevent the loading bar from appearing
// completed (or almost complete) before the XHR request has responded. 

cfpLoadingBar.set(0.3) // Set the loading bar to 30%
cfpLoadingBar.status() // Returns the loading bar's progress.
// -> 0.3

cfpLoadingBar.complete()
// Set the loading bar's progress to 100%, and then remove it from the DOM.

```

## Credits: 
Credit goes to [rstacruz](https://github.com/rstacruz) for his excellent [nProgress](https://github.com/rstacruz/nprogress).

## License:
Licensed under the MIT license
