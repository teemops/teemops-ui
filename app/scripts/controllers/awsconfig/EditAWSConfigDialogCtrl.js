'use strict';

/**
 * @ngdoc function
 * @name teemOpsApp.controller:EditAWSConfigDialogCtrl
 * @description
 * # EditAWSConfigDialogCtrl
 * Allow's a user to edit an AWS config
 */
angular.module('teemOpsApp')
  .controller('EditAWSConfigDialogCtrl', ['$scope', '$rootScope', '$timeout',
    'UserService', 'UserCloudConfigService', 'UserCloudProviderService', 'mdPanelRef', 'config', 'cloudProviders', 'RegionService',
    function ($scope, $rootScope, $timeout,
      UserService, UserCloudConfigService, UserCloudProviderService, mdPanelRef, config, cloudProviders, RegionService) {

      var self = this;
      var awsCloudProviderId = 1; //TODO read from DB
      console.log(JSON.stringify("CONFG: " + JSON.stringify(config)));
      
      $scope.instanceTypes = null;
      $scope.vpcs = [];
      $scope.securityGroups = [];
      $scope.subnets = [];
      $scope.accountCredentials = null;

      $scope.config = config;
      

      $scope.cancel = function(){
        self.closeDialog();
      };

      $scope.save = function(valid){

        $scope.awsConfigForm.submitted = true;

        if(valid) {

          if(!$scope.config.userCloudProviderId && $scope.config.awsAccountId) {

            var onSuccess = function(result){
              $scope.config.userCloudProviderId = result.id;
              self.updateConfig();
            };

            self.createNewCloudProviderAccount(onSuccess);
          }
          else {
            self.updateConfig();
          }
        }
      };

      self.getInstanceTypes= function(){
        UserCloudConfigService.getInstanceTypeList(config.region)
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

      // self.createNewCloudProviderAccount = function(onSuccess){
      //   var data = {
      //     userId: $rootScope.currentUser.userid,
      //     cloudProviderId: awsCloudProviderId,
      //     awsAccountId: $scope.config.awsAccountId,
      //     isDefault: false
      //   };

      //   UserCloudProviderService.addCloudProviderAccount(data)
      //     .then(function(result){
      //       onSuccess(result);
      //     })
      //     .catch(function(result){
      //       //TODO
      //     });
      // };

      self.updateConfig = function(){
        UserCloudConfigService.update($rootScope.currentUser.userid, $scope.config)
          .then(function(result){

            if(result.status === 'success'){
              self.closeDialog();
            }

          })
          .catch(function(){
            //TODO: Handle error
            //MessageService.setMessage('error', error);
          })
      }

      self.closeDialog = function(){
        if(mdPanelRef){
          mdPanelRef.close();
        }
      };

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

      self.init = function(){

        if(config.userCloudProviderId) {
          config.awsAccountId = null;
        }

        self.getInstanceTypes();
        $scope.cloudProviders = cloudProviders;
        $scope.config= config;

        $timeout(function() {
          $scope.awsConfigForm.appInstanceType.$validate();
          $scope.awsConfigForm.selectAccountId.$validate();
        }, 400);

        RegionService.getRegions()
          .then(function(response){
            $scope.regions = response.data;
          });

      };

      self.init();

    }]);
