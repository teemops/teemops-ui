'use strict';

/**
 * @ngdoc function
 * @name teemOpsApp.service:CloudApiService
 * @description
 * # CloudApiService
 * CloudApiService of the teemOpsApp
 */

angular.module('teemOpsApp')
  .service('CloudApiService', ['$http', '$q', 'ENV',
    function($http, $q, ENV){

      return {
        /**
         * @name getData
         * @description
         * task is required as an api path eg. /vpcs/list
         */
        getVPCData: function(task, arn, region){
          var deferred = $q.defer();
          var data = {
            RoleArn: arn,
            region: region
          };

          var endpoint = ENV.cloudapiEndpoint + task;
          var method = 'POST';

          if(ENV.useSampleData) {
            endpoint = '/sampledata/vpc.json';
            method = 'GET';
          }

          $http({
            method: method,
            url: endpoint,
            data: data
          })
          .then(function(response){
            deferred.resolve(response.data);
          })
          .catch(function(err) {
            deferred.reject(err);
          });
          return deferred.promise;
        }
      };
  }]);
