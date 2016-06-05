(function() {
  var app = angular.module('nashePlaylist', []);

  app.controller('MainController', ['songsService', function(songsService) {
    var ctrl = this;
    songsService.getAllSongs()
    .then(function(res) {
      ctrl.allSongs = res;
    })
    .catch(function(e) {
      console.log('Error getting songs: ', e);
    });
  }]);

  app.service('songsService', ['$q', '$http', function($q, $http) {
    this.getAllSongs = function() {
      return $q(function(resolve, reject) {
        $http.get('/songs')
        .then(function(res) {
          resolve(res.data);
        })
        .catch(function(e) {
          reject(e);
        });
      });
    }
  }]);
})();
