'use strict';

/**
 * @ngdoc function
 * @name teemOpsApp.service:UserCloudProviderService
 * @description
 * # UserCloudProviderService
 * UserCloudProviderService of the teemOpsApp
 */

angular.module('teemOpsApp')
  .service('UserCloudProviderService', ['$http', '$cacheFactory', '$timeout', '$q', 'ENV', function($http, $cacheFactory, $timeout, $q, ENV){

    return {
      addCloudProviderAccount: function(data){
        var deferred = $q.defer();

        data.isDefault = data.isDefault ? 1 : 0;
        
        $http.put(ENV.apiEndpoint + '/usercloudproviders', data)
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

      removeCloudProviderAccount: function(userId, id){
        var deferred = $q.defer();
        var params = { id: id, userId: userId};

        $http.delete(ENV.apiEndpoint + '/usercloudproviders/' + JSON.stringify(params))
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

      updateCloudProviderAccount: function(userId, data){
        var deferred = $q.defer();

        data.userId = userId;
        data.isDefault = data.isDefault ? 1 : 0;

        $http.post(ENV.apiEndpoint + '/usercloudproviders', data)
          .then(function(response){

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
      }
    };

  }]);
