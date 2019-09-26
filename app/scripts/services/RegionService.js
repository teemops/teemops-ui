'use strict';

angular.module('teemOpsApp')
   .service('RegionService', ['$http', '$q', 'ENV', function ($http, $q, ENV) {
    console.log("ENV: "+ENV.apiEndpoint);
   return {
     
     getRegions: function () {
       return $http.get(ENV.apiEndpoint + '/data/regions');
     }
   };

}]);
