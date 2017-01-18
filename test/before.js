'use strict';

const http = require('http');
const express = require('express');
const restafary = require('..');
const currify = require('currify');

const serve = currify(_serve);

module.exports.get = serve('get');

function _serve(method, path, root, fn) {
    const app = express();
    const server = http.createServer(app);
    
    app.use(restafary({
        root: root
    }));
    
    server.listen(() => {
        const {port} = server.address();
        
        http[method](`http://127.0.0.1:${port}/${path}`, (res) => {
            fn(res, () => {
                server.close();
            });
        });
    });
}
