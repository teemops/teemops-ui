'use strict';

 angular.module('envConfig', [])

.constant('ENV', {name:'production',httpTimeout:3000,supportEmail:'support@teemops.com',apiEndpoint:'https://api.teemops.com/api',cloudapiEndpoint:'https://api.teemops.com/api',subscribeEndpoint:'https://api.teemops.com'})

;