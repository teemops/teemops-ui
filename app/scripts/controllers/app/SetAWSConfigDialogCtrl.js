'use strict';

/**
 * @ngdoc function
 * @name teemOpsApp.controller:SetAWSConfigDialogCtrl
 * @description
 * # SetAWSConfigDialogCtrl
 * Allow's a user to specify an AWS Launch Config for an app
 */
angular.module('teemOpsApp')
  .controller('SetAWSConfigDialogCtrl', ['$scope', '$rootScope', '$filter', 'AppService', 'UserCloudConfigService',
      '$mdDialog', 'app', 'awsConfigs', 'ENV',
    function ($scope, $rootScope, $filter, AppService, UserCloudConfigService,
      $mdDialog, app, awsConfigs, ENV) {

        var appsConfigs=$filter('filter')(awsConfigs, {awsAccountId: app.awsAccountId});
        $scope.app = app;
        $scope.awsConfigs = appsConfigs;
        $scope.supportEmail = ENV.supportEmail;
        
        $scope.save = function(){
          AppService.saveApp($scope.app)
            .then(function(success){

              if(success) {
                $mdDialog.hide($scope.app.awsConfigId);
              }

            })
            .catch(function(error){
              console.log(error);
            });
        };

        $scope.cancel = function(){
          $mdDialog.hide();
        };
    }]);
