module.exports.init = function(){
  var logger = require('./logger')
  var http = require('http');
  var mongoose = require('mongoose');
  var Song = mongoose.model('Song');
  var existingSong = {};

  var songArray = [];

  getSongs = function() {
    logger.write('(bold)Getting last tracks...');
    http.get({
        host: 'radiopleer.com',
        path: '/info/nashe_last_tracks.txt'
    }, function(response) {
        // Continuously update stream with data
        var songList = '';
        if (response.statusCode === 200) {
          response.on('data', function(data) {
              songList += data;
          });
          response.on('end', function() {
              logger.write('(green)Track list received');
              separateSongs(songList);
          });
        } else {
          logger.write('(red)Could not get tracks (Check internet connection)');
        }
    })
    .on('error', function(e) {
      logger.write('(red)Could not connect to server. Retrying in 1 minute.');
      setTimeout(getSongs, 60000);
    });
  };

  separateSongs = function(songList) {
    songArray = songList.split(/\r\n|\r|\n/);
    for (i = 0; i < songArray.length - 1; i++) {
      //Removed brackers and fullstop to prevent the RegExp from breaking
      songArray[i] = songArray[i].replace('<li>', '').replace('</li>', '').replace('(', '').replace(')', '').replace('{', '').replace('}', '').replace('.', '');
      songExists(songArray[i]);
    };
  };

  songExists = function(song) {
    Song.findOne({title: new RegExp(song.substring(6), 'i')}, function(err, res) {
      if (err) {
        return logger.write('(red)Cannot connect to DB: ', err);
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
            return logger.write('(red)Error incrementing: ', err);
          }
          if (res) {
            return logger.write('Incremented: ', song.substring(6));
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
        return logger.write('(red)Error saving new track: ', err);
      };
      logger.write('Added: ' + song.substring(6));
    });
  };

  getSongs();
  //Get songs every 20 minutes
  setInterval(function() {
    getSongs();
  //}, 10000);
}, 80000 * 20);

};
