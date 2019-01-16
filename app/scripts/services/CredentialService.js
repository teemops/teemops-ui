'use strict';

/**
 * @ngdoc function
 * @name teemOpsApp.service:CredentialService
 * @description
 * # CredentialService
 * CredentialService of the teemOpsApp
 */

angular.module('teemOpsApp')
  .service('CredentialService', ['$http', '$q', '$filter', 'ENV',
    function($http, $q, $filter, ENV){

      return {

        create: function(userId, username, credential){
          var deferred = $q.defer();

          credential.authData.createdById = userId;
          credential.authData.createdByUsername = username;
          credential.authData.createdDate = new Date();

          var data = {
            userId: userId,
            userCloudProviderId: credential.userCloudProviderId,
            awsAuthMethod:'IAM',
            authData: JSON.stringify(credential.authData)
          };

          $http.put(ENV.apiEndpoint + '/credentials', data)
            .then(function(response){

              if(response.data && response.data.credentialId > 0) {
                deferred.resolve({status: 'success', credentialId: response.data.credentialId });
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

        update: function(userId, username, credential){

          var deferred = $q.defer();

          credential.authData.updatedBy = userId;
          credential.authData.updatedByUsername = username;
          credential.authData.updatedDate = new Date();

          var data = {
            id: credential.id,
            userCloudProviderId: credential.userCloudProviderId,
            authData: JSON.stringify(credential.authData)
          };

          $http.post(ENV.apiEndpoint + '/credentials', data)
            .then(function(response){

              if(response.data && response.data.success) {
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

        delete: function(credentialId){

          var deferred = $q.defer();

          $http.delete(ENV.apiEndpoint + '/credentials/' + credentialId)
            .then(function(response){

              if(response.data && response.data.success) {
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

        getAllByUserId: function(userId, userCloudProviderId){
          var deferred = $q.defer();

          $http.get(ENV.apiEndpoint + '/credentials/listByUserId/' + userId)
            .then(function(response){

              var returnData = [];

              if(response.data && response.data.length > 0) {

                var credentials = response.data;

                if(userCloudProviderId) {
                  credentials = $filter('filter')(credentials, { user_cloud_provider_id : userCloudProviderId }); //jshint ignore:line
                }

                for(var i=0;i<credentials.length;i++){

                  returnData.push({
                    id: credentials[i].id,
                    userCloudProviderId: credentials[i].user_cloud_provider_id, //jshint ignore:line
                    displayAWSAccountId: credentials[i].aws_account_id, //jshint ignore:line
                    authData: JSON.parse(credentials[i].auth_data) // jshint ignore:line
                  });
                }
              }

              deferred.resolve(returnData);
              
            })
            .catch(function() {
              deferred.reject({ status: 'error' });
            });

          return deferred.promise;
        }
      };
  }]);
