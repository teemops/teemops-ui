'use strict';

/**
 * @ngdoc function
 * @name teemOpsApp.controller:editModePanel
 * @description
 * # editModePanel
 * Directive to display a edit button toggled with save/cancel buttons
 */

angular.module('teemOpsApp')
  .directive('editModePanel', function() {

    return {
      restrict: 'A',
      scope: {
        panelDisabled: '=',
        editEnabled: '=',
        toggle: '&',
        save: '&',
        showDone: '@',
        done: '&'
      },
      template:
        '<div layout="row" flex data-ng-cloak layout-align="end center" class="edit-mode-panel" data-ng-class="{ \'on\' : editEnabled }">' +
          '<md-button class="md-primary icon-and-text-button" data-ng-hide="editEnabled" ' +
            'data-ng-click="toggle({section: section})" data-ng-cloak ng-disabled="panelDisabled" ' +
            'layout="row" layout-align="center center">' +
            '<ng-md-icon icon="create" size="16"></ng-md-icon><span>Edit</span>' +
          '</md-button>' +
          '<div data-ng-cloak data-ng-show="editEnabled">' +
            '<md-button class="md-primary icon-and-text-button" data-ng-click="save({section: section})" data-ng-cloak' +
              'layout="row" layout-align="center center" ng-disabled="panelDisabled" data-ng-show="!showDone">' +
              '<ng-md-icon icon="save" size="16"></ng-md-icon><span>Save Changes</span>' +
            '</md-button>' +
            '<md-button class="md-accent icon-and-text-button" data-ng-click="done({section: section})" data-ng-cloak' +
              'layout="row" layout-align="center center" data-ng-show="showDone">' +
              '<ng-md-icon icon="done" size="16"></ng-md-icon><span>done</span>' +
            '</md-button>' +
            '<md-button class="md-warn icon-and-text-button" data-ng-click="toggle({section: section})" data-ng-cloak' +
              'layout="row" layout-align="center center">' +
              '<ng-md-icon icon="cancel" size="16"></ng-md-icon><span>Cancel</span>' +
            '</md-button>' +
          '</div>' +
        '</div>'
    };
  });
