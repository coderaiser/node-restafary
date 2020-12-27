'use strict';

const lsArchive = require('ls-archive');

function isArchive(path) {
    return lsArchive.isPathSupported(path);
}

function listArchive(path) {
    return new Promise((resolve, error) => {
        try {
            lsArchive.list(path, (err, entries) => {
                if (err) {
                    error(err);
                    return;
                }
                const data = entries
                    .map((z) => {
                        return z.getPath();
                    })
                    .join('\n');
                resolve(data);
            });
        } catch(ex) {
            error(ex);
        }
    });
}

module.exports = {
    isArchive,
    listArchive,
};
