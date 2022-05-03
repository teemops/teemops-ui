'use strict';

/**
 * @ngdoc function
 * @name teemOpsApp.controller:ListCredentialsCtrl
 * @description
 * # ListCredentialsCtrl
 * Handles step involved in linking a user's AWS credentials with their TeemOps account
 */
angular.module('teemOpsApp')
  .controller('ListCredentialsCtrl', ['$scope', '$rootScope', '$mdPanel', '$mdDialog', '$window', '$anchorScroll', '$state', '$timeout',
    'CredentialService', 'UserService', 'ENV',
    function ($scope, $rootScope, $mdPanel, $mdDialog, $window, $anchorScroll, $state, $timeout,
      CredentialService, UserService, ENV) {

      var self = this;
      self._mdPanel = $mdPanel;

      $scope.loading = true;
      $scope.deleteButtonsEnabled = ENV.deleteButtonsEnabled;

      $scope.showEditDialog = function(credential) {

        var credentialCopy = [];
        angular.copy(credential, credentialCopy);

        self.config.controller = 'EditCredentialDialogCtrl';
        self.config.templateUrl = 'views/credentials/edit-dialog.html';
        self.config.locals = {
          credential: credentialCopy,
          cloudProviders: self.cloudProviders
        };

        self._mdPanel.open(self.config);
      };

      $scope.showViewDialog = function(credential) {

        self.config.controller = 'ViewCredentialDialogCtrl';
        self.config.templateUrl = 'views/credentials/view-dialog.html';
        self.config.locals = {
          credential: credential
        };

        self._mdPanel.open(self.config);
      };

      self.delete = function(credentialId){
        CredentialService.delete(credentialId)
          .then(function(result){

            if(result.status === 'success') {
              self.getAllCredentials();
            }
          });
      };

      $scope.confirmDelete = function(ev, credentialId) {

        var confirm = $mdDialog.confirm()
          .title('Confirm delete')
          .textContent('Are you sure you want to delete this credential?')
          .ariaLabel('Confirm delete credential')
          .targetEvent(ev)
          .ok('Yes, delete my credential')
          .cancel('Cancel');

          $mdDialog.show(confirm).then(function() {
            self.delete(credentialId);
          });
      };

      self.init = function(){

          self.getAllCredentials();
          self.getCloudProviderList();
          self.initDialog();

      }

      self.getAllCredentials = function(){

        CredentialService.getUserCreds()
          .then(function(result){
            $scope.credentials = result;
          })
          .catch(function(result){
            if(result.status === 'error'){
              //Handle error
              console.log('Error with listing AWS accounts');
            }
            else {
              $scope.credentials = [];
            }
          })
          .finally(function(){
            $scope.loading = false;
          });
      };

      self.getCloudProviderList = function(){
        UserService.getUserByID($rootScope.currentUser.userid)
          .then(function(result){
            self.cloudProviders = result.cloudProviders;
          });
      };

      self.initDialog = function(){
        var position = self._mdPanel.newPanelPosition()
            .absolute()
            .right(0)
            .top(0);

        var animation = self._mdPanel.newPanelAnimation();
        animation.openFrom({top:0, right:0, bottom: 0, left: 1024});
        animation.closeTo({top:0, right:0, bottom: 0, left: 1024});
        animation.withAnimation(self._mdPanel.animation.SLIDE);

        self.config = {
          animation: animation,
          attachTo: angular.element(document.body),
          position: position,
          trapFocus: true,
          zIndex: 5,
          clickOutsideToClose: true,
          clickEscapeToClose: true,
          hasBackdrop: true,
          onDomAdded: function(){
            $('.credentials-dialog')  // jshint ignore:line
              .css('height', ($window.innerHeight) + 'px')
              .css('overflow-y', 'scroll');

            $('.md-panel-outer-wrapper').css('height', ($window.innerHeight) + 'px'); // jshint ignore:line
          },
          onDomRemoved: function(){
            self.getAllCredentials();
          }
        };
      };

      self.init();

  }]);
