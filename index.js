"use strict";
const pdf = require('html-pdf');
const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');
const fs = require('fs');
// const xz = require('xz');
const moment = require('moment');

const app = express();

// app.use('/static', express.static('static'));
app.use('/pdf', express.static('bak'));

app.engine('html', (filePath, options, callback) => { // define the template engine
  fs.readFile(filePath, (err, content) => {
    if (err) return callback(new Error(err));
    var rendered = content.toString();
    for (var i in options.replace) {
      rendered = rendered.replace(new RegExp('#' + i + '#', 'g'), options.replace[i]);
    }
    return callback(null, rendered);
  });
});
app.set('views', './views'); // specify the views directory
app.set('view engine', 'html'); // register the template engine

const paperFormat = {
  "format": "A4",
  "orientation": "portrait"
};
const backupPath = __dirname + '/bak';

(function() {
  if (!fs.existsSync(backupPath))
    fs.mkdirSync(backupPath);
  var path = backupPath + '/prod';
  if (!fs.existsSync(path))
    fs.mkdirSync(path);
  path = backupPath + '/dev';
  if (!fs.existsSync(path))
    fs.mkdirSync(path);
})();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(compression());

app.post('/getCoupon', (req, res, next) => {
  if (!!!req.body.uid) {
    res.end("Please provide uid");
    return;
  }
  if (!!!req.body.coupon) {
    res.end("Please provide coupon");
    return;
  }
  if (!!!req.body.env) {
    res.end("Please provide environment");
    return;
  }
  var uid = req.body.uid;
  var coupon = JSON.parse(req.body.coupon);
  var env = req.body.env;
  var obj = {
    title: coupon.deal.name,
    imageUrl: coupon.deal.largeImage,
    message: coupon.deal.desc,
    valStart: moment(coupon.deal.valStart).add(8,'hours').format("DD-MMM-YYYY"),
    valEnd: moment(coupon.deal.valEnd).add(8,'hours').format("DD-MMM-YYYY"),
    message2: coupon.deal.termCond,
    mode: 'printCoupon',
    code: coupon.code,
    expiry: moment(coupon.expiry).format("YYYY-MM-DD HH:mm")
  };
  app.render('coupon', {
    replace: obj
  }, (err, html) => {
    pdf.create(html, paperFormat).toStream(function(err, stream) {
      var filename = backupPath + '/' + env + '/' + uid + '_' + moment().format("YYYYMMDDHHmmss") + '.pdf';
      var fileStream = fs.createWriteStream(filename);
      stream.pipe(fileStream);
      fileStream.on('finish', () => {
        obj.mode = '';
        obj.url = filename.replace(backupPath, '/pdf');
        res.render('coupon', {
          replace: obj
        });
      });
    });
  });
});

app.listen(3000);
