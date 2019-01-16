'use strict';

/**
 * @ngdoc function
 * @name teemOpsApp.controller:selectOrAddAWSAccount
 * @description
 * # selectOrAddAWSAccount
 * Directive to display dropdown or input for AWS Account ID
 */

angular.module('teemOpsApp')
  .directive('selectOrAddAwsAccount', function() {
    return {
      restrict: 'A',
      scope: {
        app: '=',
        form: '=',
        cloudProviders: '=',
        tooltipText: '@'
      },
      templateUrl: 'views/_partials/select-or-add-aws-account.html'
    };
  });
