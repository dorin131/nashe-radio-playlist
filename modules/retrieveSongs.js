module.exports.init = function(){
  var http = require('http');
  var mongoose = require('mongoose');
  var Song = mongoose.model('Song');

  var songArray = [];

  //Get songs every 10 seconds
  setInterval(function() {
    getSongs();
  }, 10000);

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
    });
  };

  separateSongs = function(songList) {
    songArray = songList.split(/\r\n|\r|\n/);
    for (i = 0; i < songArray.length - 1; i++) {
      songArray[i] = songArray[i].replace('<li>', '').replace('</li>', '');
      //console.log('Song ' + (i+1) + ': ' + songArray[i]);
      songExists(songArray[i]);
    };
  };

  songExists = function(song) {
    Song.findOne({title: new RegExp(song.substring(6), 'i')}, function(err, res) {
      if (err) {
        return console.log('Error', err);
      }
      if (res) {
        incrementCounter(song);
      } else {
        addNewSong(song);
      }
    });
  };

  incrementCounter = function(song) {
    console.log('Song exists. Incrementing.');
  };

  addNewSong = function(song) {
    var song = new Song({
      title: song.substring(6),
      airTime: song.substring(0, 5)
    });
    song.save(function(err, res) {
      if (err) {
        return console.log('Error: ', err);
      };
      console.log('Song added to db');
    });
  };

};
