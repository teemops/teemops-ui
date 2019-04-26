'use strict';

/**
 * @ngdoc function
 * @name teemOpsApp.controller:AppDetailCtrl
 * @description
 * # AppDetailCtrl
 * Controller of the teemOpsApp
 */
angular.module('teemOpsApp')
  .controller('AppDetailCtrl', ['$scope', '$rootScope', '$timeout', '$state', '$stateParams', '$filter', '$mdDialog',
      '$document', '$uiViewScroll', 'AppService', 'CredentialService', 'UserCloudConfigService', 'UserService', 'UserCloudProviderService', 'ENV',
    function ($scope, $rootScope, $timeout, $state, $stateParams, $filter, $mdDialog,
      $document, $uiViewScroll, AppService, CredentialService, UserCloudConfigService, UserService, UserCloudProviderService, ENV) {

    var self = this;
    var awsCloudProviderId = 1; //TODO read from DB

    $scope.displayName = AppService.displayName;
    $scope.supportEmail = ENV.supportEmail;

    $scope.appProviderList = [];
    $scope.cloudProviderList = [];
    $scope.credentialList = [];

    $scope.editModes = {
      info : {
        on: false,
        enabled: true
      },
      cloud : {
        on: false,
        enabled: true
      },
      credential : {
        on: false,
        enabled: true
      },
      awsconfig : {
        on: false,
        enabled: true
      }
    };

  	$scope.app = {};
    $scope.processing = false;

    $scope.getApp = function(init){
      AppService.getApp($stateParams.id)
        .then(function(result){

          if(result) {

            $scope.app = result;
            $scope.app.cloudProvider = $filter('filter')($scope.cloudProviderList, { id : result.cloudProviderId })[0];

            $scope.pageTitle = $scope.app.name;
            $scope.app.displayAWSAccountId =  $scope.app.awsAccountId;

            if($scope.app.userCloudProviderId) {
              $scope.app.awsAccountId = null;
            }

            $rootScope.pageTitle = $scope.app.name;

            self.getAppInfrastructureDetails();
            self.getCredentials();
            self.getAWSConfigs();
            self.setEditEnabled();
            self.initWatches();

          }
          else {
            $scope.goToAppList();
          }

        })
        .catch(function(error){
          if(error && ENV.name === 'development') {
            console.log(error);
          }

          $scope.goToAppList();
        });
    };

    $scope.saveApp = function(section, $event){

      var goToSave = true;

      var credentialChanged = $scope.appBeforeEdit.userDataProviderId != $scope.app.userDataProviderId;
      var appProviderChanged = $scope.appBeforeEdit.appProviderId != $scope.app.appProviderId;
      var configChanged = $scope.appBeforeEdit.userCloudProviderId !== $scope.app.userCloudProviderId;

      if(section === 'credential') {
        if(credentialChanged && $scope.app.statusInfo.name === 'STOPPED') {
          goToSave = false;
          self.showConfirmCredentialDialog(section, $event);
        }
      }
      else if (section === 'info' && appProviderChanged && $scope.app.statusInfo.name === 'STOPPED') {
        goToSave = false;
        self.showConfirmInfoDialog(section, $event);
      }
      else if (section === 'cloud' && configChanged) {
        goToSave = false;
        self.showConfirmCloudDialog(section, $event);
      }

      if(goToSave){
        self.saveApp(section);
      }
    };

    $scope.goToAppList = function(){
      $state.go('apps.list');
    };

    $scope.appStatusChanged = function(){
      self.setEditEnabled();
    };

    $scope.formatAppProviderSummary = function(id){
      if($scope.appProviderList && $scope.appProviderList.length > 0) {
        var ap = $filter('filter')($scope.appProviderList, { id : id })[0];
        return AppService.formatAppProviderSummary(ap.name, ap.os, ap.description);
      }

      return null;
    };

    $scope.toggleEditMode = function(section) {
      if($scope.editModes[section].on === false) {
        $scope.appBeforeEdit = {};
        angular.copy($scope.app, $scope.appBeforeEdit); //Save app state
      }
      else {
        $scope.app = $scope.appBeforeEdit; //Restore app state if Cancel clicked
      }

      $scope.editModes[section].on = !$scope.editModes[section].on;
    };

    $scope.togglePasswordVisibility = function(app) {
      app.passwordVisible = !app.passwordVisible;
    };

    self.init = function() {
      self.initReferenceData();
      $scope.getApp(true);

      if($state.params.scrollTo) {
        $timeout(function(){
          $scope.scrollToSection($state.params.scrollTo);
        }, 400);
      }

      $timeout(function() {
        if($scope.appForm && $scope.appForm.selectAccountId) {
          $scope.appForm.selectAccountId.$validate();
        }
      }, 1000);

    };

    self.initReferenceData = function(){
      AppService.getAppProviders()
        .then(function(results){
          $scope.appProviderList = results;
        });

      AppService.getCloudProviders()
        .then(function(results){
          $scope.cloudProviderList = results;
        });

      $scope.dbList = AppService.getDBList();
      $scope.sourceCodeList = AppService.getSourceCodeList();

      self.getUserCloudProviders();

    };

    self.getUserCloudProviders = function() {
      UserService.getUserByID($rootScope.currentUser.userid)
        .then(function(result){
          $scope.cloudProviders = result.cloudProviders;
        });
    };

    self.showConfirmCredentialDialog = function(section, $event){
      var confirm = $mdDialog.confirm()
        .title('Confirm Change')
        .textContent('Changing the AWS Credential will remove all data for this ' +
          $filter('lowercase')($scope.displayName) + '. Continue?')
        .ariaLabel('Confirm Change')
        .targetEvent($event)
        .ok('Yes, change this AWS Credential')
        .cancel('Cancel');

      $mdDialog.show(confirm).then(function() {
        self.saveApp(section);
      });

      $scope.credentialChanged = false; //Reset
    };

    self.showConfirmInfoDialog = function(section, $event) {
      var confirm = $mdDialog.confirm()
        .title('Confirm Change')
        .textContent('Changing the ' + $scope.displayName  + ' Stack will remove all data for this ' +
          $filter('lowercase')($scope.displayName) + '. Continue?')
        .ariaLabel('Confirm Change')
        .targetEvent($event)
        .ok('Yes, change this '+ $scope.displayName  + ' Stack')
        .cancel('Cancel');

      $mdDialog.show(confirm).then(function() {
        self.saveApp(section);
      });

      $scope.appProviderChanged = false; //Reset
    };

    self.showConfirmCloudDialog = function(section, $event) {
      var confirm = $mdDialog.confirm()
        .title('Confirm Change')
        .textContent('Changing the linked AWS Account Id will reset the Credential & Launch Config for this ' +
          $filter('lowercase')($scope.displayName) + '. Continue?')
        .ariaLabel('Confirm Change')
        .targetEvent($event)
        .ok('Yes, change the AWS Account Id')
        .cancel('Cancel');

      $mdDialog.show(confirm).then(function() {

        //Reset AWSConfig & Credential
        $scope.app.awsConfigId = null;
        $scope.app.userDataProviderId = null;

        self.saveApp(section);
      });
    };

    self.saveApp = function(section){

      $scope.processing = true;

      if(section === 'cloud' && !$scope.app.userCloudProviderId && $scope.app.awsAccountId) {

        var onSuccess = function(result){
          $scope.app.userCloudProviderId = result.id;
          self.updateApp(section);
        };

        self.createNewCloudProviderAccount(onSuccess);
      }
      else {
        self.updateApp(section);
      }

      self.updateApp(section);
    };

    self.createNewCloudProviderAccount = function(onSuccess){
      var data = {
        userId: $rootScope.currentUser.userid,
        cloudProviderId: awsCloudProviderId,
        awsAccountId: $scope.app.awsAccountId,
        isDefault: true
      };

      UserCloudProviderService.addCloudProviderAccount(data)
        .then(function(result){
          onSuccess(result);
        })
        .catch(function(result){
          //TODO
        });
    };

    self.updateApp = function(section){
      AppService.saveApp($scope.app)
        .then(function(success){
          $scope.editModes[section].on = !success;
          $scope.getApp();
        })
        .finally(function(){
            $scope.processing = false;
        });
    };

    self.getCredentials = function(){
      CredentialService.getAllByUserId($rootScope.currentUser.userid, $scope.app.userCloudProviderId)
        .then(function(results){
          $scope.credentialList = results;
        });
    };

    self.getAWSConfigs = function(){
      UserCloudConfigService.getAllByUserId($rootScope.currentUser.userid, $scope.app.userCloudProviderId)
        .then(function(results){
          //This will filter based on the app details including if app is stopped status.
          //if an app is stopped the AWS configs can be changed, but only within the same VPC
          console.log("getAWSConfigs");
          console.log(JSON.stringify(results, null, 4));
          console.log("VPC: "+$scope.app.vpc);
          if($scope.app.statusInfo.name === 'STOPPED'){
            //filter awsConfigs to only ones in the desired VPC
            $scope.awsConfigs = $filter('filter')(results, {vpc: $scope.app.vpc});
          }else{
            $scope.awsConfigs = results;
          }
          
        });
    };

    self.getAppInfrastructureDetails = function(){
      AppService.getAppInfrastructureDetails($scope.app.appId)
        .then(function(result){

          if($scope.app.appId) {
            $scope.app.infrastructure = result;
          }
        })
        .catch(function(error){
          $scope.app.infrastructure = error;
        });
    };

    $scope.scrollToSection = function(scrollTo){

      var section = angular.element($document[0].getElementById(scrollTo));

      if(section){
        $uiViewScroll(section);
        $scope.toggleEditMode(scrollTo);
      }
    };

    self.setEditEnabled = function() {
      var enabled = $scope.app.statusInfo.name === 'INITIALISING' ||
        $scope.app.statusInfo.name === 'READY';

      $scope.editModes.info.enabled = enabled;
      $scope.editModes.cloud.enabled = enabled;
      $scope.editModes.credential.enabled = enabled;
      $scope.editModes.awsconfig.enabled = enabled;
    };

    self.initWatches = function() {

      $scope.$watch('app.cloudProviderId', function(newVal, oldVal){
        if(newVal !== oldVal){
          var selectedCloud = $filter('filter')($scope.cloudProviderList, { id : newVal })[0];
          $scope.app.cloudProvider = selectedCloud;
        }
      }, true);
    };

    self.init();
}]);
