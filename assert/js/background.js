console.log('background run');
TAPD_HELPER_CHROME.onMessage(function(msgObj, _, sendResponse){
	if(msgObj.RemoteRequest){
		let req = msgObj.RemoteRequest;
		$.ajax({
			url: req.url,
			type: 'POST',
			data: req.data,
			dataType: req.DataType || 'json'
		}).then(rsp => {
			debugger;
			sendResponse(rsp);
		}, err => {
			sendResponse(null, err || 'Request Fail');
		});
	}
});