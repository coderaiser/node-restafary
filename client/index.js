let FS = '/api/v1/fs';
const isFn = (a) => typeof a === 'function';

export const prefix = (prefix) => {
    FS = prefix;
};

export const remove = (url, data, callback) => {
    if (!callback && isFn(data)) {
        callback = data;
        data = null;
    }
    
    sendRequest({
        method: 'DELETE',
        url: FS + url,
        data,
        callback,
    });
};

export const patch = (url, data, callback) => {
    if (!callback && isFn(data)) {
        callback = data;
        data = null;
    }
    
    sendRequest({
        method: 'PATCH',
        url: FS + url,
        data,
        callback,
    });
};

export const write = (url, data, callback) => {
    if (!callback && isFn(data)) {
        callback = data;
        data = null;
    }
    
    sendRequest({
        method: 'PUT',
        url: FS + url,
        data,
        callback,
    });
};

export const read = (url, callback) => {
    sendRequest({
        method: 'GET',
        url: FS + url,
        callback,
    });
};

function sendRequest({url, data, method, callback}) {
    ajax({method, data, url: escape(url)}, callback);
}

/*
 * when we send ajax request -
 * no need in hash so we escape #
 */
export const _escape = escape;

function escape(str) {
    return encodeURI(str).replace(/#/g, '%23');
}

function ajax(params, callback) {
    const {
        url,
        data,
        method,
    } = params;
    
    const request = new XMLHttpRequest();
    
    if (!isFn(callback))
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
