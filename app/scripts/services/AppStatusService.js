'use strict';

/**
 * @ngdoc function
 * @name teemOpsApp.service:AppStatusService
 * @description
 * # AppStatusService
 * Returns App Status Metadata
 */

angular.module('teemOpsApp')
  .service('AppStatusService', function($http, $q, $filter, $rootScope, ENV){

    var appStatusList = null;
    var promise = $http.get(ENV.apiEndpoint + '/appstatus/list', { cache: true })
      .then(function (response) {
        appStatusList = response.data.results;
      });

    function getAppStatusMetadata(statusId){
      var status = $filter('filter')(appStatusList, { id: statusId })[0];
      var action = '', disabled = true, actionIcon = '', desc = '', textCssClass = '';
      console.log("StatusID: "+statusId);
      if(status) {

        switch(status.name) {
          case 'INITIALISING':
            disabled = true;
            action = 'Start';
            actionIcon = 'play_arrow';
            desc = 'Initialising...';
            break;
          case 'READY':
            disabled = false;
            action = 'Start';
            actionIcon = 'play_arrow';
            desc = 'Ready';
            break;
          case 'STOPPING':
            disabled = true;
            action = 'Stop';
            actionIcon = 'stop';
            desc = 'Stopping...';
            textCssClass = 'text-warn pulse';
            break;
          case 'STOPPED':
            disabled = false;
            action = 'Start';
            actionIcon = 'play_arrow';
            desc = 'Stopped';
            textCssClass = 'text-error';
            break;
          case 'STARTING':
            disabled = false;
            action = 'Stop';
            actionIcon = 'stop';
            desc = 'Starting...';
            textCssClass = 'text-success pulse';
            break;
          case 'STARTED':
            disabled = false;
            action = 'Stop';
            actionIcon = 'stop';
            desc = 'Running';
            textCssClass = 'text-success';
            break;
          default:
            disabled = true;
            action = 'Start';
            actionIcon = 'play_arrow';
            desc = 'Initialising...';
            break;
        }
        return {
          name: status.name,
          desc: desc,
          action: action,
          actionIcon: actionIcon,
          disabled: disabled,
          textCssClass: textCssClass
        };
      }else{
        disabled = false;
        action = 'Start';
        actionIcon = 'play_arrow';
        desc = 'Ready';
        return {
          name: "READY",
          desc: desc,
          action: action,
          actionIcon: actionIcon,
          disabled: disabled,
          textCssClass: textCssClass
        };
      }
      
      
    }

    return {
      promise:promise,
      getAppStatusList: function(){
        return appStatusList;
      },
      getAppStatusMetadata: function (statusId) {
        return getAppStatusMetadata(statusId);
      }
    };

  });
