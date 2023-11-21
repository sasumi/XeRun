import {cutTxt, decodeBase64, encodeBase64, escapeAttr, escapeHtml, resolveUrls} from "./function.js";
import {
	ADMIN_HOST,
	COMMUNITY_PC_HOST,
	getResourceInfoUrl,
	H5_HOST,
	PC_HOST,
	resolveAppIds,
	resolveCommunityId,
	resolveResourceIdList,
	resolveUserIds,
	RESOURCE_TYPE_COMMUNITY,
	RESOURCE_TYPE_MAP,
	SYS_ADMIN,
	SYS_H5,
	SYS_PC
} from "./resource.js";

const DEFAULT_LINK_WORD_COUNT = 40;
export const SUPER_JUMP_KEY = 'SUPER_JUMP_URL';

export const COMMON_OPTIONS = {
	'通用': [
		{
			title: '页面选中内容智能识别',
			key: 'common.contentResolve',
			defaultValue: true
		}, {
			title: '鼠标中键智能打开新窗口',
			key: 'common.MidBtnNewWin',
			defaultValue: true
		}, {
			title: '链接点击智能打开新窗口',
			key: 'common.LinkClickNewWin',
			defaultValue: true
		},
	],
	'Coding': [{
		title: '工单内容直接显示(禁用折叠功能)',
		key: 'coding.showFullContent',
		defaultValue: true
	},
		{
			title: '工单内图片高度缩小为合适高度',
			key: 'coding.imgAutoAdjust',
			defaultValue: true
		},
		{
			title: '工单背景去除水印',
			key: 'coding.removeWatermark',
			defaultValue: true
		},
		{
			title: '工单快速导航(左右键快速切换上下一条)',
			key: 'coding.quickNav',
			defaultValue: false
		},
	],
	'腾讯文档': [{
		title: '去水印',
		key: 'txdoc.removeWatermark',
		defaultValue: true
	},],
	'XET管理台': [{
		title: '去水印',
		key: 'xet.removeWatermark',
		defaultValue: true
	},]
};

export const inCommonOption = key => {
	let matched = null;
	for(let groupTitle in COMMON_OPTIONS){
		COMMON_OPTIONS[groupTitle].forEach((opt) => {
			if(key === opt.key){
				matched = opt;
				return false;
			}
		});
	}
	return matched;
};

export const getCommonOptionSetting = (key) => {
	return new Promise((resolve, reject) => {
		let opt = inCommonOption(key);
		if(!opt){
			return reject('option key no in common');
		}
		getChromeStorageSync(key, opt.defaultValue).then(val => {
			resolve(val);
		});
	});
}

export const assertUrl = (id) => {
	return chrome.runtime.getURL('assets/' + id);
};

export const getPasteContent = () => {
	let currentActiveEl = document.activeElement;
	let input = document.createElement('input');
	input.style.cssText = 'display:block; width:1px; height:1px; position:absolute; left:0; bottom:0; opacity:0.1';
	document.body.appendChild(input);
	input.focus();
	document.execCommand('paste');
	input.parentNode.removeChild(input);
	currentActiveEl.focus();
	return input.value;
}

export const setBackgroundLocalStorage = (key, data) => {
	console.log('setBackgroundLocalStorage', key, data);
	if(!chrome.runtime.id){
		return;
	}
	return new Promise(resolve => {
		chrome.runtime.sendMessage({
			action: 'setLocal',
			key: key,
			data: data
		}, function(){
			console.log('set bg ls', key, data);
			resolve();
		});
	});
};

export const getAndRemoveBackgroundLocalStorage = (key)=>{
	return new Promise((resolve, reject) => {
		getBackgroundLocalStorage(key).then(data=>{
			if(data){
				removeBackgroundLocalStorage(key);
				resolve(data);
			}
		}, reject);
	})
}

export const getBackgroundLocalStorage = (key) => {
	console.log('getBackgroundLocalStorage');
	if(!chrome.runtime.id){
		return;
	}
	return new Promise(resolve => {
		chrome.runtime.sendMessage({
			action: 'getLocal',
			key: key
		}, function(data){
			console.log('get bg ls', key, data);
			resolve(data);
		});
	});
};

export const removeBackgroundLocalStorage = (key) => {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({
			action: 'removeLocal',
			key: key
		}, function(){
			console.log('rm bg ls', key);
			resolve();
		});
	});
};

export const getChromeStorageSync = (key, defaultValue) => {
	return new Promise((resolve) => {
		if(!chrome.runtime.id){
			return;
		}
		chrome.storage.sync.get([key], obj => {
			resolve(obj[key] === undefined ? defaultValue : obj[key]);
		});
	});
};

export const onChromeStorageSyncChange = (key, payload) => {
	if(!chrome.runtime.id){
		return;
	}
	chrome.storage.sync.addListen((allChanges, namespace) => {
		console.log('chrome.storage.sync changed', allChanges);
		let changes = allChanges[key];
		if(changes){
			payload(changes.newValue, changes.oldValue);
		}
	});
};

export const setChromeStorageSync = (key, data) => {
	if(!chrome.runtime.id){
		return;
	}
	return new Promise(resolve => {
		console.log('set chrome storage', key, data);
		chrome.storage.sync.set({
			[key]: data
		});
	});
};

export const isH5Link = link => {
	let a = document.createElement('a');
	a.href = link;
	return a.host.indexOf('.h5.xiaoeknow.com') > 0;
};

/**
 * 构建后台管理台入口
 * @param {String} appId
 * @param {String} jump
 * @param {String} title
 * @param fullTitle
 * @returns {String}
 */
export const buildAppAdminEntry = (appId, jump = '', title = "管理台", fullTitle = '') => {
	console.log('jump', jump);
	let jumpParam = encodeBase64(JSON.stringify({
		type: 'AppAdmin',
		url: jump,
		appId: appId
	}));
	return `<form action="https://super.xiaoe-tech.com/new/saveLoginLog?jumpParam=${jumpParam}" style="display:inline-block" method="post" target="_blank">
                <input type="hidden" name="app_id" value="${appId}"/>
                <input type="hidden" name="context_reason" value="1"/>
                <input type="hidden" name="context_resource_id" value=""/>
                <input type="hidden" name="context_resource_type" value="4"/>
                <input type="submit" value="${escapeAttr(title)}" title="${escapeAttr(fullTitle)}" class="btn btn-admin-system"/>
            </form>`;
};

/**
 * 构建用户H5端入口
 * @param {String} appId
 * @param {String} userId
 * @param {String} jump
 * @param {String} title
 * @param fullTitle
 * @returns {String}
 */
export const buildUserH5Entry = (appId, userId, jump = '', title = '', fullTitle = '') => {
	let jumpParam = encodeBase64(JSON.stringify({
		type: 'UserH5',
		url: jump,
		appId: appId,
		userId: userId
	}));
	let ti = title || "H5店铺" + (jump.length ? '：' + jump.substring(0, 10) : '');
	return `<form action="https://super.xiaoe-tech.com/new/ops_tool/app_create_token?jumpParam=${jumpParam}" style="display:inline-block" method="post" target="_blank">
                <input type="hidden" name="app_id" value="${appId}"/>
                <input type="hidden" name="user_id" value="${userId}"/>
                <input type="submit" title="${escapeAttr(fullTitle)}" value="${escapeAttr(ti)}" class="btn btn-h5-system"/>
            </form>`;
};

/**
 * 打开兵器库，查询用户是否拥有指定资源权益
 * @param appId
 * @param userId
 * @param resourceId
 * @param resourceType
 * @param title
 * @param fullTitle
 * @returns string
 */
export const buildSuperRightsQuery = (appId, userId, resourceId, resourceType, title = '', fullTitle = '') => {
	let jumpParam = encodeBase64(JSON.stringify({
		type: 'SuperRights',
		appId: appId,
		userId: userId,
		resourceId,
		resourceType
	}));
	let jumpUrl = `https://super.xiaoe-tech.com/new?jumpParam=${jumpParam}#/tools/source_right_manage-copy`
	return `<form action="./../popup/super_admin_jumper.html" style="display:inline-block" method="get" target="_blank">
                <input type="hidden" name="jumpUrl" value="${escapeAttr(jumpUrl)}"/>
                <input type="submit" title="${escapeAttr(fullTitle)}" value="${escapeAttr(title || "查看用户权益")}" class="btn btn-h5-system"/>
            </form>`;
}

export const watchPageUntil = (selector, callback, timeoutMs)=>{
	let st = (new Date()).getTime();
	let checkInterval = 100;
	let loop = ()=>{
		if(document.querySelector(selector)){
			callback();
			return;
		}
		if((new Date()).getTime() - st > timeoutMs){
			return;
		}
		setTimeout(loop, checkInterval);
	}
	loop();
}

/**
 * 圈子PC登录
 * @param {String} appId
 * @param {String} userId
 * @param {String} communityId
 * @return {String} form html
 */
export const buildUserPCCommunityEntry = (appId, userId, communityId = '') => {
	let jump_url = buildCommunityPCUrl(appId, communityId);
	let jumpParam = encodeBase64(JSON.stringify({
		type: 'PCComm',
		url: jump_url,
		appId: appId,
		userId: userId
	}));
	let title = "PC圈子";
	return `<form action="https://super.xiaoe-tech.com/new/ops_tool/app_create_token?jumpParam=${jumpParam}" style="display:inline-block" method="post" target="_blank">
                <input type="hidden" name="app_id" value="${appId}"/>
                <input type="hidden" name="user_id" value="${userId}"/>
                <input type="submit" title="${title ? escapeAttr(title) : escapeAttr(jump_url)}" value="${escapeAttr(title)}" class="btn btn-pc-system"/>
            </form>`;
}

/**
 * 打开需要O端登录态的连接
 * @param {String} link
 */
export const openSupperAdminLink = (link) => {
	setBackgroundLocalStorage(SUPER_JUMP_KEY, encodeBase64(JSON.stringify({
		type: 'url',
		url: link
	}))).then(() => {
		window.open('https://super.xiaoe-tech.com', '_blank');
	});
}

export const buildLink = (link, title = '', count = DEFAULT_LINK_WORD_COUNT) => {
	return `<a href="${link}" title="${link}" data-allow-copy target="_blank">${cutTxt(title || link, count)}</a>`;
};

export const buildAppH5Link = appId => {
	return buildLink(H5_HOST.replace('%appId', appId));
};

export const buildAppPCLink = appId => {
	return buildLink(PC_HOST.replace('%appId', appId));
};

export const buildCommunityPCUrl = (appId, commId = '') => {
	return commId ? getResourceInfoUrl(appId, commId, RESOURCE_TYPE_COMMUNITY, SYS_PC) : COMMUNITY_PC_HOST;
};

const fetchTailStr = (txt, len = 3) => {
	return ' (' + txt.substring(txt.length - len) + ')';
}

export const renderTextResult = (txt, hereNoResult = false) => {
	txt = txt.trim();
	let appIds = resolveAppIds(txt);
	let appId = appIds[0];
	let resourceIds = resolveResourceIdList(txt);
	let communityId = resolveCommunityId(txt)[0];
	let userIds =  resolveUserIds(txt);

	let fromBase64 = decodeBase64(txt),
		links = resolveUrls(txt),
		opHtml = '',
		infoHtml = '';

	//B端功能
	appIds.forEach(appId=>{
		opHtml += buildAppAdminEntry(appId, ADMIN_HOST, '登B端'+fetchTailStr(appId), `登录B端管理台：${appId}`);
	});
	if(appIds.length && userIds.length){
		userIds.forEach(userId=>{
			opHtml += buildAppAdminEntry(appId, `${ADMIN_HOST}/t/user_manage/index#/user_list/userDetails/openRecords?userId=${userId}`, 'B端用户详情'+fetchTailStr(userId), `登录查看B端用户详情：${userId}`);
		});
	}
	if(appIds.length && resourceIds.length){
		resourceIds.forEach(({type, id}) => {
			opHtml += buildAppAdminEntry(appId,
				getResourceInfoUrl(appId, id, type, SYS_ADMIN),
				`B端${RESOURCE_TYPE_MAP[type]}详情` + fetchTailStr(id),
				`登录查看B端${RESOURCE_TYPE_MAP[type]}详情：${id}`);
		});
	}

	//信息
	links.forEach((link, idx) => {
		infoHtml += `<li><label>链接${links.length > 1 ? idx + 1 : ''}：</label><span>${buildLink(link)}</span></li>`;
	});
	appIds.forEach(appId=>{
		infoHtml += `<li><label>店铺ID：</label><span>${appId}</span></li>`;
		infoHtml += `<li><label>店铺PC链接：</label><span>${buildAppPCLink(appId)}</span></li>`
		infoHtml += `<li><label>店铺H5链接：</label><span>${buildAppH5Link(appId)}</span></li>`
	});
	userIds.forEach(userId=>{
		infoHtml += `<li><label>用户ID：</label><span>${userId}</span></li>`;
	});
	resourceIds.forEach(({type, id})=>{
		infoHtml += `<li><label>${RESOURCE_TYPE_MAP[type]}ID：</label><span>${id}</span></li>`
		infoHtml += `<li><label>PC${RESOURCE_TYPE_MAP[type]}详情：</label><span>${buildLink(getResourceInfoUrl(appId, id, type, SYS_PC))}</span></li>`
		infoHtml += `<li><label>H5${RESOURCE_TYPE_MAP[type]}详情：</label><span>${buildLink(getResourceInfoUrl(appId, id, type, SYS_H5))}</span></li>`
	});

	//c端替身登录
	appIds.length && userIds.length && (links.length ? links : []).forEach(link => {
		if(!isH5Link(link)){
			return;
		}
		userIds.forEach(userId=>{
			opHtml += buildUserH5Entry(appIds[0], userId, link, `登C端看链接`+fetchTailStr(link), `登C端并看链接：${link}\nAppID: ${appIds[0]}\nUserId: ${userId}`);
		});
	});
	appIds.length && userIds.length && !links.length && (
		userIds.forEach(userId=>{
			opHtml += buildUserH5Entry(appIds[0], userId, '', 'H5', `登录C端H5：${userId}`);
		})
	);
	appIds.length && userIds.length && resourceIds.length && (
		userIds.forEach(userId=>{
			opHtml += buildUserH5Entry(appId, userId,
				getResourceInfoUrl(appIds[0], resourceIds[0].id, resourceIds[0].type, SYS_H5),
				'H5' + RESOURCE_TYPE_MAP[resourceIds[0].type],
				`登录C端查看资源：${RESOURCE_TYPE_MAP[resourceIds[0].type]}\nAppID: ${appId}\nUserId: ${userId}\n资源ID: ${resourceIds[0]}`);
		})
	);

	//PC 登录
	appIds.length && userIds.length && communityId && (
		opHtml += buildUserPCCommunityEntry(appIds[0], userIds[0], communityId)
	)

	//权益查看
	appIds.length && userIds.length && resourceIds.forEach(resourceInfo=>{
		opHtml += buildSuperRightsQuery(appIds[0], userIds[0], resourceInfo.id, resourceInfo.type);
	});

	//其他
	fromBase64 && (infoHtml += `<li><label>Base64解码：</label><strong style="word-break:break-all;">${fromBase64}</strong></li>`);

	if(!txt){
		return '';
	}else if(!infoHtml.length && !opHtml.length){
		return hereNoResult ? '' : `<p style="padding:1em 0">不知道这里面有什么东西···</p>`;
	}else{
		return `<ul class="info-list">${infoHtml}</ul>` + opHtml;
	}
}