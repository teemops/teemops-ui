'use strict';

 angular.module('envConfig', [])

.constant('ENV', {name:'production',httpTimeout:3000,supportEmail:'support@teemops.com',apiEndpoint:'https://api.dev.teemops.com/api',cloudapiEndpoint:'https://api.dev.teemops.com/api',subscribeEndpoint:'https://api.dev.teemops.com'})

;