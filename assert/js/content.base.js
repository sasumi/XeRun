(function(){
	console.log('content script running');
	const WORKSPACE_ID = /tapd\.cn\/(\w+)\//.exec(location.href)[1];

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

	/**
	 * @param {Date} date_obj
	 * @param fmt
	 */
	const date_format = (date_obj, fmt) => {
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

	const calc_idx = (status_text)=>{
		for(let i=0; i<STATUS_ORDERS.length; i++){
			if(status_text.indexOf(STATUS_ORDERS[i]) >= 0){
				return i;
			}
		}
		return STATUS_ORDERS.length;
	};

	const in_bug_list_page = () => {
		return WORKSPACE_ID && location.href.indexOf('bugtrace/bugreports') > 0;
	};

	const get_bug_total_count = () => {
		let $filter_result_cnt = $('#filter-result-count');
		let $all_bug_cnt = $('#all_bug_count');
		let cnt = $filter_result_cnt.size() ? $filter_result_cnt.html() : $all_bug_cnt.html();
		return parseInt(cnt, 10);
	};

	const get_bug_total_page = () => {
		let ph = $('#simple_pager_div .current-page').html();
		if(!ph){
			return 1;
		}
		return parseInt(ph.split('/')[1], 10);
	};

	const get_bug_page_size = ()=>{
		let ph = $('#num-per-page .current').html();
		if(!ph){
			return 0;
		}
		return parseInt(ph, 10);
	};

	const get_bug_summary_info = ()=>{
		return {
			total: get_bug_total_count(),
			page: get_bug_total_page(),
			page_size: get_bug_page_size(),
		}
	};

	const get_page_url = (page = 1) => {
		let url = location.href;
		if(url.indexOf("&page=") <= 0){
			return url + (url.indexOf('?') >= 0 ? '&' : '?') + `page=${page}`;
		}
		return url.replace(/(&page=)\d+/i, "$1" + page);
	};

	const get_info_url = (bug_id) => {
		return `://www.tapd.cn/${WORKSPACE_ID}/bugtrace/bugs/view?bug_id=${bug_id}`;
	};

	const load_page = (url) => {
		return new Promise((resolve, reject) => {
			let $iframe = $('<iframe>').appendTo('body');
			$iframe.css('border:none; width:2px; height:2px; overflow:hidden; position:absolute; top:0; left:0;');
			$iframe.on('load', () => {
				let win = $iframe[0].contentWindow;
				resolve([$(win.document.body), $iframe]);
			});
			$iframe.on('error', (err) => {
				reject(err);
			});
			$iframe.attr('src', url);
		});
	};

	const get_flow_info = ($body, to_status_text) => {
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

	const get_change_list = (bug_id) => {
		let url = `https://www.tapd.cn/${WORKSPACE_ID}/bugtrace/bugs/changes_list?perpage=100&bug_id=${bug_id}&time=` + (new Date()).getTime();
		return new Promise((resolve, reject) => {
			console.log('fetch change list', url);
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
								date: date_format(new Date(Date.parse(datetime)),'Y-m-d'),
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

	const get_bug_list = (page) => {
		return new Promise((resolve, reject) => {
			load_page(get_page_url(page)).then(param => {
				let bug_id_list = [];
				let [$body, $iframe] = param;
				$body.find('#bug_list_content>tbody>tr').each(function(){
					let title = $.trim($('a.namecol', this).text());
					let href = $('a.namecol', this).attr('href');
					let bug_id = $(this).attr('bug_id');
					let status = $(this).find(`#bug_workflow_${bug_id}`).attr('title');
						status = status.replace(/（[^）]+）/, '');
					bug_id_list.push({id:bug_id, title:title, link:href, status:status});
				});
				console.log('bug list found', bug_id_list);
				$iframe.remove();
				resolve(bug_id_list);
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

	window.TAPD_HELPER = {
		cache: cache,
		formatDate: date_format,
		calcIndex: calc_idx,
		inBugListPage: in_bug_list_page,
		getBugTotalCount: get_bug_total_count,
		getBugTotalPage: get_bug_total_page,
		getBugSummaryInfo: get_bug_summary_info,
		getPageUrl: get_page_url,
		getInfoUrl: get_info_url,
		loadPage: load_page,
		getFlowInfo: get_flow_info,
		getChangeList: get_change_list,
		getBugChangeListCache: getBugChangeListCache,
		getBugList: get_bug_list,
	};
})();