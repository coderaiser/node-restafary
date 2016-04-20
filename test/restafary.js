'use strict';

let http = require('http');
let express = require('express');
let test = require('tape');
let freeport = require('freeport');
let pipe = require('pipe-io');
let restafary = require('..');

let get = (path, root, fn) => {
    freeport((error, port) => {
        let app = express();
        let server = http.createServer(app);
        let ip = '127.0.0.1';
        
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
        pipe.getBody(res, (error, body) => {
            cb();
            t.notOk(error, `should not be error: ${error}`);
            t.equal(body, 'Path /etc/passwd beyond root /tmp!', 'should return beyond root message');
            t.end();
        });
    });
});

test('restafary: path traversal', (t) => {
    get('fs/bin', '/', (res, cb) => {
        pipe.getBody(res, (error, body) => {
            let fn = () => {
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
        pipe.getBody(res, (error, body) => {
            let fn = () => {
                JSON.parse(body);
            };
            t.notOk(error, `should not be error: ${error}`);
            t.doesNotThrow(fn, 'should not throw');
            cb();
            t.end();
        });
    });
});

