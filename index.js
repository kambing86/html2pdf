const pdf = require('html-pdf');
const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');
const fs = require('fs');
const xz = require('xz');
const moment = require('moment');

const app = express();
const paperFormat = {
  "format": "A4",
  "orientation": "portrait"
};
const backupPath = __dirname + '/bak';

if (!fs.existsSync(backupPath))
  fs.mkdirSync(backupPath);

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(compression());

app.get('/', function(req, res, next) {
  res.sendFile(__dirname + '/test.html');
});

app.post('/pdf', function(req, res, next) {
  if (!(!!req.body.id))
  {
    res.end("Please provide id");
    return;
  }
  res.set('Content-Type', 'application/pdf');
  pdf.create(req.body.html, paperFormat).toStream(function(err, stream) {
    var filename = backupPath + '/' + req.body.id + '_' + moment().format("YYYYMMDDHHmmss") + '.pdf.xz';
    var compressor = new xz.Compressor(9);
    stream.pipe(compressor).pipe(fs.createWriteStream(filename));
    stream.pipe(res);
  });
});

app.listen(3000);
