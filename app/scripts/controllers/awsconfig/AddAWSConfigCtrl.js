'use strict';

/**
 * @ngdoc function
 * @name teemOpsApp.controller:AddAWSConfigCtrl
 * @description
 * # AddAWSConfigCtrl
 * Adds a new AWS Config for a user and links it to their TeemOps account
 */
angular.module('teemOpsApp')
  .controller('AddAWSConfigCtrl', ['$scope', '$rootScope', '$mdPanel', '$window', '$state', '$timeout', '$filter', 'ENV',
      'UserService', 'AppService', 'UserCloudConfigService', 'UserCloudProviderService', 'RegionService', 'CloudApiService', 'CredentialService',
    function ($scope, $rootScope, $mdPanel, $window, $state, $timeout, $filter, ENV,
      UserService, AppService, UserCloudConfigService, UserCloudProviderService, RegionService, CloudApiService, CredentialService) {

      var self = this;
      var awsCloudProviderId = 1; //TODO read from DB

      $scope.selected = 0;

      $scope.instanceTypes = null;
      $scope.vpcs = [];
      $scope.securityGroups = [];
      $scope.subnets = [];
      $scope.accountCredentials = null;
      $scope.regions=[];

      $scope.config = {
        id : 0,
        name : null,
        userId: null,
        userCloudProviderId: null,
        vpc: null,
        appSubnet: null,
        appSecurityGroup: null,
        appInstanceType: null,
        customData: null,
        region: null,
        arn: null
      };

      $scope.save = function(valid){

        $scope.awsConfigForm.submitted = true;

        if(valid) {

          if(!$scope.config.userCloudProviderId && $scope.config.awsAccountId) {

            var onSuccess = function(result){
              $scope.config.userCloudProviderId = result.id;
              self.createAWSConfig();
            };

            self.createNewCloudProviderAccount(onSuccess);
          }
          else {
            self.createAWSConfig();
          }
        }
      };

      self.createNewCloudProviderAccount = function(onSuccess){
        var data = {
          userId: $rootScope.currentUser.userid,
          cloudProviderId: awsCloudProviderId,
          awsAccountId: $scope.config.awsAccountId,
          isDefault: false
        };

        UserCloudProviderService.addCloudProviderAccount(data)
          .then(function(result){
            onSuccess(result);
          })
          .catch(function(result){
            //TODO
          });
      };

      self.createAWSConfig = function(){
        var subnetsArray=[];
        subnetsArray=$scope.config.appSubnet;
        $scope.config.appSubnet=subnetsArray.join(',');
        UserCloudConfigService.create($rootScope.currentUser.userid, $scope.config)
          .then(function(result){

            if(result.id){

              if($state.params.appId) {
                AppService.getApp($state.params.appId)
                  .then(function(app){

                    if(app) {
                      app.awsConfigId = result.id;

                      AppService.saveApp(app)
                        .finally(function(){
                          $state.go('apps.list');
                        });
                    }
                  })
                  .catch(function(){
                    $state.go('apps.list');
                  });
              }
              else {
                $state.go('awsconfigs');
              }
            }
          })
          .catch(function(){
            //TODO handle this
            //MessageService.setMessage('error', error);
          })
          .finally(function(){
            //$scope.processing = false;
          });
      };

      $scope.cancel = function(){
        $state.go('awsconfigs');
      };

      self.init = function(){

        UserService.getUserByID($rootScope.currentUser.userid)
          .then(function(result){
            $scope.cloudProviders = result.cloudProviders;
          });

        if($state.params.userCloudProviderId) {
          $scope.config.userCloudProviderId = $state.params.userCloudProviderId;
          $scope.disableAWSAccountId = true;

          $timeout(function() {
            $scope.awsConfigForm.selectAccountId.$validate();
          }, 500);
        }

        RegionService.getRegions()
          .then(function(response){
            $scope.regions = response.data;
          });
      };

      $scope.$watch(function() { return self.getSelectedAccountId(); }, function(newVal, oldVal){

        if(newVal && newVal !== oldVal) {

          CredentialService.getUserCreds()
            .then(function(result){
              var filteredCreds=$filter('filter')(result, { userCloudProviderId: newVal });
              $scope.accountCredentials = filteredCreds;
              //select 1st credentials
              console.log(JSON.stringify(filteredCreds));
              $scope.config.arn=null;
            });

          self.resetFormAndCloudAPIOptions();
        }
      });

      $scope.$watch(function() { return $scope.config.arn }, function(newVal, oldVal){

        if(newVal && newVal !== oldVal) {

          self.resetFormAndCloudAPIOptions();

          if($scope.config.region) {
            self.getVPCs();
            self.getSubnets();
            self.getSecurityGroups();
          }
        }
      });

      $scope.$watch(function() { return $scope.config.region; }, function(newVal, oldVal){

        if(newVal && newVal !== oldVal) {

          self.resetFormAndCloudAPIOptions();
          self.getInstanceTypes();
          if($scope.config.arn) {
            self.getVPCs();
            self.getSubnets();
            self.getSecurityGroups();
          }
          
        }
      });
      // /**
      //  * 
      //  */
      // $scope.$watch(function(){ return $scope.config.vpc; }, function(newVal, oldVal){
      //   console.log(newVal+' oldVal'+oldVal+ ' Subnets:'+JSON.stringify($scope.subnets));
      //   // if(newVal && newVal !== oldVal) {
      //     var subnets=$scope.subnets;
      //     $scope.subnets = $filter('filter')(subnets, { VpcId: newVal });
      //   // }
      // });

      self.resetFormAndCloudAPIOptions = function(){
        self.clearVPC();
        self.clearAppSG();
        self.clearAppSubnet();

        $scope.awsConfigForm.$setPristine();
        $scope.awsConfigForm.$setUntouched();
      };

      self.clearVPC = function() {
        $scope.config.vpc = null;
      };

      self.clearAppSubnet = function(){
        $scope.config.appSubnet = null;
      };

      self.clearAppSG = function(){
        $scope.config.appSecurityGroup = null;
      };

      self.getSelectedAccountId = function(){
        return $scope.config.userCloudProviderId ? $scope.config.userCloudProviderId : $scope.config.awsAccountId;
      };

      self.getInstanceTypes= function(){
        UserCloudConfigService.getInstanceTypeList($scope.config.region)
          .then(function(result){
            if(result.data!=null){
              $scope.instanceTypes=result.data;
            }
          })
          .catch(function(err){
            //TODO handle error
            if(ENV.name === 'development') {
              console.log(err);
            }
          });
      }

      self.getVPCs = function(){
        console.log('AWS Account ID' + self.getSelectedAccountId());
        CloudApiService.getVPCData('describeVpcs', self.getSelectedAccountId(), {}, $scope.config.region, 'Vpcs[].{ID: VpcId, IPRange: CidrBlock, Tags: Tags[*]}')
          .then(function(result){
            if(result.data!=null){
              $scope.vpcs = result.data;
            }
            
          })
          .catch(function(err){
            //TODO handle error
            if(ENV.name === 'development') {
              console.log(err);
            }
          });
      };

      self.getSubnets = function() {
        CloudApiService.getVPCData('describeSubnets', self.getSelectedAccountId(), {}, $scope.config.region, 'Subnets[].{ID: SubnetId, IPRange: CidrBlock, VpcId: VpcId, AvailabilityZone: AvailabilityZone, Tags: Tags[*]}')
          .then(function(result){
            if(result.data!=null){
              $scope.subnets = result.data;
            }
          })
          .catch(function(err){
            //TODO handle error
            if(ENV.name === 'development') {
              console.log(err);
            }
          });

      };

      self.getSecurityGroups = function() {
        CloudApiService.getVPCData('describeSecurityGroups', self.getSelectedAccountId(), {}, $scope.config.region, 'SecurityGroups[].{ID: GroupId, Description: Description, VpcId: VpcId, Name: GroupName, Tags: Tags[*]}')
          .then(function(result){
            if(result.data!=null){
              $scope.securityGroups = result.data;
            }
          })
          .catch(function(err){
            //TODO handle error
            if(ENV.name === 'development') {
              console.log(JSON.stringify(err));
            }
          });

      };

      self.init();
    }]);
