console.log('background run');
const SupportedExportFields = {
	id: 'ID',
	link: '链接',
	title: '工单标题',
	bug_type: '工单类型',
	content_text: '内容(纯文本)',
	create_at: '创建时间',
	status: '状态',
	comment_list: '评论列表'
};

const SettingKey = 'setting';

TAPD_HELPER_CHROME.onMessage((msgObj, _, sendResponse) => {
	if(!msgObj || !msgObj.type){
		console.error('Background message object require type field', msgObj);
		return;
	}
	console.info('Background message received', msgObj);

	switch(msgObj.type){
		case 'RemoteRequest':
			$.ajax({
				url: msgObj.url,
				type: 'POST',
				data: msgObj.data,
				dataType: msgObj.DataType || 'json'
			}).then(rsp => {
				debugger;
				sendResponse(rsp);
			}, err => {
				sendResponse(null, err || 'Request Fail');
			});
			break;

		case 'saveSetting':
			if(msgObj.key){
				let orgSetting = JSON.parse(localStorage.getItem(SettingKey) || '{}');
				orgSetting[msgObj.key] = msgObj.data;
				localStorage.setItem(SettingKey, JSON.stringify(orgSetting));
				sendResponse(orgSetting);
			} else {
				localStorage.setItem(SettingKey, JSON.stringify(msgObj.data || ''));
				sendResponse(msgObj.data);
			}
			break;

		case 'getSetting':
			let str = localStorage.getItem(SettingKey);
			sendResponse(str ? JSON.parse(str) : {});
			break;

		case 'getExportFields':
			let orgSetting = JSON.parse(localStorage.getItem(SettingKey) || '{}');
			if(!orgSetting.export_fields || !orgSetting.export_fields.length){
				sendResponse(SupportedExportFields);
			} else {
				let ret = {};
				orgSetting.export_fields.forEach(field=>{
					ret[field] = SupportedExportFields[field];
				});
				sendResponse(SupportedExportFields);
			}
			break;

		case 'getSupportedExportFields':
			sendResponse(SupportedExportFields);
			break;


		default:
			throw `No msgObj.type:${msgObj.type} handler found.`;
	}
});