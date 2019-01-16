'use strict';

/**
 * @ngdoc function
 * @name teemOpsApp.directive:compareTo
 * @description
 * # compareTo
 * Directive to compare two model values
 */

angular.module('teemOpsApp')
  .directive('compareTo', function() {
    return {
      require: 'ngModel',
      scope: {
        compareTo: '='
      },
      link: function(scope, element, attributes, ngModel) {

        ngModel.$validators.compareTo = function(modelValue) {
          return modelValue === scope.compareTo;
        };

        scope.$watch('compareTo', function(newVal, oldVal) {
          if(newVal !== oldVal) {
            ngModel.$validate();
          }
        }, true);
      }
    };
  });
