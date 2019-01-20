'use strict';

/**
 * @ngdoc function
 * @name teemOpsApp.controller:ConfirmationCtrl
 * @description
 * # ConfirmationCtrl
 * Confirms a user's registration via a query string param 'code'
 * calls UserService.confirmRegistration(code)
 */
angular.module('teemOpsApp')
  .controller('ConfirmationCtrl', ['$scope', '$state', '$mdDialog', 'UserService',
    function ($scope, $state, $mdDialog, UserService) {

      var self = this;

      $scope.confirmed = null;

      this.init = function(){
        var code = $state.params.code;

        if(code){
          UserService.confirmRegistration(code)
            .then(function(response){
              $scope.confirmed = response.status === 'success';
            })
            .catch(function(){
              $scope.confirmed = false;
            });
        }
      };

      $scope.showRequestConfirmationDialog = function(event){
        var requestEmailDialog = $mdDialog.show({
          controller: 'RequestConfirmationEmailCtrl',
          templateUrl: 'views/request-confirmation-email.html',
          parent: angular.element(document.body),
          targetEvent: event
        });

        requestEmailDialog.then(function(result) {

          if(result) {

            UserService.requestConfirmationEmail(result)
              .then(function(response){
                if(response.status === 'success'){
                  $scope.email = response.email;
                  $scope.confirmationEmailRequested = true;
                }
              });
          }
        });
      };


      self.init();

   }]);
