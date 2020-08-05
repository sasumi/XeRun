let $save_btn = $('#save-setting-btn');
let $export_fields = $('#export-fields');
let $report_fields = $('#report-fields');
let FromPopup = location.hash.indexOf('FromPopup') >= 0;

$('html').addClass(FromPopup ? 'FromPopup' : 'NewWindow');

TAPD_HELPER_CHROME.getSetting().then(setting => {
	let checked_fields = setting.export_fields || [];
	TAPD_HELPER_CHROME.sendMessageToBackground({type: 'getSupportedExportFields'}, SupportedExportFields => {
		let html = '';
		for(let i in SupportedExportFields){
			let checked = checked_fields.includes(i);
			html += `<li><label><input ${checked ? 'checked' : ''} type="checkbox" value="${i}"/> ${SupportedExportFields[i]}</label>`
		}
		$export_fields.html(html);
	});
});

$('body').live('input', 'change', () => {
	$save_btn.removeClass('btn-disabled');
});

$save_btn.click(()=>{
	if($save_btn.hasClass('btn-disabled')){
		return;
	}
	save_setting(()=>{
		$save_btn.addClass('btn-disabled');
		alert('保存成功');
	});
});

$('.ef-select-all').click(function(){
	$(this).parent().find('input').attr('checked', 'checked').triggerHandler('change');
});

$('.ef-select-none').click(function(){
	$(this).parent().find('input').attr('checked', false).triggerHandler('change');
});

function save_setting(onsuccess){
	let checked_fields = [];
	$export_fields.find('input:checked').each(function(){
		checked_fields.push(this.value);
	});

	let report_fields = [];
	$report_fields.find('input:checked').each(function(){
		report_fields.push(this.value);
	});

	let setting = {
		export_fields: checked_fields,
		web_hook_url: $.trim($('#web_hook_url').val()),
		report_fields: report_fields
	};

	TAPD_HELPER_CHROME.sendMessageToBackground({
		type: 'saveSetting',
		data: setting
	}, setting => {
		onsuccess(setting);
	});
}