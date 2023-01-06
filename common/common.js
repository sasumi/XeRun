import {
	decodeBase64,
	encodeBase64,
	cutTxt
} from "./function.js";

const DEFAULT_LINK_WORD_COUNT = 35;

export const COMMON_OPTIONS = {
	'通用': [{
		title: '页面选中内容智能识别',
		key: 'coding.contentResolve',
		defaultValue: true
	}, ],
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
	}, ],
	'XET管理台': [{
		title: '去水印',
		key: 'xet.removeWatermark',
		defaultValue: true
	}, ]
};

export const inCommonOption = key => {
	let matched = null;
	for (let groupTitle in COMMON_OPTIONS) {
		COMMON_OPTIONS[groupTitle].forEach((opt) => {
			if (key === opt.key) {
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
		if (!opt) {
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

export const setBackgroundLocalStorange = (key, data) => {
	console.log('setBackgroundLocalStorange', key, data);
	return new Promise(resolve => {
		chrome.runtime.sendMessage({
			action: 'setLocal',
			key: key,
			data: data
		}, function () {
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
		}, function (data) {
			console.log('get bg ls', key, data);
			resolve(data);
		});
	});
};

export const removeBackgroundLocalStorage = (key)=>{
	console.log('removeBackgroundLocalStorage');
	return new Promise(resolve => {
		chrome.runtime.sendMessage({
			action: 'removeLocal',
			key: key
		}, function () {
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
		if (changes) {
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
	let ms = /\W(u_[A-Za-z0-9_]{24})/.exec(txt);
	return ms ? ms[1] : null;
}

export const resolveUrls = (txt) => {
	let urls = [];
	let tmp = {};
	txt = ' ' + txt + ' ';
	txt.replace(/(https|http)(:\/\/.*?)[\s\n]/ig, ms => {
		ms = ms.trim();
		if (!tmp[ms]) {
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
                <input type="hidden" name="context_resource_id" value="0"/>
                <input type="hidden" name="context_resource_type" value="4"/>
                <input type="submit" value="${title}" class="btn btn-danger"/>
            </form>`;
};

/**
 * 构建用户H5端入口
 * @param {String} appId
 * @param {String} userId
 * @param {String} jump
 * @returns {String}
 */
export const buildUserH5Entry = (appId, userId, jump = '') => {
	let jumpParam = encodeBase64(JSON.stringify({
		type: 'UserH5',
		url: jump,
		appId: appId,
		userId: userId
	}));
	return `<form action="https://super.xiaoe-tech.com/new/ops_tool/app_create_token?jumpParam=${jumpParam}" style="display:inline-block" method="post" target="_blank">
                <input type="hidden" name="app_id" value="${appId}"/>
                <input type="hidden" name="user_id" value="${userId}"/>
                <input type="submit" value="登录用户H5端" class="btn btn-danger"/>
            </form>`;
};

export const buildLink = (link, title = '', count = DEFAULT_LINK_WORD_COUNT) => {
	return `<a href="${link}" title="${link}" data-allow-copy target="_blank">${cutTxt(title || link, count)}</a>`;
};

export const buildAppH5Url = appId => {
	return buildLink(`https://${appId}.h5.xiaoeknow.com/`);
};

export const buildAppPCUrl = appId => {
	return buildLink(`https://${appId}.pc.xiaoe-tech.com/`);
};

export const buildCommunityPCUrl = (appId, commId) => {
	return buildLink(`https://quanzi.xiaoe-tech.com/${commId}/feed_list?app_id=${appId}`, '', );
};

export const buildCommunityH5Url = (appId, commId) => {
	return buildLink(`https://${appId}.h5.xiaoeknow.com/xe.community.community_service/v2/feedList?app_id=${appId}&community_id=${commId}&product_id=&share_user_id=`);
};

export const renderTextResult = (txt, hieNoResult = false) => {
	txt = txt.trim();
	let appId = resolveAppId(txt);
	let communityId = resolveCommunityId(txt);
	let userId = resolveUserId(txt);
	let fromBase64 = decodeBase64(txt);
	let links = resolveUrls(txt);
	let opHtml = '';
	let infoHtml = '';

	if (links.length) {
		links.forEach((link, idx) => {
			infoHtml += `<li><label>链接${links.length > 1 ? idx + 1 : ''}：</label><span>${buildLink(link)}</span></li>`;
		});
	}

	if (appId) {
		opHtml += buildAppAdminEntry(appId, '店铺管理台', 'https://admin.xiaoe-tech.com/');
		if (userId) {
			opHtml += buildAppAdminEntry(appId, '管理台用户详情', `https://admin.xiaoe-tech.com/t/user_manage/index#/user_list/userDetails/openRecords?userId=${userId}`);
		}
		if (communityId) {
			opHtml += buildAppAdminEntry(appId, '管理台圈子详情', `https://admin.xiaoe-tech.com/smallCommunity/communityList#/community_manage/content_settings/feed_list?communityId=${communityId}&type=manage`);
		}
	}

	if (appId) {
		infoHtml += `<li><label>店铺ID：</label><span>${appId}</span></li>`;
		infoHtml += `<li><label>店铺PC链接：</label><span>${buildAppPCUrl(appId)}</span></li>`;
		infoHtml += `<li><label>店铺H5链接：</label><span>${buildAppH5Url(appId)}</span></li>`;
	}
	if (userId) {
		infoHtml += `<li><label>用户ID：</label><span>${userId}</span></li>`;
	}
	if (communityId) {
		infoHtml += `<li><label>圈子ID：</label><span>${communityId}</span></li>`;
		infoHtml += appId ? `<li><label>圈子H5链接：</label><span>${buildCommunityH5Url(appId, communityId)}</span></li>` : '';
		infoHtml += appId ? `<li><label>圈子PC链接：</label><span>${buildCommunityPCUrl(appId, communityId)}</span></li>` : '';
	}

	if (appId && userId) {
		if (links.length) {
			links.forEach(link => {
				opHtml += buildUserH5Entry(appId, userId, isH5Link(link) ? link : '');
			});
		} else {
			opHtml += buildUserH5Entry(appId, userId);
		}
	}

	if (fromBase64) {
		infoHtml += `<li><label>Base64解码：</label><span>${fromBase64}</span></li>`;
	}
	if (!txt) {
		return '';
	} else if (!infoHtml.length && !opHtml.length) {
		return hieNoResult ? '' : `<p style="padding:1em 0">不知道这里面有什么东西···</p>`;
	} else {
		return `<ul class="info-list">${infoHtml}</ul>` + opHtml;
	}
}