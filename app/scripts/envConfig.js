'use strict';

 angular.module('envConfig', [])

.constant('ENV', {name:'development',apiEndpoint:'http://localhost:8080/api',cloudapiEndpoint:'http://localhost:8080/api',subscribeEndpoint:'http://localhost:8080',useSampleData:false,deleteButtonsEnabled:true,httpTimeout:15000,supportEmail:'support@teemops.com'})

;