const pdf = require('html-pdf');
const express = require('express');
const bodyParser = require('body-parser')
const fs = require('fs');
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
}))

app.get('/', function(req, res, next) {
  res.sendFile(__dirname + '/test.html');
});

app.post('/pdf', function(req, res, next) {
  res.set('Content-Type', 'application/pdf');
  pdf.create(req.body.html, paperFormat).toStream(function(err, stream) {
    stream.pipe(fs.createWriteStream(backupPath + '/' + req.body.id + '_' +
      moment().format("YYYYMMDDHHmmss") + '.pdf'))
    stream.pipe(res);
  });
});

app.listen(3000);
