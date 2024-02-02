import test from 'supertape';

test('restafary: exports: client', async (t) => {
    const external = await import('restafary/client');
    const internal = await import('../client/index.js');
    
    t.equal(external, internal);
    t.end();
});

