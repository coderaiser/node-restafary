(function() {
    'use strict';
    
    if (typeof module !== 'undefined' && module.exports)
        module.exports = RESTfulProto();
    else
        window.restafary = RESTfulProto();
    
    function RESTfulProto() {
        if (!(this instanceof RESTfulProto))
            return new RESTfulProto();
        
        var FS      = '/api/v1/fs';
        
        this.prefix = function(prefix) {
            FS = prefix;
        };
        
        this.delete = function(url, data, callback) {
            var isFunc      = typeof data === 'function';
            
            if (!callback && isFunc) {
                callback    = data;
                data        = null;
            }
            
            sendRequest({
                method      : 'DELETE',
                url         : FS + url,
                data        : data,
                callback    : callback
            });
        };
        
        this.patch  = function(url, data, callback) {
            var isFunc      = typeof data === 'function';
            
            if (!callback && isFunc) {
                callback    = data;
                data        = null;
            }
            
            sendRequest({
                method      : 'PATCH',
                url         : FS + url,
                data        : data,
                callback    : callback
            });
        };
        
        this.write   = function(url, data, callback) {
            var isFunc      = typeof data === 'function';
            
            if (!callback && isFunc) {
                callback    = data;
                data        = null;
            }
            
            sendRequest({
                method      : 'PUT',
                url         : FS + url,
                data        : data,
                callback    : callback
            });
        };
        
        this.read   = function(url, callback) {
            sendRequest({
                method      : 'GET',
                url         : FS + url,
                callback    : callback
            });
        };
        
       function sendRequest(params) {
            var p               = params;
            
            ajax({
                method      : p.method,
                url         : escape(p.url),
                data        : p.data,
            }, p.callback);
        }
        
        /*
         * when we send ajax request -
         * no need in hash so we escape #
         */
        
        function escape(str) {
            str   = encodeURI(str);
            return str.replace('#', '%23');
        }
        
        function ajax(params, callback) {
            var p       = params,
                request = new XMLHttpRequest();
            
            if (typeof callback !== 'function')
                throw Error('Callback should be function!');
            
            request.open(p.method, p.url, true);
            
            request.addEventListener('error', function(error) {
                callback(error);
            });
            
            request.addEventListener('load', function() {
                if (request.status >= 200 && request.status < 400)
                    callback(null, request.responseText);
                else
                    callback(Error(request.responseText));
            });
            
            request.send(p.data);
        }
        
    }
})();

