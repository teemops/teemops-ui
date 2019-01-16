'use strict';

angular.module('teemOpsApp')
   .controller('MessageCtrl', ['$scope', 'MessageService',
    function ($scope, MessageService) {

      $scope.message = null; //{ title: '', subtitle: ''};

      $scope.$watch(function () {
        return MessageService.getMessage();
      },
      function (newValue, oldValue) {
        if (newValue !== null && newValue !== oldValue) {
          $scope.message = newValue;
        }
      });

    }]);
