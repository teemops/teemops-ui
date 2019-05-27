'use strict';

/**
 * @ngdoc function
 * @name teemOpsApp.controller:ConfirmDeleteDialogCtrl
 * @description
 * # ConfirmDeleteDialogCtrl
 * Allow's a user to confirm that they wish to delete an app
 */
angular.module('teemOpsApp')
  .controller('ConfirmDeleteDialogCtrl', ['$scope', '$rootScope', 'AppService',
      '$mdDialog', '$filter', 'app',
    function ($scope, $rootScope, AppService,
      $mdDialog, $filter, app) {

        $scope.app = app;
        $scope.archive = true;

        $scope.delete = function(){

          AppService.removeApp(app.id, $scope.archive)
            .then(function(result) {

              if(result.data) {
                $mdDialog.hide({ success: result.data.success, archive : $scope.archive });
              }
              else {
                $mdDialog.hide({ success: false });
              }

            });
        };
        $scope.terminate = function(){

          AppService.terminateApp(app.id, $scope.archive)
            .then(function(result) {

              if(result.data) {
                $mdDialog.hide({ success: result.data.success, archive : $scope.archive });
              }
              else {
                $mdDialog.hide({ success: false });
              }

            });
        };

        $scope.cancel = function(){
          $mdDialog.hide();
        };
    }]);
