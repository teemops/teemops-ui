'use strict';

 angular.module('envConfig', [])

.constant('ENV', {name:'development',apiEndpoint:'http://localhost:8080/api',cloudapiEndpoint:'https://r0bu9wqjz8.execute-api.us-west-2.amazonaws.com/dev',subscribeEndpoint:'http://localhost:8080',useSampleData:false,deleteButtonsEnabled:false,httpTimeout:15000,supportEmail:'support@teemops.com'})

;