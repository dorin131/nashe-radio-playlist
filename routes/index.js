var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Song = mongoose.model('Song');

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
