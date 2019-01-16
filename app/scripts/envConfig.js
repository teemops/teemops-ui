'use strict';

 angular.module('envConfig', [])

.constant('ENV', {name:'development',apiEndpoint:'http://localhost:8080/api',cloudapiEndpoint:'https://0ad5tm61kk.execute-api.ap-southeast-2.amazonaws.com/beta',subscribeEndpoint:'http://localhost:8080',useSampleData:false,deleteButtonsEnabled:false,httpTimeout:15000,supportEmail:'support@teemops.com'})

;