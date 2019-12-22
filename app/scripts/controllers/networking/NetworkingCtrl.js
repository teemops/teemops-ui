'use strict';

/**
 * @ngdoc function
 * @name teemOpsApp.controller:NetworkingCtrl
 * @description
 * # NetworkingCtrl
 */
angular.module('teemOpsApp')
    .controller('NetworkingCtrl', ['$scope', '$rootScope', '$filter', '$state',
        'CredentialService', 'AppService', 'UserService', 'UserCloudConfigService', 'RegionService',
        function ($scope, $rootScope, $filter, $state,
            CredentialService, AppService, UserService, UserCloudConfigService, RegionService) {

            var self = this;
            //can be list, add.vpc, 
            $scope.task='list';
            $scope.tasks=['list', 'vpc', 'subnet', 'sg', 'edit'];

            $scope.loading = true;
            $scope.cloudProviders = [];
            $scope.regions = [];
            $scope.vpcTemplates = [
                {
                    id: 2,
                    name: 'Standard',
                    description: 'Recommended: A VPC that has 2 or more private and 2 or more public subnets configured as /24 (251 IP addresses each)'
                },
                {
                    id: 1,
                    name: 'Basic',
                    description: 'No template just 1 publicly routable subnet, I will add subnets manually thanks'
                },

                {
                    id: 3,
                    name: 'Public Only',
                    description: 'A VPC that has only 2 or more public subnets.'
                },
                {
                    id: 4,
                    name: 'Private Only',
                    description: 'A VPC that has only 2 or more private subnets. WARNING: Only use if you are going to connect to on premise or another VPC that is publicly routable.'
                },

            ];
            $scope.vpcs = [

            ];
            $scope.newvpc = {
                userCloudProviderId: null,
                region: null,
                name: null,
                cidr: null,
                nat: false,
                template: 2
            };

            $scope.setTask=function(task) {
                console.log(task);
                $scope.task=task;
            };

            self.init = function () {
                UserService.getUserByID($rootScope.currentUser.userid)
                    .then(function (result) {
                        $scope.cloudProviders = result.cloudProviders;
                    });

                if ($state.params.userCloudProviderId) {
                    $scope.newvpc.userCloudProviderId = $state.params.userCloudProviderId;
                    $scope.disableAWSAccountId = true;

                    $timeout(function () {
                        $scope.vpcForm.selectAccountId.$validate();
                    }, 500);
                }
                RegionService.getRegions()
                    .then(function (response) {
                        $scope.regions = response.data;
                    });
            };

            self.init();
        }]);
