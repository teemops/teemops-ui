'use strict';

/**
 * @ngdoc function
 * @name teemOpsApp.service:UserService
 * @description
 * # UserService
 * UserService of the teemOpsApp
 */

angular.module('teemOpsApp')
  .service('UserService', function($http, $cacheFactory, $timeout, $q, ENV){

    return {
      create: function (user){
        var deferred = $q.defer();

        $http.put(ENV.apiEndpoint + '/users', user)
          .then(function(response){

            if(response.data && response.data.userid > 0) {
              deferred.resolve({status: 'success'});
            }
            else {
              deferred.reject({status: 'error'});
            }
          })
          .catch(function() {
            deferred.reject({ status: 'error' });
          });

        return deferred.promise;

    	},

      doesUserExist: function (usernameOrEmail) {
        var deferred = $q.defer();

        $http.get(ENV.apiEndpoint + '/users/check/' + usernameOrEmail)
          .then(function(response){
            if(response.data) {
              deferred.resolve({
                status: 'success',
                unique: !response.data.result
              });
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

      confirmRegistration: function(code){
        var deferred = $q.defer();

        $http.get(ENV.apiEndpoint + '/users/confirm/' + code)
          .then(function(response){

            if(response.data) {
              deferred.resolve({
                status: response.data.status === 'true' ? 'success' : 'error'
              });
            }
          })
          .catch(function(){
            deferred.reject({ status: 'error' });
          });

        return deferred.promise;
      },

      requestConfirmationEmail: function(email){
        //TODO implement api call to request a new email

        var deferred = $q.defer();
        deferred.resolve({ status : 'success', email : email });
        return deferred.promise;
      },

      getUserByID: function(id){
        var deferred = $q.defer();

        $http.get(ENV.apiEndpoint + '/users/' + id)
          .then(function(response){

            if(response.data && response.data.result && response.data.result.length === 1) {
              var user = response.data.result[0];
              user.cloudProviders = JSON.parse(user.cloudProviders);
              deferred.resolve(user);
            }
          })
          .catch(function(){
            deferred.reject({ status: 'error' });
          });

        return deferred.promise;
      }
    };
  });
