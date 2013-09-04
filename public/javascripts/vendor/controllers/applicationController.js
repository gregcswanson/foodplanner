function ApplicationCtrl($scope) {
    $scope.isExpanded = true;
    $scope.expandedClick = function(){
        $scope.isExpanded = !$scope.isExpanded;
    };
}

function HomeCtrl($scope) {
    $scope.page = "Home";
}

function HeaderCtrl($scope) {
    $scope.searchText = "";
    $scope.searchClick = function(){
        
    };
}

function MenuCtrl($scope) {
    
}

function AboutCtrl($scope) {
    
}

function AboutContactCtrl($scope) {
    
}