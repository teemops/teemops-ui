'use strict';

/**
 * @ngdoc function
 * @name teemOpsApp.controller:DashboardCtrl
 * @description
 * # DashboardCtrl
 */
angular.module('teemOpsApp')
  .controller('DashboardCtrl', ['$scope', '$rootScope', '$filter', '$state',
      'CredentialService', 'AppService', 'UserService', 'UserCloudConfigService',
    function ($scope, $rootScope, $filter, $state,
      CredentialService, AppService, UserService, UserCloudConfigService) {

    var self = this;

    $scope.loading = true;
    $scope.appDisplayName = AppService.displayName;
    $scope.hasCloudProviders = true;
    $scope.hasCredentials = true;
    $scope.hasAWSConfigs = true;
    $scope.hasApps = true;

    self.init = function(){

      $scope.getApps();
      $scope.getCredentials();
      $scope.getCloudProviders();
      $scope.getAWSConfigs();
    };

    $scope.getApps = function(){
      AppService.allApps()
        .then(function(results) {
          $scope.apps = results;
          $scope.hasApps = results && results.length > 0;
        })
        .finally(function(){
          $scope.loading = false;
        });
    };

    $scope.getCredentials = function(){
      CredentialService.getUserCreds()
        .then(function(results){
          var validCredentials = [];

          if(results && results.length > 0){
             validCredentials = $filter('filter')(results, function(result)
              {
                return result.authData && result.authData.name && result.authData.arn;
              });
          }
          $scope.credentials = validCredentials;
          $scope.hasCredentials = validCredentials.length > 0;
        });
    };

    $scope.getCloudProviders = function(){
      UserService.getUserByID($rootScope.currentUser.userid)
        .then(function(result){
          $scope.hasCloudProviders = result.cloudProviders && result.cloudProviders.length > 0;
        });
    };

    $scope.getAWSConfigs = function(){
      UserCloudConfigService.getAllByUserId($rootScope.currentUser.userid)
        .then(function(results){

          $scope.awsConfigs = results;
          $scope.hasAWSConfigs = results && results.length > 0;
        });
    };

    $scope.hideGetStartedSteps = function(){
      return $scope.hasCloudProviders && $scope.hasCredentials && $scope.hasAWSConfigs && $scope.hasApps;
    };

    $scope.showDetail = function (appId) {
      $state.go('apps.detail', { id: appId });
    };

    self.init();
  }]);
