'use strict';

/**
 * @ngdoc function
 * @name teemOpsApp.controller:AddAppCtrl
 * @description
 * # AddAppCtrl
 * Controller of the teemOpsApp
 */
angular.module('teemOpsApp')
  .controller('AddAppCtrl', ['$scope', '$rootScope', '$timeout', '$state', '$filter',
    'AppService', 'UserService', 'MessageService', 'UserCloudProviderService',
    function ($scope, $rootScope, $timeout, $state, $filter,
      AppService, UserService, MessageService, UserCloudProviderService) {

      var self = this;
      var awsCloudProviderId = 1; //TODO read from DB
      //used for Autoscaling min and maximum defaults.
      $scope.minASG = 1;
      $scope.minASGMax = 5;
      $scope.maxASG = 10;
      /*
        Selected tab
      */
      $scope.selectedTab = 0;

      /* Reference data */
      $scope.displayName = AppService.displayName;

      $scope.appUrlSuffix = ''; //'.' + $rootScope.currentUser.username + '.teemops.com';
      $scope.appProviderList = [];
      $scope.cloudProviderList = [];
      $scope.dbList = [];
      $scope.sourceCodeList = [];

      //when this changes later it will need to use AppService
      $scope.platformList = [{
        id: 1,
        name: 'EC2',
        enabled: true,
        tabs: [
          'code',
          'scaling',
          'environment'
        ],
        description: 'Use Servers for standard workloads including Autoscaling, single servers and initial cloud migrations.'
      },
      {
        id: 2,
        enabled: false,
        tabs: [
          'code',
          'scaling',
          'environment'
        ],
        name: 'Containers',
        description: 'Containers are launched into an ECS environment configured by Teem Ops in your AWS Account.'
      },
      {
        id: 3,
        enabled: false,
        tabs: [
          'code'
        ],
        name: 'Serverless',
        description: 'You can launch your own serverless apps. These require a code base developed using the Serverless Framework - See https://serverless.com'
      }, {
        id: 4,
        enabled: false,
        tabs: [
          'code'
        ],
        name: 'Javascript App (Amazon S3, CloudFront)',
        description: 'Launch Vue, Bootstrap, React, Angular and other static html sites.'
      }, {
        id: 5,
        enabled: true,
        tabs: [
          'template'
        ],
        name: 'Custom CloudFormation',
        description: 'Launch Your own CloudFormation template from source or cut and paste'
      }
      ];

      $scope.publicIPOptions = [
        {
          id: 1,
          label: 'No Public IP',
          name: 'private'
        },
        {
          id: 2,
          label: 'Public IP',
          name: 'public'
        },
        {
          id: 3,
          label: 'Static/Elastic IP',
          name: 'elastic'
        }
      ];

      $scope.formSubmitted = false;
      $scope.processing = false;
      $scope.error = null;
      $scope.app = {
        appid: null,
        name: null,
        appdomain: null,
        appurl: null,
        status: 0,
        cloud: null,
        region: null,
        appProviderId: null,
        userCloudProviderId: null,
        database: null,
        caching: null,
        sourceCode: {
          source: null,
          authenticated: null,
          path: null
        },
        asg: {
          enabled: false,
          groupsize: 1,
          groupmax: 3,
          loadbalancer: false
        },
        platformId: 1
      };

      $scope.checkTabDisplayed = function (tabName) {
        var tabs = $scope.platformList.map(function (platform) {
          if (platform.id === $scope.app.platformId) {
            return platform.tabs;
          }
        });
        return tabs.length ? true : false;

      };

      self.init = function () {
        AppService.getAppProviders()
          .then(function (results) {
            $scope.appProviderList = results;
          });

        AppService.getCloudProviders()
          .then(function (results) {
            $scope.cloudProviderList = results;
            self.initDefaultCloudProvider(); //Default to AWS
          });

        UserService.getUserByID($rootScope.currentUser.userid)
          .then(function (result) {
            $scope.cloudProviders = result.cloudProviders;
          });

        $scope.dbList = AppService.getDBList();
        $scope.sourceCodeList = AppService.getSourceCodeList();

        self.initWatches();
      };

      $scope.stepper = function (tab) {
        $scope.selectedTab = tab;
      };

      $scope.submit = function (form) {
        $scope.formSubmitted = true;
        var isValid = form.$valid;
        if (isValid) {
          $scope.processing = true;

          if (!$scope.app.userCloudProviderId && $scope.app.awsAccountId) {

            var onSuccess = function (result) {
              $scope.app.userCloudProviderId = result.id;
              self.addApp();
            };

            self.createNewCloudProviderAccount(onSuccess);
          } else {
            self.addApp();
          }
        } else {
          console.log("Form isn't valid");
          var invalid = [];
          var thisForm = $scope.appForm;
          angular.forEach(thisForm, function (value, key) {
            if (typeof value === 'object' && value.hasOwnProperty('$modelValue') && value.$invalid)
              console.log("This item invalid: " + key + value.$dirty);
          });


        }
      };

      self.addApp = function () {
        AppService.addApp($scope.app)
          .then(function (result) {

            if (result.appid) {
              //$state.go('apps.list');
              $state.go('apps.detail', {
                id: result.appid
              });
            }

          })
          .catch(function (result) {
            if (result.error === 'duplicate') {
              MessageService.setMessage('error', 'An app with this name or url already exists. Please choose another name or url.');
            }
          })
          .finally(function () {
            $scope.processing = false;
          });
      };

      self.createNewCloudProviderAccount = function (onSuccess) {
        var data = {
          userId: $rootScope.currentUser.userid,
          cloudProviderId: awsCloudProviderId,
          awsAccountId: $scope.app.awsAccountId,
          isDefault: true
        };

        UserCloudProviderService.addCloudProviderAccount(data)
          .then(function (result) {
            onSuccess(result);
          })
          .catch(function (result) {
            //TODO
          });
      };

      $scope.toggle = function (item, list) {
        var idx = list.indexOf(item);
        if (idx > -1) {
          list.splice(idx, 1);
        } else {
          list.push(item);
        }
      };

      $scope.exists = function (item, list) {
        return list.indexOf(item) > -1;
      };

      $scope.getAWSAccountID = function () {
        if ($scope.app.awsAccountId) {
          return app.awsAccountId;
        } else if ($scope.app.userCloudProviderId) {
          return $filter('filter')($scope.cloudProviders, {
            id: $scope.app.userCloudProviderId
          })[0].awsAccountId;
        }

        return 'not specified';
      };

      self.initWatches = function () {

        $scope.$watch(function () {
          return $scope.app.appdomain;
        }, function (newVal, oldVal) {
          if (newVal !== oldVal) {
            $scope.app.appurl = (newVal ? newVal : '') + $scope.appUrlSuffix;
          }
        }, true);

        $scope.$watch(function () {
          return $scope.app.appProviderId;
        }, function (newVal, oldVal) {
          if (newVal !== oldVal) {
            var ap = $filter('filter')($scope.appProviderList, {
              id: newVal
            })[0];

            if (ap) {
              $scope.app.appProviderSummary = AppService.formatAppProviderSummary(ap.name, ap.os, ap.description);
            }
          }
        }, true);

        $scope.$watch(function () {
          return $scope.app.cloud;
        }, function (newVal, oldVal) {
          if (newVal !== oldVal) {
            self.setCloudProviderDesc(newVal);
          }
        }, true);

        /*$scope.$watch(function() { return $scope.app.configData.databases; }, function(newVal, oldVal){
          if(newVal !== oldVal){
            $scope.dbListDesc = AppService.formatAppDBList($scope.dbList, newVal);
          }
        }, true);*/

      };

      self.initDefaultCloudProvider = function () {
        $scope.app.cloud = 1;
        self.setCloudProviderDesc(1);
      };

      self.setCloudProviderDesc = function (cloudProviderId) {
        var selectedCloud = $filter('filter')($scope.cloudProviderList, {
          id: cloudProviderId
        })[0];
        $scope.app.cloudProviderDesc = selectedCloud.description;
      };

      self.init();

    }
  ]);
