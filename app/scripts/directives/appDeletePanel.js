'use strict';

/**
 * @ngdoc function
 * @name teemOpsApp.controller:appDeletePanel
 * @description
 * # appDeletePanel
 * Directive to display app Remove button
 */

angular.module('teemOpsApp')
  .directive('appDeletePanel', ['AppService', '$rootScope', '$filter', '$mdDialog', '$mdToast', '$timeout',
    function(AppService, $rootScope, $filter, $mdDialog, $mdToast, $timeout) {

    return {
      restrict: 'A',
      scope: {
        app: '=',
        refreshApp: '&',
        appStatusChanged: '&',
        iconOnly: '='
      },
      templateUrl: 'views/app/delete-panel.html',
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

        $scope.showConfirmDeleteDialog = function(appId, appName, $event){

          var confirmDialog = $mdDialog.show({
            controller: 'ConfirmDeleteDialogCtrl',
            templateUrl: 'views/app/delete-dialog.html',
            parent: angular.element(document.body),
            targetEvent: $event,
            locals : {
              app : { id: appId, name: appName }
            }
          });

          confirmDialog.then(function(result) {

            if(result && result.success === true) {

              $mdToast.show({
                hideDelay: 3000,
                position: 'top right',
                locals: {
                  status : 'success',
                  message : '"' + appName + '"' + (result.archive ? ' removed & archived' : ' removed')
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
      }
    };
  }]);
