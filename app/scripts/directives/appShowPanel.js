'use strict';

/**
 * @ngdoc function
 * @name teemOpsApp.controller:appShowPanel
 * @description
 * # appShowPanel
 * Directive to display passwords/private keys etc.
 */

angular.module('teemOpsApp')
  .directive('appShowPanel', ['AppService', 'UserCloudConfigService', 'AppStatusService',
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
      templateUrl: 'views/app/action-button-panel.html',
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

        $scope.toggleAppStatus = function(){

          $scope.app.processing = true;

          var onSuccess = function(result){
            $scope.app.status = result.status;
            AppService.updateStatusInfo($scope.app);

            if($scope.appStatusChanged) {
              $scope.appStatusChanged();
            }
          };

          var onFinally = function(){
            $scope.app.processing = false;
          };

          if($scope.app.statusInfo.name !== 'STARTED') {
            AppService.startApp($rootScope.currentUser.userid, $scope.app)
              .then(onSuccess)
              .finally(onFinally);
          }
          else {
            AppService.stopApp($rootScope.currentUser.userid, $scope.app)
              .then(onSuccess)
              .finally(onFinally);
          }
        };

        $scope.$watch('app.status', function(newVal, oldVal){
          if(newVal && newVal !== oldVal){
            AppService.updateStatusInfo($scope.app);
          }
        });
      }
    };
  }]);
