'use strict';

/**
 * @ngdoc function
 * @name teemOpsApp.factory:httpErrorHandler
 * @description
 * # httpErrorHandler
 */

angular.module('teemOpsApp')
  .factory('httpErrorHandler', ['$q', 'ENV', function($q, ENV) {

    var httpErrorHandler = {

      request: function (config) {
         config.timeout = ENV.httpTimeout;
         return config;
      }/*,

      responseError: function(response) {
        console.log(response);
        return $q.reject(response);
      }*/
    };

    return httpErrorHandler;

  }]);
