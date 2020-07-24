(function(){
	const SUM_INFO = TAPD_HELPER.getBugSummaryInfo();
	const CLASS_PREFIX = 'tapd-free-man';

	let panel_html = `<dialog class="${CLASS_PREFIX}-panel" style="display:none;">
					<div class="${CLASS_PREFIX}-panel-title">统计结果</div>
					<div class="${CLASS_PREFIX}-panel-close-btn"></div>
					<div class="${CLASS_PREFIX}-panel-content">
						<div class="${CLASS_PREFIX}">
							<div class="${CLASS_PREFIX}-result-op-wrap" style="display:none;">
								<span>设置</span>
								<span class="${CLASS_PREFIX}-send-to-robot btn">发送到机器人🤖</span>
							</div>
							<div class="${CLASS_PREFIX}-sum">当前条件查询工单 ${SUM_INFO.total} 条，共 ${SUM_INFO.page} 页，每页 ${SUM_INFO.page_size} 条。</div>
							<div class="${CLASS_PREFIX}-pg-wrap" style="display:none;">
								<div class="${CLASS_PREFIX}-pg-tip"></div>
							</div>
							<div class="${CLASS_PREFIX}-op-wrap">
								<span class="${CLASS_PREFIX}-btn btn"><span>开始分析</span></span>
							</div>
							<ul class="${CLASS_PREFIX}-status-sum" style="display:none"></ul>
							<div class="${CLASS_PREFIX}-flow-chart" style="display:none; height:200px;"></div>
							<div class="${CLASS_PREFIX}-sub-chart-wrap" style="display:none;">
							</div>
							<table class="${CLASS_PREFIX}-table ${CLASS_PREFIX}-lazy-trans-top" style="display:none">
								<caption>未扭转工单排名</caption>
								<tbody></tbody>
							</table>
							<table class="${CLASS_PREFIX}-table ${CLASS_PREFIX}-unclosed-top" style="display:none;">
								<caption>未关闭工单排名</caption>
								<tbody></tbody>
							</table>
						</div>
					</div>
				</dialog>`;

	let $panel = $(panel_html).appendTo('body');
	let $sum_tip = $panel.find(`.${CLASS_PREFIX}-sum`);
	let $start_btn = $panel.find(`.${CLASS_PREFIX}-btn`);
	let $op_wrap = $panel.find(`.${CLASS_PREFIX}-op-wrap`);
	let $pg_wrap = $panel.find(`.${CLASS_PREFIX}-pg-wrap`);
	let $pg_tip = $pg_wrap.find(`.${CLASS_PREFIX}-pg-tip`);
	let $status_sum = $panel.find(`.${CLASS_PREFIX}-status-sum`);
	let $lazy_trans_top = $panel.find(`.${CLASS_PREFIX}-lazy-trans-top`);
	let $unclosed_top = $panel.find(`.${CLASS_PREFIX}-unclosed-top`);
	let $sub_charts = $panel.find(`.${CLASS_PREFIX}-sub-chart-wrap`);
	let $send_to_robot_btn = $panel.find(`.${CLASS_PREFIX}-send-to-robot`);

	let current_page = 1;
	let stop_flag = false;
	let total_bug_groups = {};
	let total_change_groups = {};

	let reset = ()=>{
		current_page = 1;
		stop_flag = false;
		total_bug_groups = {};
		total_change_groups = {};
	};

	$panel.find(`.${CLASS_PREFIX}-panel-close-btn`).click(() => {
		stop();
		$panel && $panel.hide();
	});

	TAPD_HELPER_CHROME.onMessage(function(request, sender, sendResponse){
		console.log('content on message', request);
		if(request === 'TAPD_START_ANALLY'){
			if(show_panel()){
				start();
			}
		}
		sendResponse();
	});

	$start_btn.click(start);

	$send_to_robot_btn.click(()=>{
		TAPD_HELPER.sendToWxWorkRobot()
	});

	function start(){
		$sum_tip.hide();
		$pg_wrap.show();
		$start_btn.addClass('.disabled');
		if($start_btn.text() === '开始分析'){
			current_page = 1;
			stop_flag = false;
			$status_sum.html('');
			analyze_page();
		}
		else if($start_btn.text() === '重新分析'){
			location.reload();
		}
		else {
			$start_btn.html('<span>重新分析</span>');
			stop_flag = true;
		}
	}

	function stop(){
		reset();
		stop_flag = true;
	}

	function add_status_sum(bug){
		$status_sum.show();
		let found = false;
		$status_sum.find('li').each(function(){
			let $li = $(this);
			if($li.data('status') === bug.status){
				let cnt = parseInt($li.data('cnt'), 10) + 1;
				$li.find('.cnt').html(cnt);
				$li.data('cnt', cnt);
				found = true;
				return false;
			}
		});
		if(!found){
			let idx = TAPD_HELPER.calcIndex(bug.status);
			let html = `<li data-cnt="1" data-status="${bug.status}"><span class="cnt">1</span><span class="status">${bug.status}</span></li>`;
			let $last = null;
			$status_sum.find('li').each(function(){
				let li_status = $(this).data('status');
				if(TAPD_HELPER.calcIndex(li_status) >= idx){
					return false;
				}
				$last = $(this);
			});
			if($last){
				$(html).insertAfter($last);
			} else {
				$(html).prependTo($status_sum);
			}
		}
	}

	function name_list(name_str){
		let ns = name_str.split(';');
		let tmp = [];
		ns.forEach(n=>{
			n = $.trim(n);
			if(n){
				tmp.push(`<span class="n">${TAPD_HELPER.escapeHtml(n)}</span>`);
			}
		});
		return tmp.join('');
	}

	function add_lazy_trans_top(bug, change_list){
		if(bug.status !== '待评估'){
			return;
		}
		let last_status_time = 0;
		change_list.forEach(change=>{
			if(change.type === '状态'){
				last_status_time = change.datetime;
				return false;
			}
		});

		if(!last_status_time){
			return;
		}

		let offset = (new Date().getTime()) -  Date.parse(last_status_time);
		let found = false;
		let html = `<tr data-offset="${offset}">
						<td><a href="${bug.link}" target="_blank" class="ti" title="${TAPD_HELPER.escapeHtml(bug.title)}">${TAPD_HELPER.escapeHtml(bug.title)}</a></td>
						<td>${name_list(bug.owner)}</td>
						<td class="nowrap">${bug.status}</td>
						<td class="nowrap">${TAPD_HELPER.prettyTimeRange(offset)}</td>
					</tr>`;
		$lazy_trans_top.find('tr').each(function(){
			if($(this).data('offset') < offset){
				$(html).insertBefore(this);
				found = true;
				return false;
			}
		});
		if(!found){
			$(html).appendTo($lazy_trans_top.find('tbody'));
		}
		$lazy_trans_top.show();
	}

	function add_unclosed_top(bug, change_list){
		let close_status_list = ['已关闭', '已转需求', '已拒绝', '待回电'];
		if(!change_list.length){
			console.warn('no change list found', bug);
			return;
		}
		if(close_status_list.indexOf(bug.status) >= 0){
			return;
		}
		let create_time = change_list[0].datetime;

		let offset = (new Date().getTime()) -  Date.parse(create_time);
		let found = false;
		let html = `<tr data-offset="${offset}">
						<td><a href="${bug.link}" title="${TAPD_HELPER.escapeHtml(bug.title)}" target="_blank" class="ti">${TAPD_HELPER.escapeHtml(bug.title)}</a></td>
						<td>${name_list(bug.owner)}</td>
						<td class="nowrap">${bug.status}</td>
						<td class="nowrap">${TAPD_HELPER.prettyTimeRange(offset)}</td>
					</tr>`;
		$unclosed_top.find('tr').each(function(){
			if($(this).data('offset') < offset){
				$(html).insertBefore(this);
				found = true;
				return false;
			}
		});
		if(!found){
			$(html).appendTo($unclosed_top.find('tbody'));
		}
		$unclosed_top.show();
	}

	function analyze_page(){
		if(current_page > SUM_INFO.page){
			$pg_tip.html(`分析完成`);
			$start_btn.find('span').html('<span>重新分析</span>');
			return;
		}
		if(stop_flag){
			stop_flag = false;
			return;
		}
		$start_btn.html('<span>停止分析</span>');
		let idx = (current_page-1)*SUM_INFO.page_size;
		$pg_tip.html(`[${idx}/${SUM_INFO.total}] 正在分析第 ${current_page} 页数据...`);

		console.info('start analyze page');
		TAPD_HELPER.cache('bug_list_'+current_page, ()=>{
			return TAPD_HELPER.getBugList(current_page);
		}).then(bug_list=>{
			console.info('bug list got:', bug_list.length);
			bug_list.forEach(bug=>{
				total_bug_groups[bug.id] = bug;
			});
			let pt = bug_list.length;
			let fd = ()=>{
				let bug = bug_list.shift();
				if(!bug || stop_flag){
					current_page++;
					analyze_page();
					return;
				}
				add_status_sum(bug);
				let idx = (current_page-1)*SUM_INFO.page_size + (pt-bug_list.length);
				$pg_tip.html(`[${idx}/${SUM_INFO.total}] 正在获取工单信息：<a href="${bug.link}" target="_blank">${bug.title}</a>`);
				TAPD_HELPER.getBugChangeListCache(bug.id).then(change_list=>{
					total_change_groups[bug.id] = change_list;
					update_flow_charts();
					update_sub_charts();
					add_lazy_trans_top(bug, change_list);
					add_unclosed_top(bug, change_list);
					fd();
				});
			};
			fd();
		});
	}

	const show_panel = () => {
		let show_flag = !$panel.is(':visible');
		$panel.show();
		return show_flag;
	};

	const update_sub_charts = ()=>{
		//24小时完成率
		let fin_ass_in_24_count = 0,
			fin_ass_in_48_count = 0,
			fin_in_120_count = 0,
			fin_in_240_count = 0;

		let total = 0;
		for(let bug_id in total_change_groups){
			total++;
			let bug = total_bug_groups[bug_id];
			let changes = total_change_groups[bug_id];
			if(TAPD_HELPER.getBugFinAssessTime(bug, changes) <= TAPD_HELPER.ONE_DAY){
				fin_ass_in_24_count++;
			}
			if(TAPD_HELPER.getBugFinAssessTime(bug, changes) <= (TAPD_HELPER.ONE_DAY*2)){
				fin_ass_in_48_count++;
			}
			if(TAPD_HELPER.getBugFinTime(bug, changes) !== null && TAPD_HELPER.getBugFinTime(bug, changes) <= (TAPD_HELPER.ONE_DAY*5)){
				fin_in_120_count++;
			}
			if(TAPD_HELPER.getBugFinTime(bug, changes) !== null && TAPD_HELPER.getBugFinTime(bug, changes) <= (TAPD_HELPER.ONE_DAY*10)){
				fin_in_240_count++;
			}
		}

		let html = '';
		let makePercent = (percent,title)=>`<span class="${CLASS_PREFIX}-sub-chart">
				<s>${percent}%</s>
				<span>${title}</span>
				<progress max="100" value="${percent}"></progress>
				</span>`;
		html += makePercent(Math.round(100 * fin_ass_in_24_count / total), '24小时完成评估');
		html += makePercent(Math.round(100 * fin_ass_in_48_count / total), '48小时完成评估');
		html += makePercent(Math.round(100 * fin_in_120_count / total), '120小时工单关闭');
		html += makePercent(Math.round(100 * fin_in_240_count / total), '240小时工单关闭');
		$sub_charts.html(html).show();
	};

	const update_flow_charts = () => {
		//draw flow chart
		let $chart = $panel.find(`.${CLASS_PREFIX}-flow-chart`).show();
		let date_serials = [];
		let status_groups = {}; // status1->date1= 1, date1->status2 = 1,
		for(let bug_id in total_change_groups){
			let changes = total_change_groups[bug_id];
			let tmp = {};
			changes.forEach(change=>{
				if(change.type === '状态' && !tmp[change.date]){ //每个工单，每天只统计最后一次变更的状态
					date_serials.push(TAPD_HELPER.formatDate(new Date(Date.parse(change.date)), 'm/d'));
					tmp[change.date] = true;
					if(!status_groups[change.after]){
						status_groups[change.after] = {[change.date]:1};
					} else {
						status_groups[change.after][change.date] = (status_groups[change.after][change.date] || 0)+1;
					}
				}
			});
		}

		date_serials = date_serials.filter((value, index, self)=>{return self.indexOf(value) === index;});
		date_serials = date_serials.sort((v1, v2)=>{
			let t1 = Date.parse(v1);
			let t2 = Date.parse(v2);
			if(t1 === t2){
				return 0;
			}
			return t1 > t2 ? 1 : -1;
		});

		let series = [];
		let status_categories = [];
		for(let status in status_groups){
			status_categories.push(status.replace(/（[^）]+）/, ''));
			let dm = status_groups[status];
			let tmp = [];
			for(let date in dm){
				tmp.push({date:date, count:dm[date]});
			}
			tmp = tmp.sort((v1,v2)=>{
				let t1 = Date.parse(v1.date);
				let t2 = Date.parse(v2.date);
				if(t1 === t2){
					return 0;
				}
				return t1 > t2 ? 1 : -1;
			});
			let count_serials = [];
			tmp.forEach(obj=>{
				count_serials.push(obj.count);
			});
			series.push({
				name: status.replace(/（[^）]+）/, ''),
				type: 'line',
				stack: '总量',
				areaStyle: [],
				data: count_serials
			});
		}

		let myChart = echarts.init($chart[0]);
		let option = {
			title: {
				text: ''
			},
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					type: 'cross',
					label: {
						backgroundColor: '#6a7985'
					}
				}
			},
			legend: {
				data: status_categories
			},
			toolbox: {
				feature: {
					saveAsImage: {}
				}
			},
			grid: {
				left: '3%',
				right: '4%',
				bottom: '3%',
				containLabel: true
			},
			xAxis: [
				{
					type: 'category',
					boundaryGap: false,
					data: date_serials
				}
			],
			yAxis: [
				{
					type: 'value'
				}
			],
			series: series
		};
		myChart.setOption(option);
	};
})();