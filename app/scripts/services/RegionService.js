'use strict';

angular.module('teemOpsApp')
   .service('RegionService', ['$http', '$q', function ($http, $q) {

   return {
     getRegions: function () {
       return $http.get('/data/regions.json');
     }
   };

}]);
