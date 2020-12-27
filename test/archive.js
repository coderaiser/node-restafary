'use strict';

const path = require('path');
const test = require('supertape');
const archive = require('../server/archive');

test('archive: shows zip archive listing', async (t) => {
    const file = path.resolve('./test/test.zip');
    t.equal(archive.isArchive(file), true, 'Should be an archive file');
    try {
        const resp = await archive.listArchive(file);
        t.equal(resp, `delete.js
get.js
fixture
fixture/get.json
fixture/get-raw
fixture/get-raw/hello.txt
fixture/get
fixture/get/hello.txt
fixture/get-raw.json
options.js`);
    } catch(ex) {
        t.fail(ex);
    }
    
    t.end();
});

test('archive: returns false for non zip files', async (t) => {
    const file = path.resolve('./test/not.a.zip.file');
    t.equal(archive.isArchive(file), false, 'Should not be an archive file');
    try {
        await archive.listArchive(file);
        t.fail('listArchive should fail on non archive files');
    } catch {
        // this should happen, since, it is not a zip file
    }
    
    t.end();
});
