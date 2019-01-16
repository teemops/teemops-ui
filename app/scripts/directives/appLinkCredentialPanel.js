'use strict';

/**
 * @ngdoc function
 * @name teemOpsApp.controller:appLinkCredentialPanel
 * @description
 * # appLinkCredentialPanel
 * Directive to display Link Credential button for apps/servers
 */

angular.module('teemOpsApp')
  .directive('appLinkCredentialPanel', ['AppService', '$rootScope', '$filter', '$mdDialog', '$state',
    function(AppService, $rootScope, $filter, $mdDialog, $state) {

    return {
      restrict: 'A',
      scope: {
        app: '=',
        credentials: '=',
        refreshApp: '&',
        appStatusChanged: '&',
        iconOnly: '&',
        shrinkToFit: '@'
      },
      templateUrl: 'views/app/link-credential-panel.html',
      link: function($scope){

        $scope.$mdMedia = $rootScope.$mdMedia; //Need to do this to make $mdMedia visible inside directive

      },
      controller: function($scope) {

        var self = this;

        $scope.goToAddOrEditCredential = function(app, $event){

          var validCredentialsForApp = $filter('filter')($scope.credentials, { userCloudProviderId : $scope.app.userCloudProviderId });

          if(validCredentialsForApp && validCredentialsForApp.length > 0) {
            self.showCredentialDialog(app, $event);
          } else {
            $state.go('credentials.new', { appId: app.appId, userCloudProviderId : app.userCloudProviderId });
          }
        };

        self.showCredentialDialog = function(app, event){

          var appCopy = {};
          angular.copy(app, appCopy);


          var validCredentialsForApp =
            $filter('filter')($scope.credentials, { userCloudProviderId : app.userCloudProviderId });

          var credentialDialog = $mdDialog.show({
            controller: 'SetCredentialDialogCtrl',
            templateUrl: 'views/app/edit-credential-dialog.html',
            parent: angular.element(document.body),
            clickOutsideToClose: true,
            locals: {
              app: appCopy,
              credentials: validCredentialsForApp
            },
            targetEvent: event
          });

          credentialDialog.then(function(userDataProviderId) {
            if(userDataProviderId) {
              app.userDataProviderId = userDataProviderId;

              if($scope.refreshApp) {
                $scope.refreshApp();
              }
            }
          });
        };


      }
    };
  }]);
