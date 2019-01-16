'use strict';

angular.module('teemOpsApp')
   .service('AuthenticationService', ['$http', '$q', '$timeout', '$localStorage', '$window', '$rootScope',
      'jwtFactory', 'appStatusFactory', 'AppService', 'ENV',
    function ($http, $q, $timeout, $localStorage, $window, $rootScope, jwtFactory, appStatusFactory, AppService, ENV) {

      var saveCurrentUser = function(currentUser){
        $localStorage.currentUser = currentUser;
        $rootScope.currentUser = currentUser;
      };

      var deleteCurrentUser = function(){
        delete $localStorage.currentUser;
        $rootScope.currentUser = null;
      };

      var service = {
        login: function (data) {
          var deferred = $q.defer();

          $http.post(ENV.apiEndpoint + '/users/login', data)
            .then(function(response){

              if(response.data) {
                if(response.data.token){
                  jwtFactory.saveToken(response.data.token);
                  saveCurrentUser(jwtFactory.getClaimsFromToken());
                  appStatusFactory.subscribeToAppUpdates();

                  deferred.resolve(response);
                }
                else {
                  if(response.data.err === 'unverified'){
                    deferred.reject({ error: 'unverified'});
                  }
                  else {
                    deferred.reject({ error: 'credentials'});
                  }

                }
              }
              else {
                deferred.reject(response);
              }
            })
            .catch(function(response){
              deferred.reject(response);
            });

          return deferred.promise;
       },

       logout: function () {
         if(jwtFactory.isAuthenticated()){
           this.handleExpiredToken();
         }
       },

       isTokenExpired: function() {
         return jwtFactory.isTokenExpired();
       },

       handleExpiredToken: function() {
         appStatusFactory.stopSubscribing();
         jwtFactory.deleteToken();
         deleteCurrentUser();
       },

       isUserAuthenticated: function() {
         return jwtFactory.isAuthenticated();
       },

       /*
        * Request a refreshed token from the server
        */
       refreshToken: function(){
         var deferred = $q.defer();

         $http.post(ENV.apiEndpoint + '/token/refresh')
           .then(function(response){

             if(response.data && response.data.token){
               jwtFactory.saveToken(response.data.token);
               deferred.resolve(jwtFactory.isAuthenticated());
             }

             deferred.reject();
           })
           .catch(function(){
             deferred.reject();
           });

         return deferred.promise;
       },

       /*
        * If token will expire in less than 60 mins then refresh it
        */
       isTokenRefreshRequired: function(){
         var tokenExpiry = Math.round(jwtFactory.getTokenExpirationDate().getTime()/(1000*60));
         var currentTime = Math.round(new Date().getTime()/(1000*60));

         var minsToExpiry = tokenExpiry - currentTime;
         return minsToExpiry < 60;
       }
     };

     return service;
  }]);
