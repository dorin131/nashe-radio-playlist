var mongoose = require('mongoose');

var SongSchema = new mongoose.Schema({
  title: String,
  timesPlayed: {type: Number, default: 1},
  lastTimePlayed: {type: Date, default: Date.now}
});

mongoose.model('Song', SongSchema);
