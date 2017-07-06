var sendMessage = function(ev,cb,data){
    if(window.chrome && window.chrome.tabs){
        chrome.tabs.query({"status":"complete","windowId":chrome.windows.WINDOW_ID_CURRENT,"active":true}, function(tabs){
            chrome.tabs.sendMessage(tabs[0].id,{source:'popup',event:ev,data:data},cb);          
        });
    }else{
        switch(ev){
            case 'savePermissions':
                var value = Base64.encode( JSON.stringify(data) );
                local.setItem('kynect.accessReports',value);
                sendResponse(dump());
                break;
            case 'pull':
                cb(dump());
                break;
            case 'pullSession':
                cb(dumpSession());
                break;
            case 'pullCookie':
                cb(dumpCookie());
                break;
            case 'add':
                local.setItem(data.key,data.value);
                cb(dump());
                break;
            case 'addSession':
                session.setItem(data.key,data.value);
                cb(dumpSession());
                break;
            case 'addCookie':
                Cookies.set(data.key,data.value);
                cb(dumpCookie());
                break;
            case 'remove':
                local.removeItem(data.key);
                cb(dump());
                break;
            case 'removeSession':
                session.removeItem(data.key);
                cb(dumpSession());
                break;
            case 'removeCookie':
                Cookies.expire(data.key);
                cb(dumpCookie());
                break;
            case 'clear':
                local.clear();
                cb(dump());
                break;
            case 'clearSession':
                session.clear();
                cb(dumpSession());
                break;
            case 'clearCookie':
                for(var i=0,l=data.c.length;i<l;i++){
                    Cookies.expire(data.c[i].key);
                }
                break;
        }
    }
};

var selectElementContents = function(el){
    var range = document.createRange();
    range.selectNodeContents(el);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
}
var extension = angular.module('storageManagerApp',['ui.bootstrap','ngSanitize']);

extension.directive('ngContenteditable', ['$sce', function($sce){
    return {
        restrict: 'A',
        require: '?ngModel',
        link: function ($scope, element, attrs, ngModel) { 
            if (!ngModel) return;
            function read() {
                var text = element.text();
                /*if ( attrs.stripBr && html == '<br>' ) {
                    html = '';
                }*/
                ngModel.$setViewValue(text);
            }
            $scope.$watch('editing',function(editing,oldEditing){
                if(editing === $scope.item.key && $scope.editingType === $scope.item.type){
                    attrs.$set('contenteditable','plaintext-only');
                    selectElementContents(element[0]);
                    $scope.item.expand = true;
                }else{
                    attrs.$set('contenteditable',false);
                }
            });
            $scope.$watch('item.expand',function(expand,oldExpand){
                ngModel.$render();
            });
            ngModel.$render = function() {
                var text = ngModel.$viewValue || '';
                var length = text.length;
                if(length>300 && !$scope.item.expand){
                    text = text.substr(0,300)+' ... ('+(length-300)+' chars more)';
                }
                element.text(text);
            };
            element.on('blur keyup change', function() {
                $scope.$apply(read);
            });
            //read();
        }
    }
}]);

extension.filter('with', function() {
  return function(items, field) {
        var result = {};
        angular.forEach(items, function(value, key) {
            if (!field) {
                result[key] = value;
            }
            else if(key.indexOf(field) !== -1){
                result[key] = value;
            }
        });
        return result;
    };
});

extension.controller('storageController',function($scope){
    $scope.type = 'local';
    $scope.localStorage = [];
    $scope.sessionStorage = [];
    $scope.permissions = {};
    $scope.editing;
    $scope.editingType;
    $scope.percentage = 0;

    var findPermissionsObject = function(array){
        for (var i = 0; i < array.length; i++) {
            if(array[i].key == 'kynect.accessReports')
                return array[i].value;
        }
        return null;
    };

    var setPermissions = function(data){
        $scope.permissions = JSON.parse(findPermissionsObject(data));
    };

    $scope.add = function(){
        sendMessage('add',function(data){
            $scope.localStorage = data.storage;
            $scope.percentage = data.percentage;
            setPermissions($scope.localStorage);
            $scope.key = '';
            $scope.value= '';
            $scope.$apply();
        },{key:$scope.key,value:$scope.value});
    };
    $scope.addSession = function(){
        sendMessage('addSession',function(data){
            $scope.sessionStorage = data;
            $scope.key = '';
            $scope.value= '';
            $scope.$apply();
        },{key:$scope.key,value:$scope.value});
    };
    $scope.clear = function(){
		sendMessage('clear',function(data){
            $scope.localStorage = data.storage;
            $scope.percentage = data.percentage;
            setPermissions($scope.localStorage);
            $scope.$apply();
		});
    };
    $scope.clearSession = function(){
		sendMessage('clearSession',function(data){
            $scope.sessionStorage = data;
            $scope.$apply();
		});
    };
    $scope.edit = function(key,type){
        $scope.editing = key;
        $scope.editingType = type;
    };
    $scope.submit = function(){
        sendMessage('savePermissions',function(data){

        },$scope.permissions);
    };
    $scope.refresh = function(){
        sendMessage('pull',function(data){
            $scope.localStorage = data.storage;
            $scope.percentage = data.percentage;
            setPermissions($scope.localStorage);
            $scope.$apply();
        });
    };
    $scope.submitSession = function(key,value){
        $scope.editing = false;
		sendMessage('addSession',function(data){
            $scope.sessionStorage = data;
            $scope.$apply();
		},{key:key,value:value});
    };
    $scope.cancel = function(){
        $scope.editing = false;
    };
    $scope.dump = function(key,value,type){
		sendMessage('dump',function(){},{key:key,value:value,type:type});
    };
    $scope.remove = function(key){
		sendMessage('remove',function(data){
            $scope.localStorage = data.storage;
            $scope.percentage = data.percentage;
            setPermissions($scope.localStorage);
            $scope.$apply();
		},{key:key});
    };
    $scope.removeSession = function(key){
		sendMessage('removeSession',function(data){
            $scope.sessionStorage = data;
            $scope.$apply();
		},{key:key});
    };
    

	sendMessage('pull',function(data){
        $scope.localStorage = data.storage;
        $scope.percentage = data.percentage;
        setPermissions($scope.localStorage);
        $scope.$apply();
	});

	sendMessage('pullSession',function(data){
        $scope.sessionStorage = data;
        $scope.$apply();
	});

    if(window.chrome && window.chrome.runtime && window.chrome.runtime.onMessage){
        chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
            if(message.source === 'content'){
                if(message.event === 'sync'){
                    $scope.$apply();
                }
            }
        });
    }

});

setTimeout(function(){
    var elActive = document.getElementById('activeTab');
    if(elActive){
        if(elActive.value === 'indexedDB'){
            document.querySelector('ul.nav li:nth-child(3) a').click();
        }else{
        }
    }else{
    }
},500);
