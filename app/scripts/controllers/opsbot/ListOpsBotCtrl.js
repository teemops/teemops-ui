'use strict';

/**
 * @ngdoc function
 * @name teemOpsApp.controller:ListOpsBotCtrl
 * @description
 * # ListOpsBotCtrl
 * Lists Ops Bot Alerts
 */
angular.module('teemOpsApp')
  .controller('ViewAppsCtrl', ['$scope', '$rootScope', '$state', '$filter', '$mdDialog', '$mdToast',
      'AppService', 'MessageService', 'CredentialService', 'UserCloudConfigService',
    function ($scope, $rootScope, $state, $filter, $mdDialog, $mdToast,
      AppService, MessageService, CredentialService, UserCloudConfigService) {

      var self = this;

      $scope.displayName = AppService.displayName;
      $scope.risks = [
        {
          severity: 1,
          type: 's3',
          resource: 'myapp-bucket-124', 
          issue: 'Pubicly available',
          recommend: 'Add 1 click policy'
        },
        {
          severity: 2,
          type: 'ec2',
          resource: 'myapp-123', 
          issue: 'Needs Security Review',
          recommend: 'View App Security Tab'
        },
        {
          severity: 3,
          type: 'disk',
          resource: 'myapp-sap1', 
          issue: 'Disk Encryption Not Enabled',
          recommend: 'Configure Disk Encryption'
        },
    ];
    	$scope.debug = false;
      $scope.apps = null;
      $scope.loading = false;
      $scope.userHasCredentials = false;

      self.init = function(){

        $scope.getApps();

        CredentialService.getAllByUserId($rootScope.currentUser.userid)
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
