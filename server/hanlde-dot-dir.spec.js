'use strict';

const {test} = require('supertape');
const {handleDotFolder} = require('./handle-dot-dir');

test('restafary: handle-dot-dir: ./', (t) => {
    const result = handleDotFolder('./', '/hello');
    const expected = '/hello';
    
    t.equal(result, expected);
    t.end();
});

test('restafary: handle-dot-dir: ./hello/', (t) => {
    const result = handleDotFolder('./hello/', '/hello');
    const expected = '/hello/hello/';
    
    t.equal(result, expected);
    t.end();
});
