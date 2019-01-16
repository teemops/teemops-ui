'use strict';

/**
 * @ngdoc function
 * @name teemOpsApp.controller:RequestConfirmationEmailCtrl
 * @description
 * # RequestConfirmationEmailCtrl
 * Confirms a user's registration via a query string param 'code'
 */
angular.module('teemOpsApp')
  .controller('RequestConfirmationEmailCtrl', ['$scope', '$mdDialog',
    function ($scope, $mdDialog) {

      $scope.email = null;

      $scope.hide = function() {
        $mdDialog.hide();
      };

      $scope.cancel = function() {
        $mdDialog.cancel();
      };

      $scope.result = function(valid) {

        if(valid) {
          $mdDialog.hide($scope.email);
        }
      };

 }]);
