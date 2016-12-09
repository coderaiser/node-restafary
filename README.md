# Restafary [![License][LicenseIMGURL]][LicenseURL] [![NPM version][NPMIMGURL]][NPMURL] [![Dependency Status][DependencyStatusIMGURL]][DependencyStatusURL] [![Build Status][BuildStatusIMGURL]][BuildStatusURL]

**REST** for **CRUD** file operations.

## What is it?

**RE**presentational **S**tate **T**ransfer is an abstraction of the architecture of the World Wide Web.

**C**reate **R**ead **U**pdate **D**elete is 4 basic functions of persistent storage.

## Install

`npm i restafary --save`

## REST

|Name         |Method   |Query          |Body               |Description                    |
|:------------|:--------|:--------------|:------------------|:------------------------------|
|`fs`         |`GET`    |               |                   |get file or dir content        |
|             |         |`raw`          |                   |get file or raw dir content    |
|             |         |`size`         |                   |get file or dir size           |
|             |         |`time`         |                   |get time of file change        |
|             |         |`hash`         |                   |get file hash                  |
|             |         |`beautify`     |                   |beautify js, html, css         |
|             |         |`minify`       |                   |minify js, html, css           |
|             |`PUT`    |               |file content       |create/write file              |
|             |         | `unzip`       |file content       |unzip and create/write file    |
|             |         | `dir`         |                   |create dir                     |
|             |`PATCH`  |               |diff               |patch file                     |
|             |`DELETE` |               |                   |delete file                    |
|             |         |`files`        |Array of names     |delete files                   |

## How to use?

```js
var restafary   = require('restafary');
    http        = require('http'),
    express     = require('express'),
    
    app         = express(),
    server      = http.createServer(app),
    
    port        = 1337,
    ip          = '0.0.0.0';
    
app.use(restafary({
    prefix: '/fs',  /* default                              */
    root: '/'       /* default, coud be string or function  */
}));

app.use(express.static(__dirname));

server.listen(port, ip);
```

## License

MIT

[NPMIMGURL]:                https://img.shields.io/npm/v/restafary.svg?style=flat
[BuildStatusIMGURL]:        https://img.shields.io/travis/coderaiser/node-restafary/master.svg?style=flat
[DependencyStatusIMGURL]:   https://img.shields.io/gemnasium/coderaiser/node-restafary.svg?style=flat
[LicenseIMGURL]:            https://img.shields.io/badge/license-MIT-317BF9.svg?style=flat
[NPMURL]:                   https://npmjs.org/package/restafary "npm"
[BuildStatusURL]:           https://travis-ci.org/coderaiser/node-restafary  "Build Status"
[DependencyStatusURL]:      https://gemnasium.com/coderaiser/node-restafary "Dependency Status"
[LicenseURL]:               https://tldrlegal.com/license/mit-license "MIT License"

