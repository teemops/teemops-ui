'use strict';

/**
 * @ngdoc function
 * @name teemOpsApp.service:UserService
 * @description
 * # UserService
 * UserService of the teemOpsApp
 * HTTP endpoint: /api/users
 */

angular.module('teemOpsApp')
  .service('UserService', function ($http, $cacheFactory, $timeout, $q, ENV) {

    return {
      create: function (user) {
        var deferred = $q.defer();

        $http.put(ENV.apiEndpoint + '/users', user)
          .then(function (response) {

            if (response.data && response.data.userId > 0) {
              deferred.resolve({ status: 'success' });
            }
            else {
              deferred.reject({ status: 'error' });
            }
          })
          .catch(function () {
            deferred.reject({ status: 'error' });
          });

        return deferred.promise;

      },
      reset: function (user) {
        var deferred = $q.defer();

        $http.post(ENV.apiEndpoint + '/users/reset', user)
          .then(function (response) {

            if (response.data) {
              deferred.resolve({ status: 'success' });
            }
            else {
              deferred.reject({ status: 'error' });
            }
          })
          .catch(function () {
            deferred.reject({ status: 'error' });
          });

        return deferred.promise;

      },
      provideResetCode: function (resetInfo) {
        var deferred = $q.defer();

        $http.post(ENV.apiEndpoint + '/users/reset/code', resetInfo)
          .then(function (response) {

            if (response.data) {
              deferred.resolve({ status: 'success' });
            }
            else {
              deferred.reject({ status: 'error' });
            }
          })
          .catch(function () {
            deferred.reject({ status: 'error' });
          });

        return deferred.promise;

      },

      doesUserExist: function (usernameOrEmail) {
        var deferred = $q.defer();

        $http.get(ENV.apiEndpoint + '/users/check/' + usernameOrEmail)
          .then(function (response) {
            if (response.data) {
              deferred.resolve({
                status: 'success',
                unique: !response.data.result
              });
            }
            else {
              deferred.reject({ status: 'error' });
            }
          })
          .catch(function () {
            deferred.reject({ status: 'error' });
          });

        return deferred.promise;
      },

      confirmRegistration: function (code) {
        var deferred = $q.defer();

        $http.get(ENV.apiEndpoint + '/users/confirm/' + code)
          .then(function (response) {

            if (response.data) {
              deferred.resolve({
                status: response.data.status === 'true' ? 'success' : 'error'
              });
            }
          })
          .catch(function () {
            deferred.reject({ status: 'error' });
          });

        return deferred.promise;
      },

      requestConfirmationEmail: function (email) {
        //TODO implement api call to request a new email

        var deferred = $q.defer();
        deferred.resolve({ status: 'success', email: email });
        return deferred.promise;
      },

      getUserByID: function (id) {
        var deferred = $q.defer();

        $http.get(ENV.apiEndpoint + '/users/' + id)
          .then(function (response) {

            if (response.data && response.data.result && response.data.result.length === 1) {
              var user = response.data.result[0];
              user.cloudProviders = JSON.parse(user.cloudProviders);
              deferred.resolve(user);
            }
          })
          .catch(function () {
            deferred.reject({ status: 'error' });
          });

        return deferred.promise;
      },

      getKeys: function () {
        var deferred = $q.defer();

        $http.get(ENV.apiEndpoint + '/users/keys')
          .then(function (response) {

            if (response.data) {
              var keys = response.data.data;
              deferred.resolve(keys);
            }
          })
          .catch(function () {
            deferred.reject({ status: 'error' });
          });

        return deferred.promise;
      },
      /**
       * Authorises user to have access to SSH keys if they are the master account holder
       * 
       * @param {*} password 
       * @returns true or false if failed based on api call status field returned
       */
      authoriseSSHKeys: function (email, password) {
        var deferred = $q.defer();
        var params = {
          email: email,
          password: password
        };
        $http.post(ENV.apiEndpoint + '/users/login', params)
          .then(function (response) {

            if (response.data) {
              deferred.resolve(response.data.status);
            }
          })
          .catch(function () {
            deferred.reject({ status: 'error' });
          });

        return deferred.promise;
      },
      getKey: function (key) {
        var deferred = $q.defer();
        var params = {
          awsAccountId: key.account,
          region: key.region
        };

        $http.post(ENV.apiEndpoint + '/users/key', params)
          .then(function (response) {

            if (response.data) {

              deferred.resolve(response.data);
            }
          })
          .catch(function () {
            deferred.reject({ status: 'error' });
          });

        return deferred.promise;
      },
    };
  });
