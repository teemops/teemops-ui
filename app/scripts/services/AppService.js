'use strict';

/**
 * @ngdoc function
 * @name teemOpsApp.service:AppService
 * @description
 * # AppService
 * Controller of the teemOpsApp
 */

angular.module('teemOpsApp')
  .service('AppService', function($http, $cacheFactory, $timeout, $q, $filter, $rootScope, AppStatusService, ENV){

    function sendToJobQueue(userId, appId, action) {
      var task="ec2";
      var deferred = $q.defer();

      $http.put(ENV.apiEndpoint + '/apps/job', { userid : userId, appid: appId, action: action, task: task })
        .then(function(response){
          if(response.data) {
            deferred.resolve(response.data);
          }
          else {
            deferred.reject(null);
          }
        })
        .catch(function(response){
          deferred.reject(response.data);
        });

      return deferred.promise;
    }

    function launchApp(userId, appId, action){
      var task="ec2";
      var deferred = $q.defer();

      $http.post(ENV.apiEndpoint + '/apps/launch', { userid : userId, appid: appId, action: action, task: task })
        .then(function(response){
          if(response.data) {
            deferred.resolve(response.data);
          }
          else {
            deferred.reject(null);
          }
        })
        .catch(function(response){
          deferred.reject(response.data);
        });

      return deferred.promise;
    }

    return {

      displayName: 'App',

      addApp: function (app){
        var deferred = $q.defer();

        //TODO either put this in a helper service/factory or user http intercept for generic response handling
        $http.put(ENV.apiEndpoint + '/apps', app)
          .then(function(response){

            if(response.data.appid){
              deferred.resolve(response.data);
            }
            else if(response.data.error){
              deferred.reject(response.data);
            }
          })
          .catch(function(response){
            deferred.reject(response);
          });

          return deferred.promise;
    	},

      getApp: function(appId){
        var deferred = $q.defer();
        var self = this;

        var successCallback = function(response){
          if(response.data.result && response.data.result.length === 1) {

            var app =   response.data.result[0];
            app.configData = angular.fromJson(app.configData);
            app.authData = angular.fromJson(app.authData);
            app.hasNotification=(app.notify!=null);
            self.updateStatusInfo(app);
            deferred.resolve(app);
          }
          else if(response.data.error){
            deferred.reject(response.data.error);
          }
          else {
            deferred.reject();
          }
        };

        $http.get(ENV.apiEndpoint + '/apps/' + appId)
        .then(function(response) {
          successCallback(response);
        })
        .catch(function(response){
          deferred.reject(response);
        });

        return deferred.promise;
      },

      getAppInfrastructureDetails: function(appId) {
        var deferred = $q.defer();

        $http.get(ENV.apiEndpoint + '/apps/infra/' + appId)
          .then(function(response) {
            console.log(JSON.stringify(response.data.result));
            if(response.data && response.data.result) {
              deferred.resolve(angular.fromJson(response.data.result));
            }
            else if(response.data.error){
              deferred.reject(response.data);
            }
            else {
              deferred.reject();
            }
          });

        return deferred.promise;
      },

  	  removeApp: function (appId, archive){
  		  return $http.delete(ENV.apiEndpoint + '/apps/' + appId + '?archive=' + archive);
      },
      terminateApp: function (appId, archive){
  		  return $http.delete(ENV.apiEndpoint + '/apps/terminate/' + appId + '?archive=' + archive);
  	  },

  	  saveApp: function(app){

        var updateStatusToReady = app.statusInfo.name === 'INITIALISING' && app.awsConfigId && app.userDataProviderId;
        var appStatusList = AppStatusService.getAppStatusList();

        if(updateStatusToReady) {
          var readyStatus = $filter('filter')(appStatusList, { name : 'READY'})[0];
          app.status = readyStatus.id;
        }

        var deferred = $q.defer();

        $http.post(ENV.apiEndpoint + '/apps/update', app)
        .then(function(response){
          console.log(JSON.stringify(response.data));
          if(response.data.result){
            deferred.resolve(response.data.result === true);
          }
          else if(response.data.error){
            deferred.reject(response.data);
          }
        })
        .catch(function(response){
          deferred.reject(response);
        });

        return deferred.promise;
      },

  	  allApps: function(){

        var deferred = $q.defer();
        var self = this;

        $http.get(ENV.apiEndpoint + '/apps/list/')
          .then(function(response){

            if(response.data && angular.isArray(response.data.results) && response.data.results.length > 0) {

              for(var i = 0;i<response.data.results.length;i++){
                var app = response.data.results[i];
                app.appProviderSummary = self.formatAppProviderSummary(app.appProviderName, app.os, app.appProviderDesc);
                app.credentialAuthData = angular.fromJson(app.credentialAuthData);
                app.configData = angular.fromJson(app.configData);
                app.hasNotification=(app.notify!=null);

                self.updateStatusInfo(app);
              }

              deferred.resolve(response.data.results);
            }
            else {
              deferred.resolve(null);
            }
          })
          .catch(function(response){
            deferred.reject(response);
          });

          return deferred.promise;
    	},
      /**
       * @description starts application or launches
       */
      startApp: function(userId, app) {
        //we need to check status of app
        console.log("App Status is: "+ app.status);
        var action=(app.status==1 || app.status==0 ? 'ec2.launch' : 'ec2.start');
        console.log('Action is: ' +action);
        if(action=='ec2.launch'){
          return launchApp(userId, app.appId, action);
        }else{
          return sendToJobQueue(userId, app.appId, action);
        }
        
      },

      stopApp: function(userId, app){
        return sendToJobQueue(userId, app.appId, 'ec2.stop');
      },

      broadcastAppStatusUpdate: function(appStatusList){

        if(appStatusList && appStatusList.length > 0) {
          for(var i = 0;i<appStatusList.length;i++) {
            $rootScope.$broadcast('appUpdated-' + appStatusList[i].appId, appStatusList[i]);
          }
        }
      },

      getAppProviders: function() {
        var deferred = $q.defer();

        $http.get(ENV.apiEndpoint + '/apps/providers', { cache: true })
          .then(function(response){
            if(response.data && angular.isArray(response.data.results) && response.data.results.length > 0) {
              deferred.resolve(response.data.results);
            }
            else {
              deferred.reject(null);
            }
          })
          .catch(function(response){
            deferred.reject(response.data);
          });

        return deferred.promise;
      },

      getCloudProviders: function() {
        var deferred = $q.defer();

        $http.get(ENV.apiEndpoint + '/apps/cloudproviders', { cache: true })
          .then(function(response){
            if(response.data && angular.isArray(response.data.results) && response.data.results.length > 0) {
              deferred.resolve(response.data.results);
            }
            else {
              deferred.reject(null);
            }
          })
          .catch(function(response){
            deferred.reject(response.data);
          });

        return deferred.promise;
      },

      getDBList: function() {
        return [
          { id: 1, name: 'MYSQL' },
          { id: 2, name: 'SQL Server' },
          { id: 3, name: 'MongoDB' }
        ];
      },

      getSourceCodeList: function() {
        return [
          { val: 'github', name: 'GitHub', enabled: true },
          { val: 'svn', name: 'Subversion', enabled: false }
        ];
      },

      formatAppProviderSummary: function(name, os, description){
        var appProviderSummary = name + '<br/>';

        if(os) {
          appProviderSummary += os + ', ';
        }

        if(description) {
          appProviderSummary += description;
        }

        return appProviderSummary;
      },

      formatAppDBList: function(dbList, dbListSelected){
        var dbListDesc = '';

        angular.forEach(dbListSelected, function(db){
          dbListDesc += $filter('filter')(dbList, { id: db })[0].name + ', ';
        });

        return dbListDesc.substring(0, dbListDesc.length - 2);
      },

      updateStatusInfo: function(app){
        app.statusInfo = AppStatusService.getAppStatusMetadata(app.status);
      }

    };
});
