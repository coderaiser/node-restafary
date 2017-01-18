'use strict';

const http = require('http');

const express = require('express');
const request = require('request');
const restafary = require('..');

const getURL = (path, port) => `http://127.0.0.1:${port}/${path}`;

module.exports.get = (path, root, fn) => {
    serve(path, root, (port, close) => {
        const url = getURL(path, port);
        
        request.get(url, (e, res, body) => {
            fn(res, body, close);
        });
    });
};

module.exports.del = (path, root, body, fn) => {
    serve(path, root, (port, close) => {
        const url = getURL(path, port);
        const options = {
            url,
            body
        };
        
        request.delete(options, (e, res, body) => {
            fn(res, body, close);
        });
    });
};

function serve(path, root, fn) {
    const app = express();
    const server = http.createServer(app);
    
    app.use(restafary({
        root
    }));
    
    server.listen(() => {
        const {port} = server.address();
        
        fn(port, () => {
            server.close();
        });
    });
}

