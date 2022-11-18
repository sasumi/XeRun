const DEFAULT_LINK_WORD_COUNT = 35;

export const patchCss = (cssStr, id = null) => {
    let style = document.createElement('style');
    style.appendChild(document.createTextNode(cssStr));
    if (id) {
        style.id = id;
    }
    style.type = "text/css";
    document.querySelector('head').appendChild(style);
    return style;
};

export const hide = dom => {
    if (dom) {
        dom.style.display = 'none';
    }
}

export const escapeHtml = str => {
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;")
		.replace(/\n/g, '<br/>')
		.replace(/\s/g, '&nbsp;')
		.replace(/\t/g, '&nbsp;&nbsp;');
}

/**
 * 反转义HTML
 * @param {String} str
 * @returns {string}
 */
 export const unescapeHtml = (str)=>{
	return String(str)
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&amp;/g, '&');
};

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

export const closest = (dom, selector) => {
    let curDom = dom;
    while (curDom = curDom.parentNode) {
        if (curDom.matches(selector)) {
            return curDom;
        }
    }
    return null;
}

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

/**
 * 检测child节点是否在container节点列表里面
 * @param {HTMLElement|HTMLElement[]|String} contains
 * @param {Node} child
 * @param {Boolean} includeEqual 是否包括等于关系
 * @returns {boolean}
 */
export const domContained = (contains, child, includeEqual = false) => {
    if (typeof contains === 'string') {
        contains = document.querySelectorAll(contains);
    } else if (Array.isArray(contains)) {} else if (typeof contains === 'object') {
        contains = [contains];
    }
    for (let i = 0; i < contains.length; i++) {
        if ((includeEqual ? contains[i] === child : false) ||
            contains[i].compareDocumentPosition(child) & 16) {
            return true;
        }
    }
    return false;
};

export const show = dom => {
    dom.style.display = '';
}

export const buildCookieCmd = cookies => {
    let cookieStr = '';
    cookies.forEach(cookie => {
        console.log(cookie);
        cookieStr += cookie.name + '=' + cookie.value + ';';
    });
    return cookieStr;
};

export const assertUrl = (id) => {
    return chrome.runtime.getURL('assets/' + id);
};

export const parseQueryString = (queryString)=>{
    if(queryString[0] === '?'){
        queryString = queryString.substring(1);
    }
    let segs = queryString.split('&');
    let ret = {};
    segs.forEach(seg=>{
        if(seg.indexOf('=') <= 0){
            ret[decodeURIComponent(seg)] = null;
        }
        else {
            let [name, value] = seg.split('=');
            name = decodeURIComponent(name);
            value = decodeURIComponent(value);
            ret[name] = value;
        }
    });
    return ret;
}

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

export const layDomInView = (dom, dimension) => {
    console.log('layDom in view');
    let width = dom.offsetWidth;
    let height = dom.offsetHeight;
    let viewHeight = document.body.offsetHeight || document.body.parentNode.clientHeight;
    let viewWidth = document.body.offsetWidth || document.body.parentNode.clientWidth;

    let left = Math.min(viewWidth - width, dimension.left) + document.body.scrollLeft;
    let top = Math.min(viewHeight - height, dimension.top) + document.body.scrollTop;
    dom.style.top = top + 'px';
    dom.style.left = left + 'px';
}

export const getChromeStorageSync = (key, defaultValue) => {
    return new Promise((resolve) => {
        chrome.storage.sync.get(key, obj => {
            console.log('from chrome storage', key, obj[key]);
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

export const createHtml = html => {
    let div = document.createElement('div');
    div.innerHTML = html;
    let ns = [];
    div.childNodes.forEach(node=>{
        ns.push(node);
        document.body.appendChild(node);
    });
    if(!ns.length){
        return null;
    }
    if(ns.length === 1){
        return ns[0];
    }
    return ns;
};

export const setChromeStorageSync = (key, data) => {
    return new Promise(resolve => {
        console.log('set chrome storage', key, data);
        chrome.storage.sync.set({
            [key]: data
        });
    });
};

//将unicode编码转字符串
export const unicode2str = function (unicode) {
    let result = [];
    let strArr = unicode.split('\\u');
    for (let i = 0, len = strArr.length; i < len; i++) {
        if (strArr[i]) {
            result.push(String.fromCharCode(parseInt(strArr[i], 16)))
        }
    }
    return result.join('');
}

//将字符串转unicode编码
export const str2Unicode = function (str) {
    let unid = '\\u';
    for (let i = 0, len = str.length; i < len; i++) {
        if (i < len - 1) {
            unid += str.charCodeAt(i).toString(16) + '\\u';
        } else if (i === len - 1) {
            unid += str.charCodeAt(i).toString(16);
        }
    }
    return unid;
}

export const broadcastToAllTab = (data, onResponse = function () {}) => {
    console.log('broadcastToAllTab', data);
    chrome.tabs.query({}, function (tabs) {
        tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, data, onResponse);
        });
    });
};


let events = {};
export const fireEvent = function(ev){
    if(events[ev]){
        let args = Array.from(arguments).slice(1);
        events[ev].forEach(payload=>{
            payload.apply(null, args);
        });
    }
};

export const listenEvent = (ev, payload)=>{
    if(!events[ev]){
        events[ev] = [];
    }
    events[ev].push(payload);
};

export const batchAddListener = (dom, events, payload) => {
    events.forEach(event => {
        if (event === 'enter') {
            dom.addEventListener('keyup', e => {
                if (e.key === 'Enter') {
                    payload(e);
                }
            });
        } else if (event === 'space') {
            dom.addEventListener('keyup', e => {
                if (e.code === 'Space') {
                    payload(e);
                }
            });
        } else {
            dom.addEventListener(event, payload);
        }
    });
}

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

export const decodeBase64 = (txt) => {
    try {
        let d = atob(txt);
        let str = decodeURI(d);
        return str && str !== txt ? str : null;
    } catch (e) {
        console.log('from base 64 fail');
    }
    return null;
};

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

export const isH5Link = link=>{
    let a = document.createElement('a');
    a.href = link;
    return a.host.indexOf('.h5.xiaoeknow.com') > 0;
};

export const buildAppAdminEntry = appId => {
    let html = `<form action="https://super.xiaoe-tech.com/new/saveLoginLog" style="display:inline-block" method="post" target="_blank">
    <input type="hidden" name="app_id" value="${appId}"/>
    <input type="hidden" name="context_reason" value="1"/>
    <input type="hidden" name="context_resource_id" value="0"/>
    <input type="hidden" name="context_resource_type" value="4"/>
    <input type="submit" value="登录店铺管理台" class="btn btn-danger"/>
</form>`;
    return html;
};

export const buildUserH5Entry = (appId, userId, h5Link='') => {
    let html = `<form action="https://super.xiaoe-tech.com/new/ops_tool/app_create_token?redirect_url=${encodeURIComponent(h5Link)}" style="display:inline-block" method="post" target="_blank">
    <input type="hidden" name="app_id" value="${appId}"/>
    <input type="hidden" name="user_id" value="${userId}"/>
    <input type="submit" value="登录用户H5端" class="btn btn-danger"/>
</form>`;
    return html;
};

const cutTxt = (str, count) => {
    if (!count) {
        return str;
    }
    if (str.length > count) {
        return str.substring(0, count) + '...';
    }
    return str;
};

export const buildLink = (link, title = '', count = DEFAULT_LINK_WORD_COUNT) => {
    return `<a href="${link}" title="${link}" data-allow-copy target="_blank">${cutTxt(title || link, count)}</a>`;
};

export const buildAppH5Entry = appId => {
    return buildLink(`https://${appId}.h5.xiaoeknow.com/`);
};

export const buildAppPCEntry = appId => {
    return buildLink(`https://${appId}.pc.xiaoe-tech.com/`);
};

export const buildCommunityPcEntry = (appId, commId) => {
    return buildLink(`https://quanzi.xiaoe-tech.com/${commId}/feed_list?app_id=${appId}`, '', );
};

export const buildCommunityH5Entry = (appId, commId) => {
    return buildLink(`https://${appId}.h5.xiaoeknow.com/xe.community.community_service/v2/feedList?app_id=${appId}&community_id=${commId}&product_id=&share_user_id=`);
};

export const queryESLogByUserId = (userId, startDate, endDate = null) => {
    let uin = '100047879730';
    let endTimestamp = (new Date(endDate)).getTime();
    fetch(`https://capi.cloud.tencent.com/cgi/cls?i=cls/SearchLog&uin=${uin}`, {
        "headers": {
            "accept": "application/json, text/javascript, */*; q=0.01",
            "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
            "cache-control": "no-cache",
            "content-type": "application/json; charset=UTF-8",
            "pragma": "no-cache",
            "sec-ch-ua": "\"Microsoft Edge\";v=\"107\", \"Chromium\";v=\"107\", \"Not=A?Brand\";v=\"24\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-csrfcode": "1029253491",
            "x-lid": "rkwlAtsHo",
            "x-life": "57327",
            "x-referer": "https://console.cloud.tencent.com/cls/search?hideLeftNav&hideTopNav&hideHeader&grammarVersion=lucene&region=ap-shanghai&topic_id=69df62e7-eb41-454a-8262-db4415a85aa0&queryBase64=dV82MmVhMWVlNTU5YTFmX2VneHBNNks4Y2UgQU5EIG1pbmk&time=now%2Fw,now%2Fw",
            "x-requested-with": "XMLHttpRequest",
            "x-seqid": "83ebd318-9140-3707-a4e6-7f288ae742c1"
        },
        "referrer": "https://capi.cloud.tencent.com/proxy.html",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": "{\"serviceType\":\"cls\",\"action\":\"SearchLog\",\"data\":{\"Version\":\"2020-10-16\",\"TopicId\":\"69df62e7-eb41-454a-8262-db4415a85aa0\",\"From\":1667750400000,\"To\":1668355199999,\"Query\":\"u_62ea1ee559a1f_egxpM6K8ce AND mini\",\"Limit\":20,\"Context\":\"\",\"Sort\":\"desc\",\"HighLight\":true,\"UseNewAnalysis\":true,\"QueryOptimize\":1,\"SamplingRate\":1,\"SyntaxRule\":0},\"regionId\":4,\"clientTimeout\":65000}",
        "method": "POST",
        "mode": "cors",
        "credentials": "include"
    });

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
            infoHtml += `<li><label>链接${links.length > 1 ? idx+1 : ''}：</label><span>${buildLink(link)}</span></li>`;
        });
    }

    if (appId) {
        infoHtml += `<li><label>店铺ID：</label><span>${appId}</span></li>`;
        infoHtml += `<li><label>店铺PC链接：</label><span>${buildAppPCEntry(appId)}</span></li>`;
        infoHtml += `<li><label>店铺H5链接：</label><span>${buildAppH5Entry(appId)}</span></li>`;
        opHtml += buildAppAdminEntry(appId);
    }

    if (appId && userId) {
        if(links.length){
            links.forEach(link=>{
                opHtml += buildUserH5Entry(appId, userId, isH5Link(link) ? link: '');
            });
        } else {
            opHtml += buildUserH5Entry(appId, userId);
        }
    }
    if (userId) {
        infoHtml += `<li><label>用户ID：</label><span>${userId}</span></li>`;
        opHtml += `<a href="https://admin.xiaoe-tech.com/user_manage#/user_list/userDetails/openRecords?userId=${userId}" target="_blank" class="btn">管理台用户详情</a>`;
    }

    if (communityId) {
        infoHtml += `<li><label>圈子ID：</label><span>${communityId}</span></li>`;
        infoHtml += appId ? `<li><label>圈子H5链接：</label><span>${buildCommunityH5Entry(appId, communityId)}</span></li>` : '';
        infoHtml += appId ? `<li><label>圈子PC链接：</label><span>${buildCommunityPcEntry(appId, communityId)}</span></li>` : '';
        opHtml += `<a href="https://admin.xiaoe-tech.com/smallCommunity/communityList#/community_manage/content_settings/feed_list?communityId=${communityId}&type=manage" target="_blank" class="btn">管理台圈子详情</a>`;
    }
    if (fromBase64) {
        infoHtml += `<li><label>Base64解码：</label><span>${fromBase64}</span></li>`;
    }

    console.log('opHtml', opHtml, 'infoHtml', infoHtml);

    if (!txt) {
        return '';
    } else if (!infoHtml.length && !opHtml.length) {
        return hieNoResult ? '' : `<p style="padding:1em 0">不知道这里面有什么东西···</p>`;
    } else {
        return `<ul class="info-list">${infoHtml}</ul>` + opHtml;
    }
}