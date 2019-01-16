'use strict';

/**
 * @ngdoc function
 * @name teemOpsApp.factory:authTokenHandler
 * @description
 * # authTokenHandler
 */

angular.module('teemOpsApp')
  .factory('authTokenHandler', ['$q', 'jwtFactory', '$location',
    function($q, jwtFactory, $location) {
      return {

          //If an auth token exists attach to each request
          request: function (config) {

            // Exclude html template requests
            if (config.url.substr(config.url.length - 5) === '.html') {
              return config;
            }

            config.headers = config.headers || {};
            var token = jwtFactory.getToken();

            if (token) {
               config.headers['x-access-token'] = token;
            }

            return config;
          },
          responseError: function(response) {
            if(response.status === 401 || response.status === 403) {
                $location.path('/login');
            }
            return $q.reject(response);
          }
      };
  }]);
