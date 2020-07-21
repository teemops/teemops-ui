'use strict';

/**
 * @ngdoc function
 * @name teemOpsApp.controller:RegisterCtrl
 * @description
 * # RegisterCtrl
 * Controller of the teemOpsApp
 */
angular.module('teemOpsApp')
  .controller('RegisterCtrl', function ($scope, UserService, MessageService) {

    $scope.result = {
      status: null,
      message: null
    };

    $scope.user = {
      username: null,
      password: null,
      first: null,
      last: null,
      email: null//,
      //address: {},
      //mfa_token: null
    };

    $scope.processing = {
      username: false,
      email: false
    };

    $scope.register = function (valid) {

      if (valid) {
        UserService.create($scope.user)
          .then(function (response) {
            $scope.result.status = response.status;
          })
          .catch(function (err) {
            console.log(err)
            MessageService.setMessage('error', 'A problem occurred during registration. Please try again.');
          });
      }
    };

  });
