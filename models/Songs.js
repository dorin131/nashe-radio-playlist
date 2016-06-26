'use strict';

var mongoose = require('mongoose');

var SongSchema = new mongoose.Schema({
  title: String,
  airTime: String,
  timesPlayed: {type: Number, default: 1},
  lastTimePlayed: {type: Date, default: Date.now},
  downloaded: {type: Boolean, default: false}
});

mongoose.model('Song', SongSchema);
