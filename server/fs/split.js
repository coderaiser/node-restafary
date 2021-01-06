'use strict';

module.exports = (path) => {
    const replaced = path.replace('.zip/', ':/');
    const [outer, inner] = replaced.split(':');
    
    return [
        `${outer}.zip`,
        inner || '',
    ];
};

