module.exports.init = function(){
  var http = require('http');

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
      songArray[i] = songArray[i].replace('<li>', '').replace('</li>', '').substring(6);
      console.log('Song ' + (i+1) + ': ' + songArray[i]);
      saveSong(songArray[i]);
    };
  };

  saveSongs = function(song){
    if (songExists(song)) {
      incrementCounter(song);
    } else {
      addNewSong(song);
    };
  };

};
