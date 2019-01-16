'use strict';

angular.module('teemOpsApp')
  .controller('SideNavCtrl', ['$scope', '$state', 'AppService',
    function ($scope, $state, AppService) {

      $scope.appDisplayName = AppService.displayName;

      $scope.showNav = function(){
          return $state.current.name !== 'login';
      };

   }]);
