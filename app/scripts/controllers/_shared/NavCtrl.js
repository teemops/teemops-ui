'use strict';

angular.module('teemOpsApp')
  .controller('NavCtrl', ['$scope', '$state', '$mdSidenav', '$mdDialog', '$rootScope', 'AuthenticationService',
    function ($scope, $state, $mdSidenav, $mdDialog, $rootScope, AuthenticationService) {

      $scope.logout = function(){
        AuthenticationService.logout();
        $state.transitionTo('login');
      };

      $scope.showHelp = function($event){

        $mdDialog.show(
          $mdDialog.alert()
            .clickOutsideToClose(true)
            .title('Help')
            .textContent('You can specify some description text in here.')
            .targetEvent($event)
        );
      };

      $scope.toggleNav = function(){
        $mdSidenav('left').toggle();
      };

   }]);
