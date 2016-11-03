'use strict';

const http = require('http');
const fs = require('fs');
const express = require('express');
const test = require('tape');
const freeport = require('freeport');
const pullout = require('pullout');
const restafary = require('..');

const get = (path, root, fn) => {
    freeport((error, port) => {
        const app = express();
        const server = http.createServer(app);
        const ip = '127.0.0.1';
        
        app.use(restafary({
            root: root
        }));
        
        server.listen(port, ip, () => {
            http.get(`http://127.0.0.1:${port}/${path}`, (res) => {
                fn(res, () => {
                    server.close();
                });
            });
        });
    });
};

test('restafary: path traversal beyond root', (t) => {
    get('fs..%2f..%2fetc/passwd', '/tmp', (res, cb) => {
        pullout(res, 'string', (error, body) => {
            cb();
            t.notOk(error, `should not be error: ${error}`);
            t.equal(body, 'Path /etc/passwd beyond root /tmp!', 'should return beyond root message');
            t.end();
        });
    });
});

test('restafary: path traversal', (t) => {
    get('fs/bin', '/', (res, cb) => {
        pullout(res, 'string', (error, body) => {
            const fn = () => {
                JSON.parse(body);
            };
            t.notOk(error, `should not be error: ${error}`);
            t.doesNotThrow(fn, 'should not throw');
            cb();
            t.end();
        });
    });
});

test('restafary: path traversal, not default root', (t) => {
    get('fs/local', '/usr', (res, cb) => {
        pullout(res, 'string', (error, body) => {
            const fn = () => {
                JSON.parse(body);
            };
            t.notOk(error, `should not be error: ${error}`);
            t.doesNotThrow(fn, 'should not throw');
            cb();
            t.end();
        });
    });
});

test('restafary: path traversal: "."', (t) => {
    const path = fs.readdirSync('.').filter((name) => {
        return !/^\./.test(name);
    })[0];
    
    get(`fs/${path}`, '.', (res, cb) => {
        t.ok(res.statusCode, 200, 'status code should be OK');
        cb();
        t.end();
    });
});
