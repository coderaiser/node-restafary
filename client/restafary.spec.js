'use strict';

const test = require('supertape');
const restafary = require('./restafary');

test('cloudcmd: client: rest: replaceHash', (t) => {
    const {_escape} = restafary;
    const url = '/hello/####world';
    const result = _escape(url);
    const expected = '/hello/%23%23%23%23world';
    
    t.equal(result, expected, 'should equal');
    t.end();
});

