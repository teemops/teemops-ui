'use strict';

/**
 * @ngdoc function
 * @name teemOpsApp.controller:ViewCredentialDialogCtrl
 * @description
 * # ViewCredentialDialogCtrl
 * View credential details
 */
angular.module('teemOpsApp')
  .controller('ViewCredentialDialogCtrl', ['$scope', '$rootScope', 'mdPanelRef', 'credential',
    function ($scope, $rootScope, mdPanelRef, credential) {

      $scope.credential = credential;

      $scope.cancel = function(){
        self.closeDialog();
      };

      self.closeDialog = function(){
        if(mdPanelRef){
          mdPanelRef.close();
        }
      };

    }]);
