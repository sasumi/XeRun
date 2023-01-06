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
			if (tabId === id && changeInfo.status && changeInfo.status === 'complete') {
				console.log('complete');
				onComplete(id);
			}
		});
	});
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (!request || !request.action) {
		throw "no action found";
	}

	debugger;
	console.log('onMessage', request.action, request);

	switch (request.action) {
		case 'openTabOnce':
			openTabOnce(request.url, () => {
				console.log('[bg] openTabOnce sendResponse');
				sendResponse();
			});
			return true;
		case 'openTab':
			openTab(request.url, (tabId) => {
				console.log('[bg] openTab sendResponse', tabId);
				sendResponse(tabId);
			});
			return true;

		case 'setLocal':
			chrome.storage.local.set({[request.key]:request.data}).then(() => {
				console.log('set local success');
				sendResponse();
			});
			return true;

		case 'getLocal':
			chrome.storage.local.get([request.key]).then(data => {
				sendResponse(data[request.key]);
			});
			return true;
		case 'removeLocal':
			chrome.storage.local.remove([request.key]).then(() => {
				sendResponse();
			});
			return true;
		default:
			throw "action no support yet:" + request.action;
	}
});