(function(){
	console.log('content script running');
	const WORKSPACE_ID = /tapd\.cn\/(\w+)\//.exec(location.href)[1];
	const ONE_DAY = 86400;
	const ONE_HOUR = 3600;
	const ONE_MIN = 60;

	let _CACHE_ = {};
	let cache = (key, fetcher)=>{
		return new Promise(resolve => {
			if(_CACHE_[key]){
				console.info('Cache hit', key);
				return resolve(_CACHE_[key]);
			}
			fetcher().then(rsp=>{
				_CACHE_[key] = rsp;
				resolve(_CACHE_[key]);
			});
		});
	};

	const num_pad_left = (num)=>{
		if(num < 10){
			return '0'+num;
		}
		return num;
	};

	const prettyTimeRange = (misec) => {
		let seconds = misec/1000;
		let str = [];
		if(seconds > ONE_DAY){
			let d = Math.floor(seconds / ONE_DAY);
			str.push(`${d}天`);
			seconds -= d * ONE_DAY;
		}
		if(seconds > ONE_HOUR){
			let h = Math.floor(seconds / ONE_HOUR);
			str.push(`${h}小时`);
			seconds -= h * ONE_HOUR;
		}
		if(seconds > ONE_MIN){
			let m = Math.floor(seconds / ONE_MIN);
			str.push(`${m}分钟`);
			seconds -= m * seconds;
		}
		return str.join(' ');
	};

	const escapeHtml = (str = '')=>{
		return str.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g,'&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;');
	};

	/**
	 * @param {Date} date_obj
	 * @param fmt
	 */
	const formatDate = (date_obj, fmt) => {
		let pt = {
			'Y': date_obj.getUTCFullYear(),
			'm': num_pad_left(date_obj.getMonth() + 1),
			'd': num_pad_left(date_obj.getUTCDate()),
			'H': num_pad_left(date_obj.getUTCHours()),
			'i': num_pad_left(date_obj.getUTCMinutes()),
			's': num_pad_left(date_obj.getUTCSeconds()),
		};

		let ret = '';
		for(let i=0; i<fmt.length; i++){
			if(pt[fmt[i]]){
				ret += pt[fmt[i]];
			} else {
				ret += fmt[i];
			}
		}
		return ret;
	};

	const STATUS_ORDERS = [
		'待评估', '已核实', '处理中', '已验证', '待回电', '已解决', '已关闭', '已拒绝',
		'已转需求', '评审中', '待上线', '拒绝需求'
	];

	const calcIndex = (status_text)=>{
		for(let i=0; i<STATUS_ORDERS.length; i++){
			if(status_text.indexOf(STATUS_ORDERS[i]) >= 0){
				return i;
			}
		}
		return STATUS_ORDERS.length;
	};

	const inBugListPage = () => {
		return WORKSPACE_ID && location.href.indexOf('bugtrace/bugreports') > 0;
	};

	const getBugTotalCount = () => {
		let $filter_result_cnt = $('#filter-result-count');
		let $all_bug_cnt = $('#all_bug_count');
		let cnt = $filter_result_cnt.size() ? $filter_result_cnt.html() : $all_bug_cnt.html();
		return parseInt(cnt, 10);
	};

	const getBugTotalPage = () => {
		let ph = $('#simple_pager_div .current-page').html();
		if(!ph){
			return 1;
		}
		return parseInt(ph.split('/')[1], 10);
	};

	/**
	 * 获取bug完成评估时间
	 * @param bug
	 * @param change_list
	 */
	const getBugFinAssessTime = (bug, change_list)=>{
		let start_time = getBugStartTime(change_list);
		if(!start_time){
			return null;
		}

		let time = null;
		for(let i=0; i<change_list.length; i++){
			if(change_list[i].type === '状态' && change_list[i].after.indexOf('待评估') >= 0){ //最后一次完成评估时间为准
				time = change_list[i].datetime;
				break;
			}
		}
		if(!time){
			return null;
		}
		return (Date.parse(time) - Date.parse(start_time))/1000;
	};

	const getBugFinTime = (bug, change_list)=>{
		let start_time = getBugStartTime(change_list);
		if(!start_time){
			console.warn('no start time resolved', change_list);
			return null;
		}
		if(bug.status.indexOf('关闭') < 0){
			return null;
		}
		let time = null;
		for(let i = 0; i < change_list.length; i++){
			if(change_list[i].type === '状态' && change_list[i].after.indexOf('已关闭') >= 0){ //最后一次完成评估时间为准
				time = change_list[i].datetime;
				break;
			}
		}
		if(!time){
			return null;
		}
		return (Date.parse(time) - Date.parse(start_time)) / 1000;
	};

	const getBugStartTime = (change_list)=>{
		if(!change_list.length){
			return null;
		}
		return change_list[change_list.length-1].datetime;
	};

	const copyHtml = (html)=>{
		// Create container for the HTML
		// [1]
		let container = document.createElement('div');
		container.innerHTML = html;

		// Hide element
		// [2]
		container.style.position = 'fixed';
		container.style.pointerEvents = 'none';
		container.style.opacity = 0;

		// Detect all style sheets of the page
		let activeSheets = Array.prototype.slice.call(document.styleSheets)
			.filter(function(sheet){
				return !sheet.disabled
			});

		// Mount the iframe to the DOM to make `contentWindow` available
		// [3]
		document.body.appendChild(container);

		// Copy to clipboard
		// [4]
		window.getSelection().removeAllRanges();

		let range = document.createRange();
		range.selectNode(container);
		window.getSelection().addRange(range);

		// [5.1]
		document.execCommand('copy');

		// [5.2]
		for(let i = 0; i < activeSheets.length; i++) activeSheets[i].disabled = true

		// [5.3]
		document.execCommand('copy');

		// [5.4]
		for(let i = 0; i < activeSheets.length; i++) activeSheets[i].disabled = false

		// Remove the iframe
		// [6]
		document.body.removeChild(container)
	};

	const get_bug_page_size = ()=>{
		let ph = $('#num-per-page .current').html();
		if(!ph){
			return 0;
		}
		return parseInt(ph, 10);
	};

	const getBugSummaryInfo = ()=>{
		return {
			total: getBugTotalCount(),
			page: getBugTotalPage(),
			page_size: get_bug_page_size(),
		}
	};

	const getPageUrl = (page = 1) => {
		let url = location.href;
		if(url.indexOf("&page=") <= 0){
			return url + (url.indexOf('?') >= 0 ? '&' : '?') + `page=${page}`;
		}
		return url.replace(/(&page=)\d+/i, "$1" + page);
	};

	const resolve_bug_info = (html)=>{
		let tmp = /var\s+default_value\s*=\s*(.*)/i.exec(html);
		let a;
		try {
			eval(`a = ${tmp[1]};`);
		} catch(err){
			console.error(err);
		}
		return a;
	};

	const query_selector = (html, selector)=>{
		let $ret;
		let $nodes = $(html);
		$nodes.each(function(){
			let $tmp = $(this).find(selector);
			if($tmp.size()){
				$ret = $tmp;
				return false;
			}
		});
		return $ret;
	};

	const getInfoUrl = (bug_id) => {
		return `https://www.tapd.cn/${WORKSPACE_ID}/bugtrace/bugs/view?bug_id=${bug_id}`;
	};

	const loadPage = (url) => {
		return new Promise((resolve, reject) => {
			console.log('loading page', url);
			fetch(url)
				.then(data => data.text())
				.then(html => {
					console.info('page loaded, html size:'+html.length);
					resolve(html);
				});
		});
	};

	const resolveFlowInfo = ($body, to_status_text) => {
		let info = [];
		$('#comments .field-active').get().reverse().each(function(){
			let html = $(this).html();
			if(html.indexOf('在流转') > 0 && html.indexOf('-' + to_status_text) > 0){
				info = [$(this).parent().find('.field-time').text(), $(this).parent().find('.field-author').text()];
				return false;
			}
		});
		return info;
	};

	const getChangeList = (bug_id) => {
		let url = `https://www.tapd.cn/${WORKSPACE_ID}/bugtrace/bugs/changes_list?perpage=100&bug_id=${bug_id}&time=` + (new Date()).getTime();
		return new Promise((resolve, reject) => {
			console.log('start fetch change list', url);
			let xhr = new XMLHttpRequest();
			xhr.open('GET', url);
			xhr.send();
			xhr.onload = function(e){
				if(xhr.status === 200){
					let changes = [];
					let $html = $(xhr.responseText);
					$html.find('.table-history>tbody>tr').each(function(){
						let datetime = $(this).find('td').eq(1).text();

						$('table tbody tr', this).each(function(){
							let type = $(this).find('td').eq(0).text().trim();
							let bf = $(this).find('td').eq(1).text();
							let af = $(this).find('td').eq(2).text();
							changes.push({
								datetime: datetime,
								date: formatDate(new Date(Date.parse(datetime)),'Y-m-d'),
								type: type,
								before: bf,
								after: af
							});
						});
					});
					resolve(changes);
				}else{
					reject(`get change list fail: ${xhr.statusText} [${xhr.status}]`);
					console.error('get change list fail:', e);
				}
			};
		});
	};

	const getCommentList = ($comment_contents) => {
		let comments = [];
		$comment_contents.each(function(){
			comments.push({
				author:$.trim($(this).find('.field-author').text()),
				time: $.trim($(this).find('.field-time').text()),
				content: $.trim($(this).find('.editor-content').text())
			});
		});
		return comments;
	};

	const getBugList = (page) => {
		return new Promise((resolve, reject) => {
			loadPage(getPageUrl(page)).then(html => {
				let bug_list = [];
				let $trs = query_selector(html, '#bug_list_content>tbody>tr');
				if(!$trs){
					reject('No dom node queried');
					return;
				}

				let left_length = $trs.size();
				let check = () => {
					if(left_length > 0){
						return;
					}
					console.log('bug list loaded', bug_list);
					resolve(bug_list);
				};

				$trs.each(function(){
					let title = $.trim($('a.namecol', this).text());
					let href = $('a.namecol', this).attr('href');
					let bug_id = $(this).attr('bug_id');
					let current_owner = $(this).find('td[data-editable-field=current_owner] span').attr('title');
					let status = $(this).find(`#bug_workflow_${bug_id}`).attr('title');
					status = status.replace(/（[^）]+）/, '');

					loadPage(getInfoUrl(bug_id)).then(html => {
						let $cmt_wrap = query_selector(html, '#comment_area');
						if(!$cmt_wrap){
							reject('No dom node queried');
							return;
						}
						let comments = getCommentList($cmt_wrap.find('.comment_content'));
						console.log('bug comments got', bug_id, comments.length);

						let info = resolve_bug_info(html);
						let content_html = info.description;
						let content_text = info.description;
						if(!content_html){
							reject('no description html found');
							return false;
						}

						let bug = {
							id: bug_id,
							title: title,
							link: href,
							create_at: info.created,
							content_text: content_text,
							content_html: content_html,
							owner: current_owner,
							comments: comments,
							status: status
						};
						console.info('bug resolved', bug);
						bug_list.push(bug);
						left_length--;
						check();
					});
				});
			}, reject);
		});
	};

	const getBugChangeListCache = (bug_id)=>{
		return TAPD_HELPER.cache(bug_id, ()=>{
			return new Promise((resolve, reject) => {
				TAPD_HELPER.getChangeList(bug_id).then(change_list=>{
					console.log('change list for bug', bug_id, change_list);
					resolve(change_list);
				});
			});
		})
	};

	const WxWorkMsgType = {
		Markdown: "markdown",
		Text: "text",
		Image: "image"
	};

	const sendToWxWorkRobot = (web_hook_url,
	    content = {type: WxWorkMsgType.Markdown, content: ""},
	    mentions = {user_id_list: [], mobile_list: []}) => {
		chrome.extension.sendMessage({
			RemoteRequest:{
				url: web_hook_url,
				data: content
			}
		}, (rsp, err)=>{
			console.warn(rsp, err);
		});
	};

	window.TAPD_HELPER = {
		ONE_DAY: ONE_DAY,
		ONE_HOUR: ONE_HOUR,
		ONE_MIN: ONE_MIN,
		cache: cache,
		copyHtml: copyHtml,
		formatDate: formatDate,
		calcIndex: calcIndex,
		inBugListPage: inBugListPage,
		getBugTotalCount: getBugTotalCount,
		getBugFinAssessTime: getBugFinAssessTime,
		getBugFinTime: getBugFinTime,
		getBugTotalPage: getBugTotalPage,
		getBugSummaryInfo: getBugSummaryInfo,
		getPageUrl: getPageUrl,
		getInfoUrl: getInfoUrl,
		loadPage: loadPage,
		getFlowInfo: resolveFlowInfo,
		getChangeList: getChangeList,
		getBugChangeListCache: getBugChangeListCache,
		getBugList: getBugList,
		prettyTimeRange: prettyTimeRange,
		escapeHtml: escapeHtml,
		sendToWxWorkRobot: sendToWxWorkRobot
	};
})();