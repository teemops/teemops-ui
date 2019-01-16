'use strict';

/**
 * @ngdoc function
 * @name teemOpsApp.factory:httpDelay
 * @description
 * # httpDelay
 */

angular.module('teemOpsApp')
  .factory('httpDelay', ['$timeout', '$q', function($timeout, $q) {

    var delayInMilliseconds = 800;

    var delay = function(response) {
      var deferred = $q.defer();

      $timeout(function() {
        deferred.resolve(response);
      }, delayInMilliseconds, false);

      return(deferred.promise);
    };


    var httpDelay = {

      response: function(response) {
        if(response.config.headers.Accept !== 'text/html') {
          return delay(response);
        }

        return response;
      },

      responseError: function(response) {
        return delay(response);
      }
    };

    return httpDelay;

  }]);
