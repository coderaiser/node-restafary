import {test} from 'supertape';
import {handleDotFolder} from './handle-dot-dir.js';

test('restafary: handle-dot-dir: .', (t) => {
    const result = handleDotFolder('.', '/hello');
    const expected = '/hello';
    
    t.equal(result, expected);
    t.end();
});

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

test('restafary: handle-dot-dir: hello/', (t) => {
    const result = handleDotFolder('hello/', '/hello');
    const expected = '/hello/hello/';
    
    t.equal(result, expected);
    t.end();
});
