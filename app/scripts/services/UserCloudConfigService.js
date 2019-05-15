'use strict';

/**
 * @ngdoc function
 * @name teemOpsApp.service:UserCloudConfigService
 * @description
 * # UserCloudConfigService
 * UserCloudConfigService of the teemOpsApp
 */

angular.module('teemOpsApp')
  .service('UserCloudConfigService', ['$http', '$cacheFactory', '$timeout', '$q', '$filter', 'ENV',
    function($http, $cacheFactory, $timeout, $q, $filter, ENV){

    return {

      getAllByUserId: function(userId, userCloudProviderId){
        var deferred = $q.defer();

        $http.get(ENV.apiEndpoint + '/usercloudconfigs/listByUserId/' + userId) //Auth user id passed by default
          .then(function(response){

            if(response && response.data && response.data.result) {
              var configs = response.data.result;

              if(userCloudProviderId) {
                configs = $filter('filter')(configs, { userCloudProviderId : userCloudProviderId });
              }

              deferred.resolve(configs);
            }
            else {
              deferred.reject({ status: 'error' });
            }
          })
          .catch(function(){
            deferred.reject({ status: 'error' });
          });

        return deferred.promise;
      },

      create: function(userId, data){
        var deferred = $q.defer();

        data.userId = userId;

        $http.put(ENV.apiEndpoint + '/usercloudconfigs', data)
          .then(function(response){

            if(response && response.data && response.data.id) {
              deferred.resolve({ status: 'success', id : response.data.id});
            }
            else {
              deferred.reject({ status: 'error' });
            }
          })
          .catch(function(error){
            deferred.reject({ status: 'error', error: error });
          });

        return deferred.promise;
      },

      update: function(userId, data){
        var deferred = $q.defer();

        data.userId = userId;

        $http.post(ENV.apiEndpoint + '/usercloudconfigs', data)
          .then(function(response){

            if(response && response.data && response.data.success) {
              deferred.resolve({ status: 'success' });
            }
            else {
              deferred.reject({ status: 'error' });
            }
          })
          .catch(function(error){
            deferred.reject({ status: 'error', error: error });
          });

        return deferred.promise;
      },

      delete: function(id, userId){
        var deferred = $q.defer();
        var params = { id: id, userId: userId};

        $http.delete(ENV.apiEndpoint + '/usercloudconfigs/' + JSON.stringify(params))
          .then(function(response){

            console.log(response);

            if(response && response.data.success === 'true'){
              deferred.resolve({ status: 'success' });
            }
            else {
              deferred.reject({ status: 'error', message: response.data.error });
            }
          })
          .catch(function(){
            deferred.reject({ status: 'error'});
          });

        return deferred.promise;
      },

      getInstanceTypeList: function(region){
        var deferred = $q.defer();
        var data={
          region:region
        }
        $http.post(ENV.apiEndpoint + '/pricing/instance_types', data)
          .then(function(response){

            if(response && response.data) {
              deferred.resolve(response.data);
            }
            else {
              deferred.reject({ status: 'error' });
            }
          })
          .catch(function(error){
            deferred.reject({ status: 'error', error: error });
          });

        return deferred.promise;
      }
    };
  }]);
