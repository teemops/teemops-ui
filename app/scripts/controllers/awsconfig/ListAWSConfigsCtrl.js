'use strict';

/**
 * @ngdoc function
 * @name teemOpsApp.controller:ListAWSConfigsCtrl
 * @description
 * # ListAWSConfigsCtrl
 * Lists the AWS Configs that a user has set up
 */
angular.module('teemOpsApp')
  .controller('ListAWSConfigsCtrl', ['$scope', '$rootScope', '$mdPanel', '$mdDialog', '$window',
      '$state', '$timeout', 'UserService', 'UserCloudConfigService', 'ENV',
    function ($scope, $rootScope, $mdPanel, $mdDialog, $window,
      $state, $timeout, UserService, UserCloudConfigService, ENV) {

      var self = this;
      self._mdPanel = $mdPanel;
      $scope.deleteButtonsEnabled = true;
      $scope.editButtonsEnabled = false;
      $scope.loading = true;

      $scope.showEditDialog = function(config) {

        var configCopy = {};
        angular.copy(config, configCopy);

        self.config.controller = 'EditAWSConfigDialogCtrl';
        self.config.templateUrl = 'views/awsconfig/edit-dialog.html';
        self.config.locals = {
          config: configCopy,
          cloudProviders: self.cloudProviders
        };

        self._mdPanel.open(self.config);
      };

      self.delete = function(configId){
        UserCloudConfigService.delete(configId, $rootScope.currentUser.userid)
          .then(function(result){

            if(result.status === 'success') {
              self.getAllAWSConfigs();
            }
          });
      };

      $scope.confirmDelete = function(ev, configId) {

        var confirm = $mdDialog.confirm()
          .title('Confirm Remove')
          .textContent('Are you sure you want to remove this config?')
          .ariaLabel('Confirm remove config')
          .targetEvent(ev)
          .ok('Yes, remove it')
          .cancel('Cancel');

          $mdDialog.show(confirm).then(function() {
            self.delete(configId);
          });
      };

      self.init = function(){

          self.getAllAWSConfigs();
          self.getCloudProviderList();
          self.initDialog();
        
      }

      self.getAllAWSConfigs = function(){

        UserCloudConfigService.getUserCreds($rootScope.currentUser.userid)
          .then(function(result){
            $scope.awsConfigs = result;
          })
          .catch(function(result){
            if(result.status === 'error'){
              //Handle error
            }
            else {
              $scope.awsConfigs = [];
            }
          })
          .finally (function(){
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
            $('.config-dialog')  // jshint ignore:line
              .css('height', ($window.innerHeight) + 'px')
              .css('overflow-y', 'scroll');

            $('.md-panel-outer-wrapper').css('height', ($window.innerHeight) + 'px'); // jshint ignore:line
          },
          onDomRemoved: function(){
            self.getAllAWSConfigs();
          }
        };
      };

      self.init();

  }]);
