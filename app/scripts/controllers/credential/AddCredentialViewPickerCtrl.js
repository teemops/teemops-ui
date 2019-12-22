'use strict';

/**
 * @ngdoc function
 * @name teemOpsApp.controller:AddCredentialViewPickerCtrl
 * @description
 * # AddCredentialViewPickerCtrl
 * Decides whether to display the simple or step-by-step Add Credential views
 */
angular.module('teemOpsApp')
  .controller('AddCredentialViewPickerCtrl', ['$scope', '$rootScope', '$state', 'CredentialService',
    function ($scope, $rootScope, $state, CredentialService) {

      var self = this;
      var awsCloudProviderId = 1; //TODO read from DB

      $scope.simpleView = false;
      $scope.selected = 0;

      self.initState = function(){
        if($state.current.name === 'credentials.new') {

          CredentialService.getAllByUserId($rootScope.currentUser.userid)
            .then(function (results) {

              if(results && results.length > 1){
                $state.go('credentials.new.simple');
                $scope.simpleView = true;
              }
              else {
                $state.go('credentials.new.simple');
                $scope.simpleView = true;
              }
            })
            .catch(function(){
              $state.go('credentials.new.simple');
              $scope.simpleView = true;
            });
        }
        else {
          $scope.simpleView = $state.current.name === 'credentials.new.simple';
        }
      };

      self.initState();
    }]);
