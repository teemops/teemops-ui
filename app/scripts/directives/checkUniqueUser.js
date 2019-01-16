'use strict';

angular.module('teemOpsApp')
    .directive('checkUniqueUser', ['UserService', 'ENV', function (UserService, ENV) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ngModel) {

            function handleError() {
              ngModel.$setValidity('uniqueException', false);
              scope.processing[ngModel.$name] = false;
            }

            element.bind('blur', function () {

                if (!ngModel || !element.val() || element.val().length < attrs.minlength) {
                  return;
                }

                var currentValue = element.val();
                scope.processing[ngModel.$name] = true;
                ngModel.$setValidity('uniqueException', true); //reset

                UserService.doesUserExist(currentValue)
                    .then(function (response) {

                      if(response && response.status === 'success') {

                        //Ensure value that being checked hasn't changed
                        //since the Ajax call was made
                        if (currentValue === element.val()) {
                            ngModel.$setValidity('unique', response.unique);

                            if(!response.unique) {
                              element.focus();
                            }
                        }
                      }
                      else {
                        handleError();
                      }

                    })
                    .catch(function (response) {
                      if(ENV.name === 'development') {
                        console.log(response);
                      }
                      handleError();
                    })
                    .finally(function(){
                      scope.processing[ngModel.$name] = false;
                    });
            });
        }
    };
}]);
