module.exports.init = function(){
  var http = require('http');
  var mongoose = require('mongoose');
  var Song = mongoose.model('Song');
  var existingSong = {};

  var songArray = [];

  //Get songs every 20 minutes
  setInterval(function() {
    getSongs();
  //}, 10000);
  }, 60000 * 20);

  getSongs = function() {
    http.get({
        host: 'radiopleer.com',
        path: '/info/nashe_last_tracks.txt'
    }, function(response) {
        // Continuously update stream with data
        var songList = '';
        response.on('data', function(data) {
            songList += data;
        });
        response.on('end', function() {
            separateSongs(songList);
        });
        response.on('error', function() {
          console.log('Could not get playlist');
        });
    });
  };

  separateSongs = function(songList) {
    songArray = songList.split(/\r\n|\r|\n/);
    for (i = 0; i < songArray.length - 1; i++) {
      songArray[i] = songArray[i].replace('<li>', '').replace('</li>', '');
      songExists(songArray[i]);
    };
  };

  songExists = function(song) {
    Song.findOne({title: new RegExp(song.substring(6), 'i')}, function(err, res) {
      if (err) {
        return console.log('Cannot connect to DB: ', err);
      }
      if (res) {
        existingSong = res;
        incrementCounter(song);
      } else {
        addNewSong(song);
      }
    });
  };

  incrementCounter = function(song) {
    todayDate = new Date();
    if (!((song.substring(0, 5) === existingSong.airTime) && (todayDate.toLocaleDateString() === existingSong.lastTimePlayed.toLocaleDateString()))) {
      Song.findOneAndUpdate(
        {title: new RegExp(song.substring(6), 'i')},
        {timesPlayed: existingSong.timesPlayed + 1, airTime: song.substring(0, 5), lastTimePlayed: todayDate},
        function(err, res) {
          if (err) {
            return console.log('Error incrementing: ', err);
          }
          if (res) {
            return console.log('Incremented: ', song.substring(6));
          }
      });
    }
  };

  addNewSong = function(song) {
    var newSong = new Song({
      title: song.substring(6),
      airTime: song.substring(0, 5)
    });
    newSong.save(function(err, res) {
      if (err) {
        return console.log('Error saving new song: ', err);
      };
      console.log('Added: ' + song.substring(6));
    });
  };

};
