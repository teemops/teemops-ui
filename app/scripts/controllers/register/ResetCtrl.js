'use strict';

/**
 * @ngdoc function
 * @name teemOpsApp.controller:ResetCtrl
 * @description
 * # ResetCtrl
 * Controller of the teemOpsApp
 */
angular.module('teemOpsApp')
  .controller('ResetCtrl', function ($scope, UserService, MessageService) {

    $scope.result = {
      status: null,
      message: null
    };

    $scope.state = 'reset'; //possible: reset, code, completed

    $scope.user = {
      email: null
    };

    $scope.reset = {
      code: null,
      password: ''
    }

    $scope.processing = {
      username: false,
      email: false
    };

    $scope.reset = function (valid) {

      if (valid) {

        UserService.reset($scope.user)
          .then(function (response) {
            $scope.result.status = response.status;
            $scope.state = 'code';
          })
          .catch(function () {
            MessageService.setMessage('error', 'Password could not be reset. Please try again.');
          });

      }
    };

    $scope.changePassword = function (valid) {

      if (valid) {

        var userResetInfo = {
          email: $scope.user.email,
          code: $scope.reset.code,
          password: $scope.reset.password
        }
        UserService.provideResetCode(userResetInfo)
          .then(function (response) {
            $scope.result.status = response.status;
            $scope.state = 'completed';
          })
          .catch(function () {
            MessageService.setMessage('error', 'Code was not valid or expired. Please try again.');
          });

      }
    };

  });
