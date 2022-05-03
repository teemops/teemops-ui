'use strict';

/**
 * @ngdoc function
 * @name teemOpsApp.controller:ViewAppsCtrl
 * @description
 * # ViewAppsCtrl
 * Controller of the teemOpsApp
 */
angular.module('teemOpsApp')
  .controller('ViewAppsCtrl', ['$scope', '$rootScope', '$state', '$filter', '$mdDialog', '$mdToast',
      'AppService', 'MessageService', 'CredentialService', 'UserCloudConfigService',
    function ($scope, $rootScope, $state, $filter, $mdDialog, $mdToast,
      AppService, MessageService, CredentialService, UserCloudConfigService) {

      var self = this;

      $scope.displayName = AppService.displayName;

    	$scope.debug = false;
      $scope.apps = null;
      $scope.loading = false;
      $scope.userHasCredentials = false;

      self.init = function(){

        $scope.getApps();

        CredentialService.getUserCreds()
          .then(function(result){
            $scope.credentials = result;
          });

        UserCloudConfigService.getAllByUserId($rootScope.currentUser.userid)
          .then(function(results){
            $scope.awsConfigs = results;
          });
      };

      $scope.getApps = function(){
        $scope.loading = true;

        AppService.allApps()
          .then(function(results) {
            if(results) {
              $scope.apps = results;
            }
            else {
              MessageService.setMessage('info', 'You have no apps!');
            }

            $scope.loading = false;
          })
          .catch(function(){
              MessageService.setMessage('error', 'Something went wrong retrieving your apps.');
          })
          .finally(function(){
            $scope.loading = false;
          });
      };



      $scope.$on('appUpdated', function(event, args){

        if($scope.apps && args) {
          $scope.$apply(function(){

            for(var i = 0;i<args.length;i++) {
              console.log(args[i]);
              var app = $filter('filter')($scope.apps, { appId : args[i].appId })[0];
              if(app.status !== args[i].status) {
                app.status = args[i].status;
                AppService.updateStatusInfo(app);
              }
            }
          });
        }
      });

      $scope.showDetail = function (appId) {
        $state.go('apps.detail', { id: appId });
      };
      
      self.init();
}]);
