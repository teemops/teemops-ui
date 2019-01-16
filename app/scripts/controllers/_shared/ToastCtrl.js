'use strict';

angular.module('teemOpsApp')
   .controller('ToastCtrl', ['$scope', '$mdToast', 'status', 'message',
   function ($scope, $mdToast, status, message) {

       $scope.status = status;
       $scope.message = message;

       $scope.close = function(){
         $mdToast.hide();
       };
   }]);
