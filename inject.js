var inited = false;
// var extensionid = 'giompennnhheakjcnobejbnjgbbkmdnd'; //online
var extensionid = 'joolcgbmgmboebipkkpjpppcakagfhjl'; //offline

var refresh = function(){
	chrome.runtime.sendMessage({source:'content',event:'sync',data:dump()});
};

chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
	if(message.source === 'popup'){
		if(message.event === 'onload'){
			if(!inited){
				init();
			}
		}else if(message.event === 'savePermissions'){
			var value = Base64.encode( JSON.stringify(message.data) );
			local.setItem('kynect.accessReports',value);
			sendResponse(dump());
		}else if(message.event  === 'pull'){
			sendResponse(dump());
		}else if(message.event  === 'pullSession'){
			sendResponse(dumpSession());
		}else if(message.event  === 'pullCookie'){
			sendResponse(dumpCookie());
		}else if(message.event  === 'clear'){
			local.clear();
			sendResponse(dump());
		}else if(message.event  === 'clearSession'){
			session.clear();
			sendResponse(dumpSession());
		}else if(message.event  === 'clearCookie'){
            for(var i=0,l=message.data.c.length;i<l;i++){
                Cookies.expire(message.data.c[i].key);
            }
			sendResponse(dumpCookie());
		}else if(message.event  === 'remove'){
			local.removeItem(message.data.key);
			sendResponse(dump());
		}else if(message.event  === 'removeSession'){
			session.removeItem(message.data.key);
			sendResponse(dumpSession());
		}else if(message.event  === 'removeCookie'){
			Cookies.expire(message.data.key);
			sendResponse(dumpCookie());
		}else if(message.event  === 'add'){
			local.setItem(message.data.key,message.data.value);
			sendResponse(dump());
		}else if(message.event  === 'addCookie'){
			Cookies.set(message.data.key,message.data.value);
			sendResponse(dumpCookie());
		}else if(message.event  === 'editCookie'){
			Cookies.set(message.data.key,message.data.value);
			sendResponse(dumpCookie());
		}else if(message.event  === 'addSession'){
			session.setItem(message.data.key,message.data.value);
			sendResponse(dumpSession());
		}else if(message.event  === 'dump'){

		}else if(message.event  === 'popup'){

		}
	}else if(message.source === 'background'){
		if(message.event === 'init'){
			sendResponse(localStorage.length);
		}else if(message.event === 'refresh'){
			refresh();
		}
	}
});
