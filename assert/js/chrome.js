(function(){
	const sendMessageToBackground = (msgObj, onResponse) => {
		console.debug('sendMessageToBackground', msgObj);
		chrome.runtime.sendMessage(msgObj, onResponse);
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

	const getSetting = ()=>{
		return new Promise((resolve) => {
			TAPD_HELPER_CHROME.sendMessageToBackground({type:'getSetting'}, function(setting){
				resolve(setting);
			});
		});
	};

	const saveSetting = (setting)=>{
		return new Promise(resolve => {
			TAPD_HELPER_CHROME.sendMessageToBackground({
				type: 'saveSetting',
				data: setting
			}, setting => {
				resolve(setting);
			});
		});
	};

	const saveSettingByKey = (key, value)=>{
		return new Promise(resolve => {
			getSetting().then(setting => {
				setting[key] = value;
				saveSetting(setting).then(resolve);
			});
		});
	};

	window.TAPD_HELPER_CHROME = {
		getBackgroundPage: getBackgroundPage,
		sendMessageToContent: sendMessageToContent,
		getCurrentTabId: getCurrentTabId,
		onMessage: onMessage,
		sendMessageToBackground: sendMessageToBackground,
		getSetting: getSetting,
		saveSetting: saveSetting,
		saveSettingByKey: saveSettingByKey,
	};
})();