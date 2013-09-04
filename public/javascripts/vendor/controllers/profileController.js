function ProfileCtrl($scope, $http) {
    $scope.master = { };
 
    $scope.update = function(user) {
        $scope.master = angular.copy(user);
        $http.put('api/profile', user).success(function(data) {
            console.log(data);
            $scope.user = data;
        });
    };
 
    $scope.reset = function() {
        $http.get('api/profile').success(function(data) {
            console.log(data);
            $scope.master = data;
            $scope.user = angular.copy($scope.master);
        });
    };
 
    $scope.reset();
}