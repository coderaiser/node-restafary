import {test} from 'supertape';
import * as restafary from './index.js';

test('cloudcmd: client: rest: replaceHash', (t) => {
    const {_escape} = restafary;
    const url = '/hello/####world';
    const result = _escape(url);
    const expected = '/hello/%23%23%23%23world';
    
    t.equal(result, expected);
    t.end();
});
