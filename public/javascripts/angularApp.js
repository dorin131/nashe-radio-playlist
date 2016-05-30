(function() {
  var app = angular.module('nashePlaylist', []);

  app.controller('MainController', ['$scope', function($scope) {
    $scope.test = 'Hello World';
  }]);
})();
