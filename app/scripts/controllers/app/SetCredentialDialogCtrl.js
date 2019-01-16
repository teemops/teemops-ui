'use strict';

/**
 * @ngdoc function
 * @name teemOpsApp.controller:SetCredentialDialogCtrl
 * @description
 * # SetCredentialDialogCtrl
 * Allow's a user to specify a credential for an app
 */
angular.module('teemOpsApp')
  .controller('SetCredentialDialogCtrl', ['$scope', '$rootScope', 'AppService',
      '$mdDialog', 'app', 'credentials',
    function ($scope, $rootScope, AppService,
      $mdDialog, app, credentials) {

        $scope.app = app;
        $scope.credentialList = credentials;

        $scope.save = function(){

          AppService.saveApp($scope.app)
            .then(function(success){

              if(success) {
                $mdDialog.hide($scope.app.userDataProviderId);
              }

            })
            .catch(function(error){
              console.log(error);
            });
        };

        $scope.cancel = function(){
          $mdDialog.hide();
        };
    }]);
