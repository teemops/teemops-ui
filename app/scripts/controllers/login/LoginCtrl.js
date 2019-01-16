'use strict';

/**
 * @ngdoc function
 * @name teemOpsApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Controller of the teemOpsApp
 */
angular.module('teemOpsApp')
  .controller('LoginCtrl',
    function ($scope, $localStorage, $rootScope, $state, $stateParams, $window, AuthenticationService, MessageService) {

    $scope.result = null;

    $scope.user = {
      email: null,
      password: null
    };

    $scope.login = function(valid) {

        if(valid) {

          var formData = {
             email: $scope.user.email,
             password: $scope.user.password
          };

          AuthenticationService.login(formData)
            .then(function () {

              if(AuthenticationService.isUserAuthenticated()){

                if($stateParams.redirect) {
                  $window.location.href = $stateParams.redirect;
                }
                else {
                  $state.go('/');
                }
              }

            })
            .catch(function(response){
              var messageTitle = 'There was a problem signing you in. Please try again.';
              var messageSubtitle = null;

              if(response.error === 'credentials'){
                messageTitle = 'You have entered an incorrect username or password. Please try again.';
              }
              else if(response.error === 'unverified'){
                messageTitle = 'Your TeemOps account has not been verified.';
                messageSubtitle = 'A confirmation email was sent to the email address you provided at registration.<br/>' +
                  'Please check this email and follow the instructions to complete your registration.';
              }
              MessageService.setMessage('error', messageTitle, messageSubtitle);
            })
        }
    };


  });
