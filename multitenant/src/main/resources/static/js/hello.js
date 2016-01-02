angular.module('hello', [ 'ngRoute' ]).config(function($routeProvider, $httpProvider) {
    $routeProvider.when('/', {
        templateUrl : 'login.html',
        controller : 'navigation'
    }).when('/login', {
        templateUrl : 'login.html',
        controller : 'navigation'
    }).when('/products', {
        templateUrl : 'products.html',
        controller : 'products',
        resolve: {
            factory: checkRouting
        }
    }).otherwise('/');

    $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

}).run( function($rootScope, $location) {
    console.log("running", $rootScope)
    // register listener to watch route changes
    $rootScope.$on( "$routeChangeStart", function(event, next, current) {
        if (!$rootScope.authenticated) {
            // no logged user, we should be going to #login
            if ( next.templateUrl == "/login.html" ) {
                // already going to #login, no redirect needed
            } else {
                // not going to #login, we should redirect now
                $location.path( "/login" );
            }
        } else {
            $location.path( "/products" );
        }
    });
}).controller(
    'navigation',
    function($rootScope, $scope, $http, $location, $route) {

        $scope.tab = function(route) {
            return $route.current && route === $route.current.controller;
        };

        var authenticate = function(credentials, callback) {

            var headers = credentials ? {
                authorization : "Basic "
                + btoa(credentials.username + ":"
                    + credentials.password)
            } : {};

            $http.get('user', {
                headers : headers
            }).success(function(data) {
                if (data.name) {
                    $rootScope.authenticated = true;
                } else {
                    $rootScope.authenticated = false;
                }
                callback && callback($rootScope.authenticated);
            }).error(function() {
                $rootScope.authenticated = false;
                callback && callback(false);
            });

        }

        authenticate();

        $scope.credentials = {};
        $scope.login = function() {
            authenticate($scope.credentials, function(authenticated) {
                $scope.authenticated = authenticated;
                $scope.error = !authenticated;
                if (authenticated) {
                    console.log("Login succeeded")
                    $location.path("/products");
                    $scope.error = false;
                    $rootScope.authenticated = true;
                    $scope.$apply( function () { $location.path("/products") } );
                } else {
                    console.log("Login failed")
                    $location.path("/login");
                    $scope.error = true;
                    $rootScope.authenticated = false;
                }
            })
        };

        $scope.logout = function() {
            $http.post('logout', {}).success(function() {
                $rootScope.authenticated = false;
                $location.path("/");
            }).error(function(data) {
                console.log("Logout failed")
                $rootScope.authenticated = false;
            });
        }

    }).controller('products', function($scope, $http) {
        $http.get('/products').success(function(data) {
            $scope.products = data;
        })
    });

var checkRouting = function ($q, $rootScope, $location) {
    return $rootScope.authenticated
};