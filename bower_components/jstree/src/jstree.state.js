/* File: jstree.state.js
This plugin enables state saving between reloads.
*/
/* Group: jstree state plugin */
(function ($) {
	var to = false;

	$.jstree.defaults.state = {
		key		: 'jstree',
		events	: 'changed.jstree open_node.jstree close_node.jstree'
	};
	$.jstree.plugins.state = function (options, parent) {
		this.bind = function () {
			parent.bind.call(this);

			this.element
				.on("ready.jstree", $.proxy(function (e, data) {
						this.element.one("restore_state.jstree set_state.jstree", $.proxy(function () {
							this.element.on(this.settings.state.events, $.proxy(function () {
								if(to) { clearTimeout(to); }
								to = setTimeout($.proxy(function () { this.save_state(); }, this), 100);
							}, this));
						}, this));
						this.restore_state();
					}, this));
		};
		this.save_state = function () {
			$.vakata.storage.set(this.settings.state.key, this.get_state());
		};
		this.restore_state = function () {
			var k = $.vakata.storage.get(this.settings.state.key);

			if(!!k) { this.set_state(k); }
			this.trigger('restore_state', { 'state' : k });
		};
	};

	// include the state plugin by default
	$.jstree.defaults.plugins.push("state");
})(jQuery);

(function ($, document, undefined) {
	var raw		= function (s) { return s; },
		decoded	= function (s) { return decodeURIComponent(s.replace(/\+/g, ' ')); };
	var config = $.vakata.cookie = function (key, value, options) {
		// write
		if (value !== undefined) {
			options = $.extend({}, config.defaults, options);

			if (value === null) {
				options.expires = -1;
			}

			if (typeof options.expires === 'number') {
				var days = options.expires, t = options.expires = new Date();
				t.setDate(t.getDate() + days);
			}

			value = config.json ? $.vakata.json.encode(value) : String(value);

			return (document.cookie = [
				encodeURIComponent(key), '=', config.raw ? value : encodeURIComponent(value),
				options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
				options.path    ? '; path=' + options.path : '',
				options.domain  ? '; domain=' + options.domain : '',
				options.secure  ? '; secure' : ''
			].join(''));
		}
		// read
		var decode = config.raw ? raw : decoded;
		var cookies = document.cookie.split('; ');
		for (var i = 0, l = cookies.length; i < l; i++) {
			var parts = cookies[i].split('=');
			if (decode(parts.shift()) === key) {
				var cookie = decode(parts.join('='));
				return config.json ? $.vakata.json.decode(cookie) : cookie;
			}
		}
		return null;
	};
	config.defaults = {};
	$.vakata.removeCookie = function (key, options) {
		if ($.cookie(key) !== null) {
			$.cookie(key, null, options);
			return true;
		}
		return false;
	};
})(jQuery, document);

(function ($) {
	var _storage = {},
		_storage_service = {jStorage:"{}"},
		_storage_elm = null,
		_storage_size = 0,
		json_encode = $.vakata.json.encode,
		json_decode = $.vakata.json.decode,
		_backend = false,
		_ttl_timeout = false;

	function _init() {
		var localStorageReallyWorks = false;
		if("localStorage" in window){
			try {
				window.localStorage.setItem('_tmptest', 'tmpval');
				localStorageReallyWorks = true;
				window.localStorage.removeItem('_tmptest');
			} catch(BogusQuotaExceededErrorOnIos5) {
				// Thanks be to iOS5 Private Browsing mode which throws
				// QUOTA_EXCEEDED_ERRROR DOM Exception 22.
			}
		}

		if(localStorageReallyWorks){
			try {
				if(window.localStorage) {
					_storage_service = window.localStorage;
					_backend = "localStorage";
				}
			} catch(E3) {/* Firefox fails when touching localStorage and cookies are disabled */}
		}
		else if("globalStorage" in window) {
			try {
				if(window.globalStorage) {
					_storage_service = window.globalStorage[window.location.hostname];
					_backend = "globalStorage";
				}
			} catch(E4) {/* Firefox fails when touching localStorage and cookies are disabled */}
		}
		else {
			_storage_elm = document.createElement('link');
			if(_storage_elm.addBehavior) {
				_storage_elm.style.behavior = 'url(#default#userData)';
				document.getElementsByTagName('head')[0].appendChild(_storage_elm);
				try {
					_storage_elm.load("jStorage");
					var data = "{}";
					data = _storage_elm.getAttribute("jStorage");
					_storage_service.jStorage = data;
					_backend = "userDataBehavior";
				} catch(E5) {}
			}
			if(
				!_backend && (
					!!$.vakata.cookie('__vjstorage') ||
					($.vakata.cookie('__vjstorage', '{}', { 'expires' : 365 }) && $.vakata.cookie('__vjstorage') === '{}')
				)
			) {
				_storage_elm = null;
				_storage_service.jStorage = $.vakata.cookie('__vjstorage');
				_backend = "cookie";
			}

			if(!_backend) {
				_storage_elm = null;
				return;
			}
		}
		_load_storage();
		_handleTTL();
	}

	function _load_storage() {
		if(_storage_service.jStorage) {
			try {
				_storage = json_decode(String(_storage_service.jStorage));
			} catch(E6) { _storage_service.jStorage = "{}"; }
		} else {
			_storage_service.jStorage = "{}";
		}
		_storage_size = _storage_service.jStorage ? String(_storage_service.jStorage).length : 0;
	}

	function _save() {
		try {
			_storage_service.jStorage = json_encode(_storage);
			if(_backend === 'userDataBehavior') {
				_storage_elm.setAttribute("jStorage", _storage_service.jStorage);
				_storage_elm.save("jStorage");
			}
			if(_backend === 'cookie') {
				$.vakata.cookie('__vjstorage', _storage_service.jStorage, { 'expires' : 365 });
			}
			_storage_size = _storage_service.jStorage?String(_storage_service.jStorage).length:0;
		} catch(E7) { /* probably cache is full, nothing is saved this way*/ }
	}

	function _checkKey(key) {
		if(!key || (typeof key !== "string" && typeof key !== "number")){
			throw new TypeError('Key name must be string or numeric');
		}
		if(key === "__jstorage_meta") {
			throw new TypeError('Reserved key name');
		}
		return true;
	}

	function _handleTTL() {
		var curtime = +new Date(),
			i,
			TTL,
			nextExpire = Infinity,
			changed = false;

		if(_ttl_timeout !== false) {
			clearTimeout(_ttl_timeout);
		}
		if(!_storage.__jstorage_meta || typeof _storage.__jstorage_meta.TTL !== "object"){
			return;
		}
		TTL = _storage.__jstorage_meta.TTL;
		for(i in TTL) {
			if(TTL.hasOwnProperty(i)) {
				if(TTL[i] <= curtime) {
					delete TTL[i];
					delete _storage[i];
					changed = true;
				}
				else if(TTL[i] < nextExpire) {
					nextExpire = TTL[i];
				}
			}
		}

		// set next check
		if(nextExpire !== Infinity) {
			_ttl_timeout = setTimeout(_handleTTL, nextExpire - curtime);
		}
		// save changes
		if(changed) {
			_save();
		}
	}

	/*
		Variable: $.vakata.storage
		*object* holds all storage related functions and properties.
	*/
	$.vakata.storage = {
		/*
			Variable: $.vakata.storage.version
			*string* the version of jstorage used HEAVILY MODIFIED
		*/
		version: "0.3.0",
		/*
			Function: $.vakata.storage.set
			Set a key to a value

			Parameters:
				key - the key
				value - the value

			Returns:
				_value_
		*/
		set : function (key, value, ttl) {
			_checkKey(key);
			if(typeof value === "object") {
				value = json_decode(json_encode(value));
			}
			_storage[key] = value;
			_save();
			if(ttl && parseInt(ttl, 10)) {
				$.vakata.storage.setTTL(key, parseInt(ttl, 10));
			}
			return value;
		},
		/*
			Function: $.vakata.storage.get
			Get a value by key.

			Parameters:
				key - the key
				def - the value to return if _key_ is not found

			Returns:
				The found value, _def_ if key not found or _null_ if _def_ is not supplied.
		*/
		get : function (key, def) {
			_checkKey(key);
			if(key in _storage){
				return _storage[key];
			}
			return typeof(def) === 'undefined' ? null : def;
		},
		/*
			Function: $.vakata.storage.del
			Remove a key.

			Parameters:
				key - the key

			Returns:
				*boolean*
		*/
		del : function (key) {
			_checkKey(key);
			if(key in _storage) {
				delete _storage[key];

				if(_storage.__jstorage_meta && typeof _storage.__jstorage_meta.TTL === "object" && key in _storage.__jstorage_meta.TTL) {
					delete _storage.__jstorage_meta.TTL[key];
				}
				_save();
				return true;
			}
			return false;
		},

		setTTL: function(key, ttl){
			var curtime = +new Date();

			_checkKey(key);
			ttl = Number(ttl) || 0;
			if(key in _storage){
				if(!_storage.__jstorage_meta){
					_storage.__jstorage_meta = {};
				}
				if(!_storage.__jstorage_meta.TTL) {
					_storage.__jstorage_meta.TTL = {};
				}
				if(ttl > 0) {
					_storage.__jstorage_meta.TTL[key] = curtime + ttl;
				}
				else {
					delete _storage.__jstorage_meta.TTL[key];
				}
				_save();
				_handleTTL();
				return true;
			}
			return false;
		},
		getTTL: function(key){
			var curtime = +new Date(), ttl;
			_checkKey(key);
			if(key in _storage && _storage.__jstorage_meta.TTL && _storage.__jstorage_meta.TTL[key]) {
				ttl = _storage.__jstorage_meta.TTL[key] - curtime;
				return ttl || 0;
			}
			return 0;
		},

		/*
			Function: $.vakata.storage.flush
			Empty the storage.

			Returns:
				_true_
		*/
		flush : function(){
			_storage = {};
			_save();
			// try{ window.localStorage.clear(); } catch(E8) { }
			return true;
		},
		/*
			Function: $.vakata.storage.storageObj
			Get a read only copy of the whole storage.

			Returns:
				*object*
		*/
		storageObj : function(){
			return $.extend(true, {}, _storage);
		},
		/*
			Function: $.vakata.storage.index
			Get an array of all the set keys in the storage.

			Returns:
				*array*
		*/
		index : function(){
			var index = [], i;
			$.each(_storage, function (i, v) { if(i !== "__jstorage_meta") { index.push(i); } });
			return index;
		},
		/*
			Function: $.vakata.storage.storageSize
			Get the size of all items in the storage in bytes.

			Returns:
				*number*
		*/
		storageSize : function(){
			return _storage_size;
		},
		/*
			Function: $.vakata.storage.currentBackend
			Get the current backend used.

			Returns:
				*string*
		*/
		currentBackend : function(){
			return _backend;
		},
		/*
			Function: $.vakata.storage.storageAvailable
			See if storage functionality is available.

			Returns:
				*boolean*
		*/
		storageAvailable : function(){
			return !!_backend;
		}
	};
	_init();
})(jQuery);
