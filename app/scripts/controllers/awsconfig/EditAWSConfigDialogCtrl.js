'use strict';

/**
 * @ngdoc function
 * @name teemOpsApp.controller:EditAWSConfigDialogCtrl
 * @description
 * # EditAWSConfigDialogCtrl
 * Allow's a user to edit an AWS config
 */
angular.module('teemOpsApp')
  .controller('EditAWSConfigDialogCtrl', ['$scope', '$rootScope', '$timeout',
    'UserService', 'UserCloudConfigService', 'UserCloudProviderService', 'mdPanelRef', 'config', 'cloudProviders',
    function ($scope, $rootScope, $timeout,
      UserService, UserCloudConfigService, UserCloudProviderService, mdPanelRef, config, cloudProviders) {

      var self = this;
      var awsCloudProviderId = 1; //TODO read from DB

      $scope.cancel = function(){
        self.closeDialog();
      };

      $scope.save = function(valid){

        $scope.awsConfigForm.submitted = true;

        if(valid) {

          if(!$scope.config.userCloudProviderId && $scope.config.awsAccountId) {

            var onSuccess = function(result){
              $scope.config.userCloudProviderId = result.id;
              self.updateConfig();
            };

            self.createNewCloudProviderAccount(onSuccess);
          }
          else {
            self.updateConfig();
          }
        }
      };

      self.createNewCloudProviderAccount = function(onSuccess){
        var data = {
          userId: $rootScope.currentUser.userid,
          cloudProviderId: awsCloudProviderId,
          awsAccountId: $scope.config.awsAccountId,
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

      self.updateConfig = function(){
        UserCloudConfigService.update($rootScope.currentUser.userid, $scope.config)
          .then(function(result){

            if(result.status === 'success'){
              self.closeDialog();
            }

          })
          .catch(function(){
            //TODO: Handle error
            //MessageService.setMessage('error', error);
          })
      }

      self.closeDialog = function(){
        if(mdPanelRef){
          mdPanelRef.close();
        }
      };

      self.init = function(){

        if(config.userCloudProviderId) {
          config.awsAccountId = null;
        }

        $scope.instanceTypes = UserCloudConfigService.getInstanceTypeList();
        $scope.cloudProviders = cloudProviders;
        $scope.config= config;

        $timeout(function() {
          $scope.awsConfigForm.appInstanceType.$validate();
          $scope.awsConfigForm.selectAccountId.$validate();
        }, 400);

      };

      self.init();

    }]);
