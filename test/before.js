'use strict';

const http = require('http');

const express = require('express');
const got = require('got');
const tryToCatch = require('try-to-catch');
const {promisify} = require('es6-promisify');

const restafary = require('..');

const getURL = (path, port) => `http://127.0.0.1:${port}/${path}`;

const serve = promisify((path, root, fn) => {
    const app = express();
    const server = http.createServer(app);
    
    app.use(restafary({
        root
    }));
    
    const done = () => {
        server.close();
    };
    
    server.listen(() => {
        const {port} = server.address();
        
        fn(null, {
            port,
            done,
        });
    });
});

module.exports.get = async (path, root) => {
    const {port, done} = await serve(path, root);
    const url = getURL(path, port);
    
    const [e, response] = await tryToCatch(got, url);
    
    done();
    
    return [e, response];
};

module.exports.del = async (path, root, body) => {
    const {port, done} = await serve(path, root);
    const url = getURL(path, port);
    const [e, response] = await tryToCatch(got.delete, url, {body});
    
    done();
    
    return [e, response];
};

