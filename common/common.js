import {
	decodeBase64,
	encodeBase64,
	cutTxt, escapeHtml, escapeAttr
} from "./function.js";

const DEFAULT_LINK_WORD_COUNT = 40;

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

export const getBackgroundLocalStorage = (key) => {
	console.log('getBackgroundLocalStorage');
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
	console.log('removeBackgroundLocalStorage');
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
		chrome.storage.sync.get([key], obj => {
			resolve(obj[key] === undefined ? defaultValue : obj[key]);
		});
	});
};

export const onChromeStorageSyncChange = (key, payload) => {
	chrome.storage.sync.addListen((allChanges, namespace) => {
		console.log('chrome.storage.sync changed', allChanges);
		let changes = allChanges[key];
		if(changes){
			payload(changes.newValue, changes.oldValue);
		}
	});
};

export const setChromeStorageSync = (key, data) => {
	return new Promise(resolve => {
		console.log('set chrome storage', key, data);
		chrome.storage.sync.set({
			[key]: data
		});
	});
};

export const resolveAppId = (txt) => {
	txt = ` ${txt} `;
	let ms = /\W(app[A-Za-z0-9_]{12})/.exec(txt);
	return ms ? ms[1] : null;
};

export const resolveCommunityId = (txt) => {
	txt = ` ${txt} `;
	let ms = /\W(c_[A-Za-z0-9_]{26})/.exec(txt);
	return ms ? ms[1] : null;
}

export const resolveUserId = (txt) => {
	txt = ` ${txt} `;
	let ms = /\W(u_[A-Za-z0-9_]{20,30})/.exec(txt);
	return ms ? ms[1] : null;
}

export const resolveUrls = (txt) => {
	let urls = [];
	let tmp = {};
	txt = ' ' + txt + ' ';
	txt.replace(/(https|http)(:\/\/.*?)[\s\n]/ig, ms => {
		ms = ms.trim();
		if(!tmp[ms]){
			urls.push(ms.trim());
			tmp[ms] = true;
		}
	});
	return urls;
}

export const isH5Link = link => {
	let a = document.createElement('a');
	a.href = link;
	return a.host.indexOf('.h5.xiaoeknow.com') > 0;
};

/**
 * 构建后台管理台入口
 * @param {String} appId
 * @param {String} title
 * @param {String} jump
 * @returns {String}
 */
export const buildAppAdminEntry = (appId, title = "店铺管理台", jump = '') => {
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
                <input type="submit" value="${title}" class="btn btn-danger btn-admin-system"/>
            </form>`;
};

/**
 * 构建用户H5端入口
 * @param {String} appId
 * @param {String} userId
 * @param {String} jump
 * @param {String} title
 * @returns {String}
 */
export const buildUserH5Entry = (appId, userId, jump = '', title = '') => {
	let jumpParam = encodeBase64(JSON.stringify({
		type: 'UserH5',
		url: jump,
		appId: appId,
		userId: userId
	}));
	let ti = title || "H5登录：" + jump.substring(0, 10);
	return `<form action="https://super.xiaoe-tech.com/new/ops_tool/app_create_token?jumpParam=${jumpParam}" style="display:inline-block" method="post" target="_blank">
                <input type="hidden" name="app_id" value="${appId}"/>
                <input type="hidden" name="user_id" value="${userId}"/>
                <input type="submit" title="${title ? escapeAttr(title) : escapeAttr(jump)}" value="${escapeAttr(ti)}" title="${escapeHtml(ti)}" class="btn btn-danger btn-h5-system"/>
            </form>`;
};

/**
 * 圈子PC登录
 * @param {String} appId
 * @param {String} userId
 * @param {String} communityId
 * @return {`<form action="https://super.xiaoe-tech.com/new/ops_tool/app_create_token?jumpParam=${string}" style="display:inline-block" method="post" target="_blank">
                <input type="hidden" name="app_id" value="${string}"/>
                <input type="hidden" name="user_id" value="${string}"/>
                <input type="submit" title="${string}" value="${string}" title="${string}" class="btn btn-danger btn-h5-system"/>
            </form>`}
 */
export const buildUserPCCommunityEntry = (appId, userId, communityId = '') => {
	let jump_url = buildCommunityPCUrl(appId, communityId);
	let jumpParam = encodeBase64(JSON.stringify({
		type: 'PCComm',
		url: jump_url,
		appId: appId,
		userId: userId
	}));
	let title = "PC圈子登录";
	return `<form action="https://super.xiaoe-tech.com/new/ops_tool/app_create_token?jumpParam=${jumpParam}" style="display:inline-block" method="post" target="_blank">
                <input type="hidden" name="app_id" value="${appId}"/>
                <input type="hidden" name="user_id" value="${userId}"/>
                <input type="submit" title="${title ? escapeAttr(title) : escapeAttr(jump_url)}" value="${escapeAttr(title)}" title="${escapeHtml(title)}" class="btn btn-danger btn-h5-system"/>
            </form>`;
}

export const buildLink = (link, title = '', count = DEFAULT_LINK_WORD_COUNT) => {
	return `<a href="${link}" title="${link}" data-allow-copy target="_blank">${cutTxt(title || link, count)}</a>`;
};

export const buildAppH5Link = appId => {
	return buildLink(`https://${appId}.h5.xiaoeknow.com/`);
};

export const buildAppPCLink = appId => {
	return buildLink(`https://${appId}.pc.xiaoe-tech.com/`);
};

export const buildCommunityPCLink = (appId, commId = '') => {
	return buildLink(buildCommunityPCUrl(appId, commId), '');
};

export const buildCommunityPCUrl = (appId, commId = '') => {
	return commId ? `https://quanzi.xiaoe-tech.com/${commId}/feed_list?app_id=${appId}` : `https://quanzi.xiaoe-tech.com/`;
};

export const buildCommunityH5Link = (appId, commId) => {
	return buildLink(`https://${appId}.h5.xiaoeknow.com/xe.community.community_service/v2/feedList?app_id=${appId}&community_id=${commId}&product_id=&share_user_id=`);
};

export const renderTextResult = (txt, hieNoResult = false) => {
	txt = txt.trim();
	let appId = resolveAppId(txt);
	let communityId = resolveCommunityId(txt);
	let userId = resolveUserId(txt);

	let fromBase64 = decodeBase64(txt),
		links = resolveUrls(txt),
		opHtml = '',
		infoHtml = '';

	if(links.length){
		links.forEach((link, idx) => {
			infoHtml += `<li><label>链接${links.length > 1 ? idx + 1 : ''}：</label><span>${buildLink(link)}</span></li>`;
		});
	}

	//管理端入口
	appId && (opHtml += buildAppAdminEntry(appId, '登B端', 'https://admin.xiaoe-tech.com/'));
	appId && userId && (opHtml += buildAppAdminEntry(appId, 'B端用户详情', `https://admin.xiaoe-tech.com/t/user_manage/index#/user_list/userDetails/openRecords?userId=${userId}`));
	appId && communityId && (opHtml += buildAppAdminEntry(appId, 'B端圈子详情', `https://admin.xiaoe-tech.com/smallCommunity/communityList#/community_manage/content_settings/feed_list?communityId=${communityId}&type=manage`));

	//C端链接
	appId && (infoHtml += `<li><label>店铺ID：</label><span>${appId}</span></li>`);
	appId && (infoHtml += `<li><label>店铺PC链接：</label><span>${buildAppPCLink(appId)}</span></li>`);
	appId && (infoHtml += `<li><label>店铺H5链接：</label><span>${buildAppH5Link(appId)}</span></li>`);
	userId && (infoHtml += `<li><label>用户ID：</label><span>${userId}</span></li>`);
	communityId && (infoHtml += `<li><label>圈子ID：</label><span>${communityId}</span></li>`);
	appId && (infoHtml += `<li><label>圈子H5链接：</label><span>${buildCommunityH5Link(appId, communityId)}</span></li>`);
	appId && (infoHtml += `<li><label>圈子PC链接：</label><span>${buildCommunityPCLink(appId, communityId)}</span></li>`);

	//c端替身登录
	appId && userId && (links.length ? links : []).forEach(link => {
		opHtml += buildUserH5Entry(appId, userId, isH5Link(link) ? link : '');
	});
	appId && userId && !links.length && (
		opHtml += buildUserH5Entry(appId, userId, '', 'H5登录')
	);
	appId && userId && communityId && (
		opHtml += buildUserH5Entry(appId, userId, buildCommunityH5Link(appId, communityId), 'H5圈子登录')
	);
	appId && userId && (
		opHtml += buildUserPCCommunityEntry(appId, userId, communityId)
	)

	//其他
	fromBase64 && (infoHtml += `<li><label>Base64解码：</label><span>${fromBase64}</span></li>`);

	if(!txt){
		return '';
	}else if(!infoHtml.length && !opHtml.length){
		return hieNoResult ? '' : `<p style="padding:1em 0">不知道这里面有什么东西···</p>`;
	}else{
		return `<ul class="info-list">${infoHtml}</ul>` + opHtml;
	}
}