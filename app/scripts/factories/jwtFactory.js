'use strict';

/**
 * @ngdoc function
 * @name teemOpsApp.factory:jwtFactory
 * @description
 * # jwtFactory
 */

angular.module('teemOpsApp')
  .factory('jwtFactory', ['$localStorage', '$window', 'jwtHelper',
    function($localStorage, $window, jwtHelper) {

    var jwtFactory = {

      isAuthenticated: function() {
        var token = $localStorage.token;
        return token ? !jwtHelper.isTokenExpired(token) : false;
      },

      saveToken: function(token){
        $localStorage.token = token;
      },

      getToken: function(){
        return $localStorage.token;
      },

      deleteToken: function(){
        delete $localStorage.token;
      },

      getClaimsFromToken: function() {
           var token = $localStorage.token;
           var user = {};
           if (typeof token !== 'undefined') {
               user = jwtHelper.decodeToken(token);
           }
           return user;
       },

       isTokenExpired: function(){
         return jwtHelper.isTokenExpired($localStorage.token);
       },

       getTokenExpirationDate: function(){
         return jwtHelper.getTokenExpirationDate($localStorage.token);
       }
    };

    return jwtFactory;
}]);
