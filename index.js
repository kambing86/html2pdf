const pdf = require('html-pdf');
const express = require('express');
const bodyParser = require('body-parser')
const app = express();
const paperFormat = {
  "format": "A4",
  "orientation": "portrait"
};

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', function(req, res, next) {
  res.sendFile(__dirname + '/test.html');
});

app.post('/pdf', function(req, res, next) {
  res.set('Content-Type', 'application/pdf');
  pdf.create(req.body.html, paperFormat).toStream(function(err, stream) {
    stream.pipe(res);
  });
});

app.listen(3000);
