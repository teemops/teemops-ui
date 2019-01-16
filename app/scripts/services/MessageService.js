'use strict';

angular.module('teemOpsApp')
   .service('MessageService', function () {
     var data = {
       message: null
     };

   return {
     getMessage: function () {
         return data.message;
     },

     setMessage: function (status, title, subtitle) {
       data.message = {
          status: '',
          content: {
            title : '',
            subtitle: ''
          }
        };

       data.message = {
         status: status,
         content: {
           title: title,
           subtitle: subtitle
        }
       };
     },

     clear: function() {
       data.message = null;
      }
   };

});
