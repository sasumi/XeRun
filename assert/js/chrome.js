(function(){
	const sendMessageToBackground = (msgObj, onResponse) => {
		console.debug('sendMessageToBackground', msgObj);
		chrome.runtime.sendMessage(msgObj, onResponse);
	};

	const sendExtensionMessage = ()=>{

	};

	const onMessage = (handler) => {
		chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
			console.debug('backgroundOnMessage', request);
			handler(request, sender, sendResponse);
		});
	};

	const getCurrentTabId = (callback) => {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
			callback(tabs.length ? tabs[0].id : null);
		});
	};

	const getBackgroundPage = () => {
		return chrome.extension.getBackgroundPage();
	};

	const sendMessageToContent = (msgObj, callback = null, tabId = null) => {
		if(tabId){
			console.debug('sendMessageToContent', msgObj);
			chrome.tabs.sendMessage(tabId, msgObj, function(response){
				if(callback){
					callback(response);
				}
			});
		}else{
			getCurrentTabId(tabId => {
				console.debug('sendMessageToContent', msgObj);
				chrome.tabs.sendMessage(tabId, msgObj, function(response){
					if(callback){
						callback(response);
					}
				});
			});
		}
	};

	window.TAPD_HELPER_CHROME = {
		getBackgroundPage: getBackgroundPage,
		sendMessageToContent: sendMessageToContent,
		getCurrentTabId: getCurrentTabId,
		onMessage: onMessage,
		sendMessageToBackground: sendMessageToBackground,
	};
})();