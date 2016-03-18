const pdf = require('html-pdf');
const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');
const fs = require('fs');
const xz = require('xz');
const moment = require('moment');

const app = express();

app.use('/static', express.static('static'));
app.use('/pdf', express.static('bak'));

app.engine('html', function(filePath, options, callback) { // define the template engine
  fs.readFile(filePath, function(err, content) {
    console.log("run");
    if (err) return callback(new Error(err));
    var rendered = content.toString();
    console.log(options.replace);
    for (var i in options.replace) {
      rendered = rendered.replace(new RegExp('#' + i + '#', 'g'), options.replace[i]);
    }
    // console.log(rendered);
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

if (!fs.existsSync(backupPath))
  fs.mkdirSync(backupPath);

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(compression());

// app.get('/', function(req, res, next) {
//   res.sendFile(__dirname + '/test.html');
// });
//
// app.post('/pdf', function(req, res, next) {
//   if (!(!!req.body.id)) {
//     res.end("Please provide id");
//     return;
//   }
//   res.set('Content-Type', 'application/pdf');
//   pdf.create(req.body.html, paperFormat).toStream(function(err, stream) {
//     var filename = backupPath + '/' + req.body.id + '_' + moment().format("YYYYMMDDHHmmss") + '.pdf.xz';
//     var compressor = new xz.Compressor(9);
//     stream.pipe(compressor).pipe(fs.createWriteStream(filename));
//     stream.pipe(res);
//   });
// });

// app.get('/getCoupon', function(req, res, next) {
//   var uid = "test";
//   var coupon = {
//     "id": 79063,
//     "code": "BW1061463899",
//     "deal": {
//       "id": "1427",
//       "intName": "BW_D2_1::55303E140FB54CD7BD748FE6EBC67664",
//       "numRemain": "",
//       "actRemain": "",
//       "valStart": "2015-10-31T16:00:00.000Z",
//       "valEnd": "2016-06-30T15:59:00.000Z",
//       "pubStart": "2015-10-31T16:00:00.000Z",
//       "pubEnd": "2016-06-30T15:59:00.000Z",
//       "redMsg": "",
//       "redType": "Coupon Deal",
//       "gamesOnly": true,
//       "vExpiry": "2016-06-30T15:59:00.000Z",
//       "valHours": 168,
//       "buyNowUrl": "",
//       "bookUrl": "",
//       "bookUrlTitle": "",
//       "buyNowUrlTitle": "",
//       "checkoutUrl": "",
//       "isCANValidateReq": 0,
//       "isEticketCoupon": 0,
//       "ticketTitle": "",
//       "ticketDescription": "",
//       "ticketInstruction": "",
//       "ticketTNC": "",
//       "prefix": "BW",
//       "fav": 0,
//       "viewcount": 0,
//       "pid": ["product:LiveFresh.2", "product:POSBEveryday.25", "product:DBSWomenCard.27", "product:DBSSafra.84", "product:3rsMasterCard®Card.133", "product:BlackCard.155", "product:PAssionPOSBDebitCard.156", "product:TestNewProd.159", "product:NewProduct.185", "product:CapitaCard.215", "product:AltitudeCard.240", "product:DBSCards.266", "product:DBSNUSAluminiCard.268", "product:3RPOSB365card.279", "product:3R365DBSeverydaycard.281", "product:NewProduct.285"],
//       "catId": ["major:Food.6"],
//       "subCatId": ["minor:Korean.9"],
//       "name": "BW_D2_1",
//       "smallImage": "https://dbs-s3-dev.3radical.com/uploaded_pictures/1423063147.NH_poutine.320x240.clip.jpg",
//       "largeImage": "https://dbs-s3-dev.3radical.com/uploaded_pictures/1423063147.NH_poutine.jpg",
//       "termCond": "BW_D2_1",
//       "desc": "BW_D2_1",
//       "merchant": {
//         "name": "banwei's merchant",
//         "address": "",
//         "phone": "",
//         "url": "www.3radical.com",
//         "email": "banwei.chua@3radical.com",
//         "id": "160",
//         "outlets": []
//       },
//       "unlockCode": "136443703480869",
//       "statusTag": "",
//       "perDevRemain": 0
//     },
//     "expiry": "2016-03-25T02:09:52.000Z",
//     "redemptiondate": ""
//   };
//   var obj = {
//     title: coupon.deal.name,
//     imageUrl: coupon.deal.largeImage,
//     message: coupon.deal.desc,
//     message2: coupon.deal.termCond,
//     mode: 'printCoupon',
//     code: coupon.code,
//     expiry: moment(coupon.expiry).format("YYYY-MM-DD HH:mm")
//   };
//   app.render('coupon', {
//     replace: obj
//   }, function(err, html) {
//     pdf.create(html, paperFormat).toStream(function(err, stream) {
//       var filename = backupPath + '/' + uid + '_' + moment().format("YYYYMMDDHHmmss") + '.pdf';
//       var fileStream = fs.createWriteStream(filename);
//       stream.pipe(fileStream);
//       fileStream.on('finish', () => {
//         obj.mode = '';
//         obj.url = filename.replace(backupPath, '/pdf');
//         res.render('coupon', {
//           replace: obj
//         });
//       });
//     });
//   });
// });

app.post('/getCoupon', function(req, res, next) {
  if (!!!req.body.uid) {
    res.end("Please provide uid");
    return;
  }
  if (!!!req.body.coupon) {
    res.end("Please provide coupon");
    return;
  }
  var uid = req.body.uid;
  var coupon = JSON.parse(req.body.coupon);
  var obj = {
    title: coupon.deal.name,
    imageUrl: coupon.deal.largeImage,
    message: coupon.deal.desc,
    message2: coupon.deal.termCond,
    mode: 'printCoupon',
    code: coupon.code,
    expiry: moment(coupon.expiry).format("YYYY-MM-DD HH:mm")
  };
  app.render('coupon', {
    replace: obj
  }, function(err, html) {
    pdf.create(html, paperFormat).toStream(function(err, stream) {
      var filename = backupPath + '/' + uid + '_' + moment().format("YYYYMMDDHHmmss") + '.pdf';
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
