'use strict';

const {join} = require('node:path');

module.exports.handleDotFolder = (root, cwd) => {
    if (root.startsWith('./')) {
        root = root.replace('./', '');
        return join(cwd, root);
    }
    
    if (root === '.')
        return cwd;
    
    if (root.startsWith('/'))
        return root;
    
    return join(cwd, root);
};
