console.log('background started');

const openTabOnce = (url, onComplete, delayTimeout = 2000) => {
	openTab(url, (tabId) => {
		setTimeout(() => {
			chrome.tabs.remove(tabId);
			onComplete();
		}, delayTimeout);
	});
};

const openTab = (url, onComplete) => {
	chrome.tabs.create({
		active: false,
		url: url
	}, tab => {
		console.log('tab.id', tab.id);
		let id = tab.id;
		chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
			if(tabId === id && changeInfo.status && changeInfo.status === 'complete'){
				console.log('complete');
				onComplete(id);
			}
		});
	});
}

const openWinBackground = (winId, url, onOpen) => {
	console.log(openWinBackground, winId, url, onOpen);
	if(winId){
		console.log('open in specified winId');
		chrome.windows.get(winId).then(win => {
			chrome.tabs.create({
				windowId: winId,
				active: true,
				url: url
			}, tab => {
				console.log('tab.id', tab.id);
				onOpen(winId);
			});
		}, () => {
			console.warn('原来的窗口ID失效了。');
			chrome.windows.create({
				url: url,
				focused: true,
				type: 'normal',
			}).then(win => {
				console.log(win.id);
				onOpen(win.id);
			});
		});
	}else{
		console.log('open in new win');
		chrome.windows.create({
			url: url,
			focused: false,
			type: 'normal',
		}).then(win => {
			console.log(win.id);
			onOpen(win.id);
		});
	}
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if(!message || !message.action){
		throw "no action found";
	}

	console.log('onMessage', message.action, message);
	switch(message.action){
		case 'openTabOnce':
			openTabOnce(message.url, () => {
				console.log('[bg] openTabOnce sendResponse');
				sendResponse();
			});
			return true;
		case 'openTab':
			openTab(message.url, (tabId) => {
				console.log('[bg] openTab sendResponse', tabId);
				sendResponse(tabId);
			});
			return true;

		case 'getWindowID':
			sendResponse(sender.tab.windowId);
			return true;

		case 'openNewWindowBackground':
			openWinBackground(message.windowId, message.url, (winId) => {
				sendResponse(winId);
			});
			return true;

		case 'setLocal':
			chrome.storage.local.set({[message.key]: message.data}).then(() => {
				console.log('set local success');
				sendResponse();
			});
			return true;

		case 'getLocal':
			chrome.storage.local.get([message.key]).then(data => {
				sendResponse(data[message.key]);
			});
			return true;
		case 'removeLocal':
			chrome.storage.local.remove([message.key]).then(() => {
				sendResponse();
			});
			return true;
		default:
			throw "action no support yet:" + message.action;
	}
});