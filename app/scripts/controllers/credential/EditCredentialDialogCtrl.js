'use strict';

/**
 * @ngdoc function
 * @name teemOpsApp.controller:EditCredentialDialogCtrl
 * @description
 * # EditCredentialDialogCtrl
 * Allow's a user to edit their AWS credentials
 */
angular.module('teemOpsApp')
  .controller('EditCredentialDialogCtrl', ['$scope', '$rootScope', 'CredentialService', 'UserService', 'UserCloudProviderService',
      'mdPanelRef', 'credential', 'cloudProviders',
    function ($scope, $rootScope, CredentialService, UserService, UserCloudProviderService,
      mdPanelRef, credential, cloudProviders) {

      var self = this;
      var awsCloudProviderId = 1; //TODO read from DB

      $scope.cancel = function(){
        self.closeDialog();
      };

      $scope.save = function(valid){

        if(valid) {
          if(!$scope.credential.userCloudProviderId && $scope.credential.awsAccountId) {

            var onSuccess = function(result){
              $scope.credential.userCloudProviderId = result.id;
              self.updateCredential();
            };

            self.createNewCloudProviderAccount(onSuccess);
          }
          else {
            self.updateCredential();
          }
        }
      };

      self.createNewCloudProviderAccount = function(onSuccess){
        var data = {
          userId: $rootScope.currentUser.userid,
          cloudProviderId: awsCloudProviderId,
          awsAccountId: $scope.credential.awsAccountId,
          isDefault: false
        };

        UserCloudProviderService.addCloudProviderAccount(data)
          .then(function(result){
            onSuccess(result);
          })
          .catch(function(result){
            //TODO
          });
      };

      self.updateCredential = function(){
        CredentialService.update($rootScope.currentUser.userid, $rootScope.currentUser.username, $scope.credential)
          .then(function(result){

            if(result.status === 'success'){
              self.closeDialog();
            }

          })
          .catch(function(){
            //TODO: Handle error in EditCredentialCtrl save
            //MessageService.setMessage('error', error);
          })
          .finally(function(){
            //$scope.processing = false;
          });
      }

      self.closeDialog = function(){
        if(mdPanelRef){
          mdPanelRef.close();
        }
      };

      self.init = function(){

        $scope.cloudProviders = cloudProviders;
        $scope.credential= credential;
      };

      self.init();

    }]);
