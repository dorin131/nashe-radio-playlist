'use strict';

module.exports.init = function(){
  var http = require('http');
  var mongoose = require('mongoose');
  var Song = mongoose.model('Song');
  var existingSong = {};
  var localTime = new Date();
  var russianTime = new Date();
  russianTime.setHours(localTime.getHours() + 2);
  var songArray = [];

  //Get timestamp for logs
  function t() {
    var h = russianTime.getHours().toString();
    (h.length < 2) ? h = '0' + h : h = h;
    var m = russianTime.getMinutes().toString();
    (m.length < 2) ? m = '0' + m : m = m;
    var s = russianTime.getSeconds().toString();
    (s.length < 2) ? s = '0' + s : s = s;
    return String(`[${h}:${m}:${s}]`);
  }

  function getSongs() {
    console.info('#blue{Getting last tracks...}');
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
              console.info('#green{Track list received}');
              separateSongs(songList);
          });
        } else {
          console.error('#red{Could not get tracks (Check internet connection)}');
        }
    })
    .on('error', function(e) {
      console.error('Could not connect to server. Retrying in 1 minute.');
      setTimeout(getSongs, 60000);
    });
  };

  function separateSongs(songList) {
    songArray = songList.split(/\r\n|\r|\n/);
    for (var i = 0; i < songArray.length - 1; i++) {
      //Removed brackers and fullstop to prevent the RegExp from breaking
      songArray[i] = songArray[i].replace('<li>', '').replace('</li>', '').replace('(', '').replace(')', '').replace('{', '').replace('}', '').replace('.', '');
      songExists(songArray[i]);
    };
  };

  function songExists(song) {
    Song.findOne({title: new RegExp(song.substring(6), 'i')}, function(err, res) {
      if (err) {
        return console.error('Cannot connect to DB: ', err);
      }
      if (res) {
        existingSong = res;
        incrementCounter(song);
      } else {
        addNewSong(song);
      }
    });
  };

  function incrementCounter(song) {
    if (!((song.substring(0, 5) === existingSong.airTime) && (russianTime.toLocaleDateString() === existingSong.lastTimePlayed.toLocaleDateString()))) {
      Song.findOneAndUpdate(
        {title: new RegExp(song.substring(6), 'i')},
        {timesPlayed: existingSong.timesPlayed + 1, airTime: song.substring(0, 5), lastTimePlayed: russianTime},
        function(err, res) {
          if (err) {
            return console.error('Error incrementing: ', err);
          }
          if (res) {
            return; //console.info('Incremented: ', song.substring(6));
          }
      });
    }
  };

  function addNewSong(song) {
    var newSong = new Song({
      title: song.substring(6),
      airTime: song.substring(0, 5),
      lastTimePlayed: russianTime
    });
    newSong.save(function(err, res) {
      if (err) {
        return console.error('Error saving new track: ', err);
      };
      console.info('#green{+} ' + song.substring(6));
    });
  };

  getSongs();
  //Get songs every 20 minutes
  setInterval(function() {
    getSongs();
  //}, 10000);
  }, 80000 * 20);

};
