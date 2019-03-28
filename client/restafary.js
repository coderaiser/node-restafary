'use strict';

let FS = '/api/v1/fs';
const isFunc = (a) => typeof a === 'function';

module.exports.prefix = (prefix) => {
    FS = prefix;
};

module.exports.delete = (url, data, callback) => {
    if (!callback && isFunc(data)) {
        callback = data;
        data = null;
    }
    
    sendRequest({
        method      : 'DELETE',
        url         : FS + url,
        data,
        callback,
    });
};

module.exports.patch = (url, data, callback) => {
    if (!callback && isFunc(data)) {
        callback = data;
        data = null;
    }
    
    sendRequest({
        method      : 'PATCH',
        url         : FS + url,
        data,
        callback,
    });
};

module.exports.write = (url, data, callback) => {
    if (!callback && isFunc(data)) {
        callback = data;
        data = null;
    }
    
    sendRequest({
        method      : 'PUT',
        url         : FS + url,
        data,
        callback,
    });
};

module.exports.read = (url, callback) => {
    sendRequest({
        method      : 'GET',
        url         : FS + url,
        callback,
    });
};

function sendRequest({url, data, method, callback}) {
    ajax({
        method,
        data,
        url: escape(url),
    }, callback);
}

/*
 * when we send ajax request -
 * no need in hash so we escape #
 */
module.exports._escape = escape;
function escape(str) {
    return encodeURI(str)
        .replace(/#/g, '%23');
}

function ajax(params, callback) {
    const {
        url,
        data,
        method,
    } = params;
    const request = new XMLHttpRequest();
    
    if (typeof callback !== 'function')
        throw Error('Callback should be function!');
    
    const load = () => {
        if (request.status >= 200 && request.status < 400)
            return callback(null, request.responseText);
        
        callback(Error(request.responseText));
    };
    
    request.open(method, url, true);
    request.addEventListener('error', callback);
    request.addEventListener('load', load);
    
    request.send(data);
}

