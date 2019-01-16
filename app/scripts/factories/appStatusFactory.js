'use strict';

/**
 * @ngdoc function
 * @name teemOpsApp.factory:appStatusFactory
 * @description
 * # appStatusFactory
 */

angular.module('teemOpsApp')
  .factory('appStatusFactory', ['$localStorage', 'AppService', 'ENV',
    function($localStorage, AppService, ENV) {

    var es = null;

    var appStatusFactory = {
      subscribeToAppUpdates: function(){

        if((!es || es.readyState === EventSource.CLOSED) && $localStorage.currentUser) { // jshint ignore:line

          if(ENV.name === 'development') {
            console.log('Trying to connect...');
          }

          var url = ENV.subscribeEndpoint + '/subscribe/' + $localStorage.currentUser.userid + '?x-access-token=' + $localStorage.token;

          es = new EventSource(url, {withCredentials: true }); // jshint ignore:line

          es.addEventListener('message', function (event) {
            if(ENV.name === 'development') {
              console.log(new Date() + ', ' + event.data);
            }

            var data = angular.fromJson(event.data);

            if(data !== 'CLOSE'){
              AppService.broadcastAppStatusUpdate(data);
            }
            else {
              es.close();
            }
          });

          es.onopen = function(){
            if(ENV.name === 'development') {
              console.log('Connected to server');
            }
          };

          es.onerror = function(err){
            if(ENV.name === 'development') {
              console.log(err);
            }
          };

          es.addEventListener('close', function(){
            if(ENV.name === 'development') {
              console.log('closing...');
            }
          });

        }
      },

      stopSubscribing: function(){
        if(es && es.readyState !== EventSource.CLOSED) { // jshint ignore:line
          if(ENV.name === 'development') {
            console.log('closing...');
          }
          es.close();
        }
      }
    };

    return appStatusFactory;

  }]);
