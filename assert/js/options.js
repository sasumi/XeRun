let $save_btn = $('#save-setting-btn');
let $export_fields = $('#export-fields');

const save_checked_fields = (onsuccess)=>{
	let checked_fields = [];
	$export_fields.find('input:checked').each(function(){
		checked_fields.push(this.value);
	});
	TAPD_HELPER_CHROME.sendMessageToBackground({
		type: 'saveSetting',
		key: 'export_fields',
		data: checked_fields
	}, setting => {
		onsuccess(setting);
	});
};

TAPD_HELPER_CHROME.sendMessageToBackground({type:'getSetting'}, function(setting){
	let checked_fields = setting.export_fields || [];
	TAPD_HELPER_CHROME.sendMessageToBackground({type:'getSupportedExportFields'}, SupportedExportFields=>{
		let html = '';
		for(let i in SupportedExportFields){
			let checked = checked_fields.includes(i);
			html += `<li><label><input ${checked ? 'checked':''} type="checkbox" value="${i}"/> ${SupportedExportFields[i]}</label>`
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
	save_checked_fields(()=>{
		$save_btn.addClass('btn-disabled');
		alert('保存成功');
	});
});

$('#ef-select-all').click(function(){
	$export_fields.find('input').attr('checked', 'checked').triggerHandler('change');
});

$('#ef-select-none').click(function(){
	$export_fields.find('input').attr('checked', false).triggerHandler('change');;
});