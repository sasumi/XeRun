let $pg_wrap = $('#analyze-progress-wrap');
let $progress = $pg_wrap.find('progress');
let $pg_tip = $pg_wrap.find('.progress-tip');
let $start_btn = $('#start-analyze-btn');
let $start_wrap = $('#start-analyze-wrap');
let $page_sum = $('#page-sum');

let PageSum = null;
sendMessageToContentScript({cmd: 'get_bug_summary_info'}, function(response){
	console.log('来自content的回复：', response);
	$page_sum.html(`当前页面工单 <b>${response.total}</b> 条，<b>${response.page}</b>页，每页 <b>${response.page_size}</b>条`);
	$start_wrap.show();
	PageSum = response;
});

$start_btn.click(function(){
	start_analyze(0);
});

function start_analyze(item_index){
	$pg_wrap.show();
	$pg_tip.html('正在分析工单...');
	page = Math.ceil(item_index / PageSum.page_size);
}

function sendMessageToContentScript(message, callback){
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
		chrome.tabs.sendMessage(tabs[0].id, message, function(response){
			if(callback){
				callback(response)
			}
		});
	});
}

function getCurrentTabId(callback){
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
		if(callback) callback(tabs.length ? tabs[0].id : null);
	});
}