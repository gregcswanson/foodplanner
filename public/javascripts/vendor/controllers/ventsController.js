function VentsCtrl($scope, $http) {
    
    $scope.vents = [];
    $scope.comment = '';
    $scope.refresh = function(){
        $http.get('api/vents').success(function(data) {
            $scope.vents = data;
        });
    };
    $scope.update = function(){
        if($scope.comment !== ""){
            $http.post('api/vents', { 'comment': $scope.comment})
                .success(function(){
                    $scope.refresh();
                    $scope.comment = '';
                });  
        }
    };
    $scope.refresh();
}  