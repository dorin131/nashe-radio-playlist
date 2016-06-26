'use strict';

module.exports.init = function() {
  var download = require('url-download');
  var request = require('request');
  var mongoose = require('mongoose');
  var Song = mongoose.model('Song');

  var allSongs = {};
  var currentSong = 0;
  var songsDownloaded = 0;

  //Get all songs
  function getAllSongs() {
    Song.find(function(err, songs) {
      if (err) {
        return next(err);
      };
      allSongs = songs;
      currentSong = 0;
      findSong();
    });
  };

  function findSong() {
    if (allSongs[currentSong].downloaded === false){
      var url = 'http://go.mail.ru/zaycev?q=' + encodeURIComponent(allSongs[currentSong].title);
      request(url, function(err, res, body) {
        var url = getUrl('http://zaycev.net/pages', body, '?');
        if (url) {
          request(url, function (err, res, body) {
            var songUrl = getUrl('http://cdndl.zaycev.net/', body, '"');
            if (songUrl) {
              setTimeout(() => {downloadSong(songUrl)}, Math.random() * 1000);
            } else {
              setTimeout(() => {goToNextSong()}, Math.random() * 1000);
            }
          });
        } else {
          setTimeout(() => {goToNextSong()}, Math.random() * 1000);
        }
      });
    } else {
      goToNextSong();
    }
  };

  function getUrl(substring, string, lastChar) {
    var start = string.indexOf(substring);
    var end = 0;
    if (start !== -1) {
      while (string[start + end] !== lastChar) {
        end++;
      }
      return string.substring(start, start + end);
    } else {
      console.info('Song not found: ' + allSongs[currentSong].title);
      return null;
    }
  };

  function downloadSong(songUrl) {
    console.info('#green{Getting:} ' + songUrl);
    download(songUrl, './songs/')
      .on('close', function () {
        songsDownloaded++;
        console.info('#green{Downloaded successful!} (' + songsDownloaded + ' this session)');
        markAsDownloaded(currentSong);
        goToNextSong();
      })
      .on('invalid', function () {
        console.error('#red{Invalid URL:} ' + songUrl);
        //setTimeout(downloadSong(songUrl), 5000);
        setTimeout(() => {goToNextSong()}, Math.random() * 1000);
      })
  };

  function goToNextSong() {
    currentSong++;
    if (allSongs.length > currentSong){
      findSong();
    } else {
      console.info('#green{Tried to download all songs. Getting full list again in 20 minutes.}');
      setTimeout(() => {getAllSongs()}, 80000 * 20);
    }
  };

  function markAsDownloaded(songIndex) {
    Song.findOneAndUpdate(
      {title: new RegExp(allSongs[songIndex].title, 'i')},
      {downloaded: true},
      function(err, res) {
        if (err) {
          return console.error('Error marking song as downloaded: ', err);
        }
        if (res) {
          return console.info('Marked #blue{' + allSongs[songIndex].title + '} as downloaded.');
        }
    });
  };

  getAllSongs();

  //Set downloaded to false for all collections
  //Song.update({}, {downloaded: false}, {multi: true}, function(err) {});
};
