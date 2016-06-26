var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Song = mongoose.model('Song');

var json2csv = require('json2csv');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET songs */
router.get('/songs', function(req, res, next) {
  Song.find(function(err, songs) {
    if (err) {
      return next(err);
    };
    res.json(songs);
  });
});

/* Download list */
router.get('/download', function(req, res, next) {
  Song.find({title: /.*/i}).lean().exec(function (err, file) {
    json2csv({ data: file, fields: ['title'] }, function(err, csv) {
      if (err) console.log(err);
      res.header('content-type','text/csv');
      res.header('content-disposition', 'attachment; filename=songs.csv');
      res.end(csv);
    });
  });
});

/* POST songs */
router.post('/songs', function(req, res, next) {
  var song = new Song(req.body);
  song.save(function(err, song) {
    if (err) {
      return next(err);
    };
    res.json(song);
  });
});

module.exports = router;
