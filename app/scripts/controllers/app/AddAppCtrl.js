'use strict';

/**
 * @ngdoc function
 * @name teemOpsApp.controller:AddAppCtrl
 * @description
 * # AddAppCtrl
 * Controller of the teemOpsApp
 */
angular.module('teemOpsApp')
  .controller('AddAppCtrl', ['$scope', '$rootScope', '$timeout', '$state', '$filter',
      'AppService', 'UserService', 'MessageService', 'UserCloudProviderService',
    function ($scope, $rootScope, $timeout, $state, $filter,
      AppService, UserService, MessageService, UserCloudProviderService) {

    var self = this;
    var awsCloudProviderId = 1; //TODO read from DB

    /* Reference data */
    $scope.displayName = AppService.displayName;

    $scope.appUrlSuffix = '';//'.' + $rootScope.currentUser.username + '.teemops.com';
    $scope.appProviderList = [];
    $scope.cloudProviderList = [];
    $scope.dbList = [];
    $scope.sourceCodeList = [];

    $scope.formSubmitted = false;
    $scope.processing = false;
    $scope.error = null;
    $scope.app = {
      appid: null,
    	name: null,
      appdomain: null,
      appurl: null,
      status: 0,
      cloud: null,
      region: null,
      appProviderId: null,
      userCloudProviderId: null,
    	database: null,
    	caching: null,
    	sourceCode: {
    		source: null,
    		authenticated: null,
    		path: null
    	}
    };

    self.init = function(){
      AppService.getAppProviders()
        .then(function(results){
          $scope.appProviderList = results;
        });

      AppService.getCloudProviders()
        .then(function(results){
          $scope.cloudProviderList = results;
          self.initDefaultCloudProvider(); //Default to AWS
        });

      UserService.getUserByID($rootScope.currentUser.userid)
        .then(function(result){
          $scope.cloudProviders = result.cloudProviders;
        });

      $scope.dbList = AppService.getDBList();
      $scope.sourceCodeList = AppService.getSourceCodeList();

      self.initWatches();
    };

    $scope.submit = function(isValid){

      $scope.formSubmitted = true;

      if(isValid) {
        $scope.processing = true;

        if(!$scope.app.userCloudProviderId && $scope.app.awsAccountId) {

          var onSuccess = function(result){
            $scope.app.userCloudProviderId = result.id;
            self.addApp();
          };

          self.createNewCloudProviderAccount(onSuccess);
        }
        else {
          self.addApp();
        }
    	}
    };

    self.addApp = function(){
      AppService.addApp($scope.app)
        .then(function(result){

          if(result.appid){
            $state.go('apps.list');
          }

        })
        .catch(function(result){
          if(result.error === 'duplicate'){
            MessageService.setMessage('error', 'An app with this name or url already exists. Please choose another name or url.');
          }
        })
        .finally(function(){
          $scope.processing = false;
        });
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

    $scope.toggle = function (item, list) {
      var idx = list.indexOf(item);
      if (idx > -1) {
        list.splice(idx, 1);
      }
      else {
        list.push(item);
      }
    };

    $scope.exists = function (item, list) {
      return list.indexOf(item) > -1;
    };

    $scope.getAWSAccountID = function(){
      if($scope.app.awsAccountId) {
        return app.awsAccountId;
      }
      else if ($scope.app.userCloudProviderId) {
        return $filter('filter')($scope.cloudProviders, { id: $scope.app.userCloudProviderId })[0].awsAccountId;
      }

      return 'not specified';
    };

    self.initWatches = function() {

      $scope.$watch(function() { return $scope.app.appdomain; }, function(newVal, oldVal){
        if(newVal !== oldVal){
          $scope.app.appurl = (newVal ? newVal : '') + $scope.appUrlSuffix;
        }
      }, true);

      $scope.$watch(function() { return $scope.app.appProviderId; }, function(newVal, oldVal){
        if(newVal !== oldVal){
          var ap = $filter('filter')($scope.appProviderList, { id : newVal })[0];

          if(ap) {
            $scope.app.appProviderSummary = AppService.formatAppProviderSummary(ap.name, ap.os, ap.description);
          }
        }
      }, true);

      $scope.$watch(function() { return $scope.app.cloud; }, function(newVal, oldVal){
        if(newVal !== oldVal){
          self.setCloudProviderDesc(newVal);
        }
      }, true);

      /*$scope.$watch(function() { return $scope.app.configData.databases; }, function(newVal, oldVal){
        if(newVal !== oldVal){
          $scope.dbListDesc = AppService.formatAppDBList($scope.dbList, newVal);
        }
      }, true);*/

    };

    self.initDefaultCloudProvider = function(){
      $scope.app.cloud = 1;
      self.setCloudProviderDesc(1);
    };

    self.setCloudProviderDesc = function(cloudProviderId){
      var selectedCloud = $filter('filter')($scope.cloudProviderList, { id : cloudProviderId })[0];
      $scope.app.cloudProviderDesc = selectedCloud.description;
    };

    self.init();

  }]);
