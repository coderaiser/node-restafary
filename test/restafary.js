'use strict';

let http = require('http');
let express = require('express');
let test = require('tape');
let freeport = require('freeport');
let pipe = require('pipe-io');
let restafary = require('..');

test('restafary: path traversal', (t) => {
    freeport((error, port) => {
        t.notOk(error, 'should not be error');
        t.ok(port, `port is ${port}`);
        
        let app = express();
        let server = http.createServer(app);
        let ip = '127.0.0.1';
        
        app.use(restafary({
            root: '/tmp'
        }));
        
        server.listen(port, ip, () => {
            http.get(`http://127.0.0.1:${port}/fs..%2f..%2fetc/passwd`, (res) => {
                pipe.getBody(res, (error, body) => {
                    t.notOk(error, `should not be error: ${error}`);
                    t.equal(body, 'Path /etc/passwd beyond root /tmp!', 'should return beyond root message');
                    server.close();
                    t.end();
                });
            }).on('error', (error) => {
                t.notOk(error, `should not be error: ${error}`);
                t.end();
            });
        });
    });
});

