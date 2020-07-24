const LS_KEY = 'setting';
const TOAST_TIMEOUT = 1500;

let $save_btn = $('#save-setting-btn');
let $start_btn = $('#start-btn');
let $wh_input = $('#web_hook_url');
let $tabs = $('#tab li');
let $tab_contents = $('.tab-content');
let $toast;

$start_btn.click(function(){
	TAPD_HELPER_CHROME.sendMessageToContent('TAPD_START_ANALLY', (error)=>{
		if(!error){
			window.close();
		} else {
			console.error('TAPD_START_ANALLY', error);
		}
	});
});

$tabs.click(function(){
	$tabs.removeClass('active');
	$(this).addClass('active');
	$tab_contents.hide();
	$tab_contents.eq($(this).index()).show();
});

$save_btn.click(function(){
	save_setting({
		web_hook_url: $.trim($wh_input.val())
	});
	show_toast('保存成功');
});

let setting = read_setting();
$wh_input.val(setting.web_hook_url || '');

function save_setting(setting = {}){
	window.localStorage.setItem(LS_KEY, JSON.stringify(setting));
}

function read_setting(){
	let s = window.localStorage.getItem(LS_KEY);
	return s ? JSON.parse(s) : {};
}

function show_toast(msg, type='success'){
	if(!$toast){
		$toast = $(`<div id="toast" class="${type}"></div>`).appendTo('body');
	}
	$toast.html(msg).show();
	clearTimeout($toast.timer);
	$toast.timer = setTimeout(() => {
		$toast.hide();
	}, TOAST_TIMEOUT);
}