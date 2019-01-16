'use strict';

/**
 * @ngdoc function
 * @name teemOpsApp.controller:appLinkCredentialPanel
 * @description
 * # appLinkCredentialPanel
 * Directive to display Link Credential button for apps/servers
 */

angular.module('teemOpsApp')
  .directive('appLinkConfigPanel', ['AppService', '$rootScope', '$filter', '$mdDialog', '$state',
    function(AppService, $rootScope, $filter, $mdDialog, $state) {

    return {
      restrict: 'A',
      scope: {
        app: '=',
        awsConfigs: '=',
        refreshApp: '&',
        appStatusChanged: '&',
        iconOnly: '&',
        shrinkToFit: '@'
      },
      templateUrl: 'views/app/link-config-panel.html',
      link: function($scope){

        $scope.$mdMedia = $rootScope.$mdMedia; //Need to do this to make $mdMedia visible inside directive

      },
      controller: function($scope) {

        var self = this;

        $scope.goToAddOrEditConfig = function($event){

          var validConfigsForApp = $filter('filter')($scope.awsConfigs, { userCloudProviderId : $scope.app.userCloudProviderId });

          if(validConfigsForApp && validConfigsForApp.length > 0) {
            self.showAWSConfigDialog($scope.app, $event);
          } else {
            $state.go('awsconfigs.new', { appId: $scope.app.appId, userCloudProviderId : $scope.app.userCloudProviderId });
          }
        };

        self.showAWSConfigDialog = function($event){

          var appCopy = {};
          angular.copy($scope.app, appCopy);

          var awsConfigDialog = $mdDialog.show({
            controller: 'SetAWSConfigDialogCtrl',
            templateUrl: 'views/app/edit-aws-config-dialog.html',
            parent: angular.element(document.body),
            clickOutsideToClose: true,
            locals: {
              app: appCopy,
              awsConfigs: $scope.awsConfigs
            },
            targetEvent: $event
          });

          awsConfigDialog.then(function(awsConfigId) {
            if(awsConfigId) {
              $scope.app.awsConfigId = awsConfigId;

              if($scope.refreshApp) {
                $scope.refreshApp();
              }
            }
          });
        };


      }
    };
  }]);
