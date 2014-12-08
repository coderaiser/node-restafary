# Restafary

**REST** for **CRUD** file operations.

## Whot is?

**RE**presentational **S**tate **T**ransfer is an abstraction of the architecture of the World Wide Web.

**C**reate **Read** **U**pdate **D**elete is four basic functions of persistent storage.

## Install

`npm i restafary --save`

## REST

|Name         |Method   |Query          |Body               |Description                    |
|:------------|:--------|:--------------|:------------------|:------------------------------|
|`fs`         |`GET`    |               |                   |get file or dir content        |
|             |         |`size`         |                   |get dir or file size           |
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
    prefix: '/api/v1/fs'
}));

app.use(express.static(__dirname));

server.listen(port, ip);
```

## License

MIT
