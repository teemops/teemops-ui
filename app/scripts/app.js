'use strict';

/**
 * @ngdoc overview
 * @name teemOpsApp
 * @description
 * # teemOpsApp
 *
 * Main module of the application.
 */
angular
  .module('teemOpsApp', [
    'ngAnimate',
    'ngCookies',
    'ui.router',
    'ngSanitize',
    //'ngTouch',
    'ngStorage',
    'envConfig',
    //'angular-loading-bar',
    'angular-timezone-selector',
    'angular-jwt',
    'ngMaterial',
    'ngMessages',
    'ngMdIcons',
    'ncy-angular-breadcrumb',
    'md-steppers',
    'ngclipboard',
    'vAccordion'
  ])
  .config(function ($stateProvider, $urlRouterProvider, $locationProvider, ENV) {

    $urlRouterProvider.otherwise('/');
    $urlRouterProvider.when('/', '/dashboard');

    $stateProvider
    .state('public', {
      url: '/public',
      templateUrl: 'public.html',
      ncyBreadcrumb: {
        label: 'Teem Ops'
      }
    })
    .state('register', {
      url: '/register',
      templateUrl: 'views/register/main.html',
      parent: 'public',
      controller: 'RegisterCtrl'
    })
    .state('login', {
      url: '/login?redirect',
      templateUrl: 'views/login/main.html',
      parent: 'public',
      controller: 'LoginCtrl'
    })
    .state('confirm', {
      url: '/confirm/:code',
      templateUrl: 'views/register/confirmation.html',
      parent: 'public',
      controller: 'ConfirmationCtrl'
    })
    .state('/', {
      url: '/',
      templateUrl: 'private.html',
      access: {
        authenticationRequired: true
      },
      ncyBreadcrumb: {
        label: 'Teem Ops'
      },
      resolve: {
        'AppStatusListData' : function(AppStatusService){
          return AppStatusService.promise;
        }
      }
    })
    .state('dashboard', {
      url: 'dashboard',
      templateUrl: 'views/dashboard/main.html',
      controller: 'DashboardCtrl',
      parent: '/',
      access: {
        authenticationRequired: true
      },
      ncyBreadcrumb: {
        label: 'Dashboard'
      },
      data: {
        pageTitle: 'Dashboard'
      }
    })
    .state('apps', {
      abstract: true,
      url: 'apps',
      parent: '/',
      template: '<ui-view/>',
      ncyBreadcrumb: {
        label: 'Servers'
      }
    })
    .state('apps.new', {
      url: '/new',
      templateUrl: 'views/app/new.html',
      controller: 'AddAppCtrl',
      access: {
        authenticationRequired: true
      },
      ncyBreadcrumb: {
        label: 'Create Server',
        parent: 'apps.list'
      },
      data: {
        pageTitle: 'Create App'
      }
    })
    .state('apps.list', {
      url: '/list',
      templateUrl: 'views/app/list.html',
      controller: 'ViewAppsCtrl',
      access: {
        authenticationRequired: true
      },
      ncyBreadcrumb: {
        label: 'My Apps'
      },
      data: {
        pageTitle: 'My Apps'
      }
    })
    .state('apps.detail', {
      url: '/:id?scrollTo:section',
      templateUrl: 'views/app/detail.html',
      controller: 'AppDetailCtrl',
      access: {
        authenticationRequired: true
      },
      ncyBreadcrumb: {
        label: '{{ app.name }}',
        parent: 'apps.list'
      }
    })
    .state('account', {
      url: 'account?:mode',
      templateUrl: 'views/account/main.html',
      parent: '/',
      access: {
        authenticationRequired: true
      },
      ncyBreadcrumb: {
        label: 'My Account'
      },
      data: {
        pageTitle: 'My Account'
      }
    })
    .state('credentials', {
      url: 'credentials',
      parent: '/',
      templateUrl: 'views/credentials/main.html',
      controller: 'ListCredentialsCtrl',
      access: {
        authenticationRequired: true
      },
      ncyBreadcrumb: {
        label: 'AWS Accounts'
      },
      data: {
        pageTitle: 'AWS Accounts'
      }
    })
    .state('credentials.new', {
      url: 'credentials/new?:appId&userCloudProviderId',
      parent: '/',
      templateUrl: 'views/credentials/new.html',
      controller: 'AddCredentialViewPickerCtrl',
      access: {
        authenticationRequired: true
      },
      ncyBreadcrumb: {
        label: 'Link an AWS Account',
        parent: 'credentials'
      },
      data: {
        pageTitle: 'Link an AWS Account'
      }
    })
    .state('credentials.new.stepper', {
      url: '/stepper',
      controller: 'AddCredentialCtrl',
      parent: 'credentials.new',
      access: {
        authenticationRequired: true
      },
      templateUrl: 'views/credentials/new-steppers.html',
      ncyBreadcrumb: {
        label: 'Link an AWS Account',
        parent: 'credentials'
      },
    })
    .state('credentials.new.simple', {
      url: '/simple',
      controller: 'AddCredentialCtrl',
      parent: 'credentials.new',
      access: {
        authenticationRequired: true
      },
      templateUrl: 'views/credentials/new-simple.html',
      ncyBreadcrumb: {
        label: 'Link an AWS Account',
        parent: 'credentials'
      }
    })
    .state('awsconfigs', {
      url: 'awsconfigs',
      parent: '/',
      templateUrl: 'views/awsconfig/main.html',
      controller: 'ListAWSConfigsCtrl',
      access: {
        authenticationRequired: true
      },
      ncyBreadcrumb: {
        label: 'AWS Launch Configs'
      },
      data: {
        pageTitle: 'AWS Launch Configs'
      }
    })
    .state('opsbot', {
      url: 'opsbot',
      parent: '/',
      templateUrl: 'views/opsbot/list.html',
      controller: 'ListOpsBotCtrl',
      access: {
        authenticationRequired: true
      },
      ncyBreadcrumb: {
        label: 'Ops Bot'
      },
      data: {
        pageTitle: 'Ops Bot'
      }
    })
    .state('vpc', {
      url: 'vpc',
      parent: '/',
      templateUrl: 'views/networking/view.html',
      controller: 'NetworkingCtrl',
      access: {
        authenticationRequired: true
      },
      ncyBreadcrumb: {
        label: 'Networking'
      },
      data: {
        pageTitle: 'Networking'
      }
    })
    .state('awsconfigs.new', {
      url: 'awsconfigs/new?appId&userCloudProviderId',
      parent: '/',
      templateUrl: 'views/awsconfig/new.html',
      controller: 'AddAWSConfigCtrl',
      access: {
        authenticationRequired: true
      },
      ncyBreadcrumb: {
        label: 'Create AWS Launch Config',
        parent: 'awsconfigs'
      },
      data: {
        pageTitle: 'Create AWS Launch Config'
      }
    });

    if(ENV.name === 'production') {
      $locationProvider.html5Mode(true);
    }

  })
  .config(['$httpProvider', '$localStorageProvider', function($httpProvider, $localStorageProvider) {
    //$httpProvider.interceptors.push('httpDelay');
    $httpProvider.interceptors.push('httpErrorHandler');
    $httpProvider.interceptors.push('authTokenHandler');

    $localStorageProvider.setKeyPrefix('teemops-');
  }])
  .config(function($mdThemingProvider, $breadcrumbProvider) {
    $mdThemingProvider.theme('default')
      .primaryPalette('orange', { 'default' : '800', 'hue-1': '300'})
      .accentPalette('blue-grey', { 'default' : '500', 'hue-1' : '100', 'hue-2' : '200', 'hue-3' : '700' })
      .warnPalette('red');

    $mdThemingProvider.theme('dialog')
      .primaryPalette('blue-grey')
      .accentPalette('grey');

    $breadcrumbProvider.setOptions({
      templateUrl: 'views/_partials/breadcrumb.html'
    });
  })
  .run(function($rootScope, $state, $location, $window, $mdDialog, $localStorage, $mdMedia,
    MessageService, AppService, AuthenticationService, appStatusFactory) {

    $rootScope.$on('$stateChangeStart', function(event, toState, toParams) {

      function handleExpiredTokenAndRedirect(){
        AuthenticationService.handleExpiredToken();
        var url = $state.href(toState, toParams);
        $state.go('login', { redirect : url });
        event.preventDefault();
      }

      if (toState.access && toState.access.authenticationRequired) {

          if(AuthenticationService.isUserAuthenticated()) {

            if(AuthenticationService.isTokenRefreshRequired()) {

              AuthenticationService.refreshToken()
                .then(function(authenticated){
                  if(authenticated){
                    $state.go(toState.name, toParams);
                    event.preventDefault();
                  }
                  else {
                    handleExpiredTokenAndRedirect();
                  }
                })
                .catch(function(){
                  handleExpiredTokenAndRedirect();
                });
            }

            if (!$rootScope.currentUser) { //Page refresh
              $rootScope.currentUser = $localStorage.currentUser;
              appStatusFactory.subscribeToAppUpdates();
            }

          }
          else {
            handleExpiredTokenAndRedirect();
          }
      }

      if(toState.data){
        $rootScope.pageTitle = toState.data.pageTitle;
      }

      MessageService.clear();
      $mdDialog.cancel();
    });


    $rootScope.$on('$routeChangeStart', function() { $mdDialog.cancel(); });

    $rootScope.$mdMedia = $mdMedia;

  });
