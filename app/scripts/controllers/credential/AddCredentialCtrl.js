'use strict';

/**
 * @ngdoc function
 * @name teemOpsApp.controller:AddCredentialCtrl
 * @description
 * # AddCredentialCtrl
 * Adds a user's AWS credentials and links it to their TeemOps account
 */
angular.module('teemOpsApp')
  .controller('AddCredentialCtrl', ['$scope', '$rootScope', '$mdPanel', '$window', '$anchorScroll', '$state', '$timeout',
      'CredentialService', 'UserService', 'AppService', 'UserCloudProviderService',
    function ($scope, $rootScope, $mdPanel, $window, $anchorScroll, $state, $timeout,
      CredentialService, UserService, AppService, UserCloudProviderService) {

      var self = this;
      var awsCloudProviderId = 1; //TODO read from DB

      $scope.simpleView = false;
      $scope.selected = 0;
      $scope.clipboardSupported = 'queryCommandSupported' in document && document.queryCommandSupported('copy');
      $scope.credential = {
        userCloudProviderId: null,
        authData: {
          name: null,
          arn: null
        }
      };

      $scope.stepTo = function(index){
        $scope.selected = index;
        $anchorScroll('top');
      };

      $scope.save = function(valid){

        if(valid) {

          if(!$scope.credential.userCloudProviderId && $scope.credential.awsAccountId) {

            var onSuccess = function(result){
              $scope.credential.userCloudProviderId = result.id;
              self.createCredential();
            };

            self.createNewCloudProviderAccount(onSuccess);
          }
          else {
            self.createCredential();
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

      self.createCredential = function(){
        CredentialService.create($rootScope.currentUser.userid, $rootScope.currentUser.username, $scope.credential)
          .then(function(result){

            if(result.credentialId){

              if($state.params.appId) {
                AppService.getApp($state.params.appId)
                  .then(function(app){

                    if(app) {
                      app.userDataProviderId = result.credentialId;
                      app.userCloudProviderId = $scope.credential.userCloudProviderId;
                      
                      AppService.saveApp(app)
                        .finally(function(){
                          $state.go('apps.list');
                        });
                    }
                  })
                  .catch(function(){
                    $state.go('apps.list');
                  });
              }
              else {
                $state.go('credentials');
              }
            }

          })
          .catch(function(){
            //TODO handle this
            //MessageService.setMessage('error', error);
          })
          .finally(function(){
            //$scope.processing = false;
          });
      };

      $scope.cancel = function(){
        $state.go('credentials');
      };

      self.init = function(){

        UserService.getUserByID($rootScope.currentUser.userid)
          .then(function(result){
            $scope.cloudProviders = result.cloudProviders;
          });

        if($state.params.userCloudProviderId) {
          $scope.credential.userCloudProviderId = $state.params.userCloudProviderId;
          $scope.disableAWSAccountId = true;

          $timeout(function() {
            if($scope.credentialForm) {
              $scope.credentialForm.selectAccountId.$validate();
            }
          }, 500);
        }
      };

      self.init();
    }]);
