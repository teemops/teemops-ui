'use strict';

/**
 * @ngdoc function
 * @name teemOpsApp.controller:appStartStopPanel
 * @description
 * # appStartStopPanel
 * Directive to display app Start/Stop buttons
 */

angular.module('teemOpsApp')
  .directive('appToolsPanel', ['AppService', 'UserCloudConfigService', 'AppStatusService',
      '$rootScope', '$filter', '$mdDialog', '$timeout',
    function(AppService, UserCloudConfigService, AppStatusService,
      $rootScope, $filter, $mdDialog, $timeout) {

    return {
      restrict: 'A',
      scope: {
        app: '=',
        refreshApp: '&',
        appStatusChanged: '&',
        raisedButton: '@'
      },
      templateUrl: 'views/app/action-tools-button-panel.html',
      link: function($scope){

        $scope.$mdMedia = $rootScope.$mdMedia; //Need to do this to make $mdMedia visible inside directive

        var eventId = 'appUpdated-' + $scope.app.appId;

        $timeout(function() {

          //Subscribe to SSE for app status update
          $scope.$on(eventId, function(event, args){

            if(args) {
              if($scope.app.appId === args.appId && $scope.app.status !== args.status) {
                $scope.$apply(function(){
                    $scope.app.status = args.status;
                    AppService.updateStatusInfo($scope.app);

                    if($scope.appStatusChanged) {
                      $scope.appStatusChanged();
                    }
                });
              }
            }
          });
        }, 500);

        $scope.$watch('app', function(newVal){
          if(newVal) {
            eventId = 'appUpdated-' + newVal.appId;
          }
        });

      },
      controller: function($scope) {
        $scope.showConfirmTerminateDialog = function(app, $event){

          var confirmDialog = $mdDialog.show({
            controller: 'ConfirmDeleteDialogCtrl',
            templateUrl: 'views/app/terminate-dialog.html',
            parent: angular.element(document.body),
            targetEvent: $event,
            locals : {
              app : { id: app.appId, name: app.name }
            }
          });

          confirmDialog.then(function(result) {

            if(result && result.success === true) {

              $mdToast.show({
                hideDelay: 3000,
                position: 'top right',
                locals: {
                  status : 'success',
                  message : '"' + appName + '"' + (result.archive ? ' terminated & archived' : ' terminated')
                },
                controller: 'ToastCtrl',
                templateUrl: 'views/_partials/toast.html'
              });

              if($scope.refreshApp) {
                $scope.refreshApp();
              }
            }
          });
        };

        $scope.backupApp = function(){

        };

      }
    };
  }]);
