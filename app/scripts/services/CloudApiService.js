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
        getVPCData: function(task, awsAccountId, params, region, filter){
          var deferred = $q.defer();
          var data = {
            awsAccountId: awsAccountId,
            task: task,
            params: params,
            region: region
          };
          if(filter!=null){
            data['filter']=filter;
          }

          var endpoint = ENV.apiEndpoint + '/apps/ec2';
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
        },
        /**
         * @name Generic AWS API Task
         * @description
         * task is required as an api path eg. /vpcs/list
         */
        generic: function(service, task, awsAccountId, params, region, filter){
          var deferred = $q.defer();
          var data = {
            awsAccountId: awsAccountId,
            className: service,
            task: task,
            params: params,
            region: region
          };
          if(filter!=null){
            data['filter']=filter;
          }

          var endpoint = ENV.apiEndpoint + '/apps/general';
          var method = 'POST';

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
        },
        
      };
  }]);
