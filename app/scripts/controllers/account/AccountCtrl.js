'use strict';

/**
 * @ngdoc function
 * @name teemOpsApp.controller:AccountCtrl
 * @description
 * # AccountCtrl
 * Controller of the teemOpsApp
 */
angular.module('teemOpsApp')
  .controller('AccountCtrl', ['$scope', '$stateParams', '$rootScope', '$filter', '$mdDialog', '$mdToast',
    'UserService', 'UserCloudProviderService', 'UserCloudConfigService', 'ENV',
    function ($scope, $stateParams, $rootScope, $filter, $mdDialog, $mdToast,
      UserService, UserCloudProviderService, UserCloudConfigService, ENV) {

      $scope.user = null;
      $scope.keys = null;
      $scope.password = '';
      $scope.Authorised = false;
      $scope.supportEmail = ENV.supportEmail;
      $scope.deleteButtonsEnabled = ENV.deleteButtonsEnabled;
      $scope.enableOrgs = false;
      $scope.org = {
        id: 0,
        name: null,
        owner: null
      };
      $scope.newCloudProvider;

      var awsCloudProviderId = 1; //TODO: Read from DB

      $scope.init = function () {
        $scope.getUserByID();
        $scope.getKeys();

        if ($stateParams && $stateParams.mode === 'edit') {
          $scope.editModeEnabled = true;
        }
      };

      $scope.getKeys = function () {
        UserService.getKeys()
          .then(function (data) {
            if (data) {
              $scope.keys = data;
            }
          })
          .catch(function (result) {
            if (ENV.name === 'development') {
              console.log('Error: ' + result);
            }
          });
      };

      $scope.downloadKey = function (key) {
        UserService.getKey(key)
          .then(function (data) {
            if (data) {
              var file = new Blob([data], {
                type: 'text/plain'
              });
              //trick to download store a file having its URL
              var fileURL = URL.createObjectURL(file);
              var a = document.createElement('a');
              a.href = fileURL;
              a.target = '_blank';
              a.download = `${key.account}-${key.region}-teemops-${$rootScope.currentUser.userid}.pem`;
              document.body.appendChild(a); //create the link "a"
              a.click(); //click the link "a"
              document.body.removeChild(a); //remove the link "a"
              console.log(data);
            }
          })
          .catch(function (result) {
            if (ENV.name === 'development') {
              console.log('Error: ' + result);
            }
          });
      };

      $scope.authoriseSSH = function (password) {
        UserService.authoriseSSHKeys($scope.user.email, password)
          .then(function (data) {
            if (data) {
              $scope.password = null;
              $scope.Authorised = data;
              $mdToast.show({
                hideDelay: 3000,
                position: 'top right',
                locals: {
                  status: 'success',
                  message: `SSH Keys have been unlocked`
                },
                controller: 'ToastCtrl',
                templateUrl: 'views/_partials/toast.html'
              });
            } else {
              if (data === false) {
                $mdToast.show({
                  hideDelay: 3000,
                  position: 'top right',
                  locals: {
                    status: 'error',
                    message: `Password was incorrect`
                  },
                  controller: 'ToastCtrl',
                  templateUrl: 'views/_partials/toast.html'
                });
              }
            }
          })
          .catch(function (result) {
            if (ENV.name === 'development') {
              console.log('Error: ' + result);
            }
          });
      }

      $scope.getUserByID = function () {

        UserService.getUserByID($rootScope.currentUser.userid)
          .then(function (data) {

            $scope.user = data;

            if (!$scope.user.cloudProviders || $scope.user.cloudProviders.length === 0) {
              $scope.newCloudProvider = { isDefault: true };
            } else {
              $scope.newCloudProvider = { isDefault: false };
            }

            angular.forEach($scope.user.cloudProviders, function (cloudProvider) {
              cloudProvider.isDefault = cloudProvider.isDefault === 1 ? true : false;
              cloudProvider.initial = angular.copy(cloudProvider);
            });
          })
          .catch(function (result) {
            if (ENV.name === 'development') {
              console.log('Error: ' + result);
            }
          });
      };

      $scope.disableCloudProviderButton = function (cloudProvider) {

        return cloudProvider.saveEnabled;
      }

      self.handleSaveAccountSuccess = function (result) {
        if (result.status === 'success') {
          $scope.getUserByID();
        }
      };

      self.handleSaveAccountError = function (result) {
        if (ENV.name === 'development') {
          console.log(result);
        }
      };

      $scope.addCloudProviderAccount = function (isValid) {

        if (isValid) {
          var data = {
            userId: $rootScope.currentUser.userid,
            cloudProviderId: awsCloudProviderId,
            awsAccountId: $scope.newCloudProvider.awsAccountId,
            name: $scope.newCloudProvider.name,
            isDefault: $scope.newCloudProvider.isDefault
          };

          UserCloudProviderService.addCloudProviderAccount(data)
            .then(function (result) {

              self.handleSaveAccountSuccess(result);

              if (result.status === 'success') {
                $scope.newCloudProvider = {
                  awsAccountId: '',
                  name: '',
                  isDefault: false
                };

                $scope.accountForm.$setUntouched();
              }
            })
            .catch(function (result) {
              self.handleSaveAccountError(result);
            });
        }
      };

      $scope.removeCloudProviderAccount = function (ev, id) {

        var confirm = $mdDialog.confirm()
          .title('Confirm delete')
          .textContent('Removing this AWS Account ID will remove any associated credentials. Continue?')
          .ariaLabel('Confirm delete')
          .targetEvent(ev)
          .ok('Yes, remove this AWS Account ID')
          .cancel('Cancel');

        $mdDialog.show(confirm).then(function () {
          self.removeCloudProviderAccount(id);
        });
      };

      $scope.updateCloudProviderAccount = function (cloudProvider) {

        var updated = {
          id: cloudProvider.id,
          awsAccountId: cloudProvider.awsAccountId,
          name: cloudProvider.name,
          isDefault: cloudProvider.isDefault
        };

        UserCloudProviderService.updateCloudProviderAccount($rootScope.currentUser.userid, updated)
          .then(function (result) {
            if (result.status === 'success') {
              cloudProvider.saveEnabled = false;
            }
          })
          .catch(function (result) {
            self.handleSaveAccountError(result);
          });
      };

      $scope.trackChanges = function (cloudProvider) {
        cloudProvider.saveEnabled = true;
        $scope.onIsDefaultChanged(cloudProvider);
      };

      $scope.onIsDefaultChanged = function (cloudProvider) {
        if (cloudProvider.isDefault) {

          angular.forEach($scope.user.cloudProviders, function (current) {

            if (current.id !== cloudProvider.id) {
              current.isDefault = false;
            }
          });
        }
        if ($scope.newCloudProvider && cloudProvider.id > 0) {
          $scope.newCloudProvider.isDefault = false;
        }
      };

      $scope.cancelChanges = function (cloudProvider) {
        cloudProvider.awsAccountId = cloudProvider.initial.awsAccountId;
        cloudProvider.name = cloudProvider.initial.name;
        cloudProvider.isDefault = cloudProvider.initial.isDefault;
        cloudProvider.saveEnabled = false;
      };

      self.removeCloudProviderAccount = function (id) {

        UserCloudProviderService.removeCloudProviderAccount($rootScope.currentUser.userid, id)
          .then(function (result) {
            self.handleSaveAccountSuccess(result);
          })
          .catch(function (result) {
            self.handleSaveAccountError(result);
          });
      };

      $scope.showInviteDialog = function (credential) {

        self.config.controller = 'ViewCredentialDialogCtrl';
        self.config.templateUrl = 'views/account/org/invite-dialog.html';
        self.config.locals = {
          credential: credential
        };

        self._mdPanel.open(self.config);
      };

      $scope.init();
    }]);
