import {regQuote} from "./function.js";

export const SYS_ADMIN = 'admin';
export const SYS_H5 = 'h5';
export const SYS_PC = 'pc';

export const ADMIN_HOST = 'https://admin.xiaoe-tech.com';
export const H5_HOST = 'https://%appId.h5.xiaoeknow.com';
export const PC_HOST = 'https://%appId.h5.xiaoeknow.com'

export const COMMUNITY_PC_HOST = `https://quanzi.xiaoe-tech.com/`;

export const RESOURCE_TYPE_ARTICLE = 1; //图文
export const RESOURCE_TYPE_AUDIO = 2; //音频
export const RESOURCE_TYPE_VIDEO = 3; //视频
export const RESOURCE_TYPE_ALIVE = 4; //直播
export const RESOURCE_TYPE_MEMBER = 5; //会员
export const RESOURCE_TYPE_PACKAGE = 6; //专栏
export const RESOURCE_TYPE_COMMUNITY = 7; //社群
export const RESOURCE_TYPE_TOPIC = 8; //大专栏
export const RESOURCE_TYPE_ACTIVITY = 9; //活动管理
export const RESOURCE_TYPE_EXERCISE_BOOK = 11; //作业
export const RESOURCE_TYPE_CLOCK = 16; //打卡
export const RESOURCE_TYPE_EBOOK = 20; //电子书
export const RESOURCE_TYPE_ENTITY = 21; //实物商品
export const RESOURCE_TYPE_CONTENT_MARKET = 22; //分销商品
export const RESOURCE_TYPE_SVIP = 23; //超级会员
export const RESOURCE_TYPE_CAMP = 25; //训练营
export const RESOURCE_TYPE_EXAM = 27; //考试
export const RESOURCE_TYPE_COURSE_OFFLINE = 29; //面授课
export const RESOURCE_TYPE_SMALL_CLASS = 31; //小班课
export const RESOURCE_TYPE_PRACTICE = 34; //练习本
export const RESOURCE_TYPE_SINGLE_BIG_CLASS = 35; //大班课
export const RESOURCE_TYPE_PAID_COUPON = 41; //有价优惠券
export const RESOURCE_TYPE_OFFLINE_PACKAGE_COURSE = 42;//线下课时包
export const RESOURCE_TYPE_AI_INTERACTION = 45; //AI 互动课
export const RESOURCE_TYPE_REDEEM_CODE = 102; //兑换码
export const RESOURCE_TYPE_INVITE_CODE = 103; //邀请码
export const RESOURCE_TYPE_PROMO_CODE = 105; //优惠码
export const RESOURCE_TYPE_COUPON = 106; //优惠券
export const RESOURCE_TYPE_SRV = 68; //服务类商品
export const RESOURCE_TYPE_EKC = 50; //训练营pro
export const RESOURCE_TYPE_DISCUSS = 120; //讨论任务（圈子业务）

//单课
export const SINGLE_RESOURCE = [
	RESOURCE_TYPE_ARTICLE,
	RESOURCE_TYPE_AUDIO,
	RESOURCE_TYPE_VIDEO,
	RESOURCE_TYPE_ALIVE,
	RESOURCE_TYPE_EBOOK,
	RESOURCE_TYPE_SMALL_CLASS,
	RESOURCE_TYPE_SINGLE_BIG_CLASS,
	RESOURCE_TYPE_AI_INTERACTION,
];

//资源ID前缀映射，
//如果需要反过来使用，请使用 array_combine自行组装
export const RESOURCE_PREFIX_MAP = {
	[RESOURCE_TYPE_ARTICLE]: 'i_',
	[RESOURCE_TYPE_AUDIO]: 'a_',
	[RESOURCE_TYPE_VIDEO]: 'v_',
	[RESOURCE_TYPE_ALIVE]: 'l_',
	[RESOURCE_TYPE_EBOOK]: 'e_',
	[RESOURCE_TYPE_PACKAGE]: 'p_',
	[RESOURCE_TYPE_ENTITY]: 'g_',
	[RESOURCE_TYPE_CAMP]: 'term_',
	[RESOURCE_TYPE_COMMUNITY]: 'c_',
	[RESOURCE_TYPE_CLOCK]: 'ac_',
	[RESOURCE_TYPE_CONTENT_MARKET]: 'cr_',
	[RESOURCE_TYPE_SVIP]: 's_',
	[RESOURCE_TYPE_SINGLE_BIG_CLASS]: 'bclass_',
	[RESOURCE_TYPE_SRV]: 'SPU_SRV_',
	[RESOURCE_TYPE_EKC]: 'course_',
	[RESOURCE_TYPE_DISCUSS]: 'discuss_',
	[RESOURCE_TYPE_EXAM]: 'ex_',
};

//名称映射
export const RESOURCE_TYPE_MAP = {
	[RESOURCE_TYPE_ARTICLE]: '图文',
	[RESOURCE_TYPE_AUDIO]: '音频',
	[RESOURCE_TYPE_VIDEO]: '视频',
	[RESOURCE_TYPE_ALIVE]: '直播',
	[RESOURCE_TYPE_MEMBER]: '会员',
	[RESOURCE_TYPE_PACKAGE]: '专栏',
	[RESOURCE_TYPE_COMMUNITY]: '社群',
	[RESOURCE_TYPE_TOPIC]: '大专栏',
	[RESOURCE_TYPE_ACTIVITY]: '活动管理',
	[RESOURCE_TYPE_EXERCISE_BOOK]: '作业',
	[RESOURCE_TYPE_CLOCK]: '打卡',
	[RESOURCE_TYPE_EBOOK]: '电子书',
	[RESOURCE_TYPE_ENTITY]: '实物商品',
	[RESOURCE_TYPE_CONTENT_MARKET]: '分销商品',
	[RESOURCE_TYPE_SVIP]: '超级会员',
	[RESOURCE_TYPE_CAMP]: '训练营',
	[RESOURCE_TYPE_EXAM]: '考试',
	[RESOURCE_TYPE_COURSE_OFFLINE]: '面授课',
	[RESOURCE_TYPE_SMALL_CLASS]: '小班课',
	[RESOURCE_TYPE_PRACTICE]: '练习本',
	[RESOURCE_TYPE_SINGLE_BIG_CLASS]: '大班课',
	[RESOURCE_TYPE_PAID_COUPON]: '有价优惠券',
	[RESOURCE_TYPE_OFFLINE_PACKAGE_COURSE]: '课时包',
	[RESOURCE_TYPE_AI_INTERACTION]: 'AI互动课',
	[RESOURCE_TYPE_REDEEM_CODE]: '兑换码',
	[RESOURCE_TYPE_INVITE_CODE]: '邀请码',
	[RESOURCE_TYPE_PROMO_CODE]: '优惠码',
	[RESOURCE_TYPE_COUPON]: '优惠券',
	[RESOURCE_TYPE_SRV]: '服务类商品',
	[RESOURCE_TYPE_EKC]: '课程',
	[RESOURCE_TYPE_DISCUSS]: '讨论任务',
};

export const RESOURCE_ADMIN_LINK_MAP = {
	[RESOURCE_TYPE_ARTICLE]: `${ADMIN_HOST}/t/course/text/detail/%resourceId`,
	[RESOURCE_TYPE_AUDIO]: `${ADMIN_HOST}/t/course/audio/detail/%resourceId`,
	[RESOURCE_TYPE_VIDEO]: `${ADMIN_HOST}/t/course/video/detail/%resourceId`,
	[RESOURCE_TYPE_ALIVE]: `${ADMIN_HOST}/t/live#/detail?id=l_655ac8d7e4b04c100fc7ad69`,
	[RESOURCE_TYPE_MEMBER]: `${ADMIN_HOST}/t/course/member/detail/%resourceId`,
	[RESOURCE_TYPE_PACKAGE]: `${ADMIN_HOST}/t/course/column/detail/%resourceId`,
	[RESOURCE_TYPE_COMMUNITY]: `${ADMIN_HOST}/smallCommunity/communityList#/community_manage/content_settings/feed_list?communityId=%resourceId&type=manage`,
	[RESOURCE_TYPE_TOPIC]: `${ADMIN_HOST}/t/course/big_column/detail/%resourceId`,
	[RESOURCE_TYPE_ACTIVITY]: `${ADMIN_HOST}/t/activity/activityManage#/publishActivity/%resourceId`,
	[RESOURCE_TYPE_EXERCISE_BOOK]: `${ADMIN_HOST}/t/exam/exercise#/exercise/exercise_list?exercise_book_id=%resourceId`,
	[RESOURCE_TYPE_CLOCK]: `${ADMIN_HOST}/punch_card/punchCalendar#/punchDetail/diaryList?activity_id=%resourceId`,
	[RESOURCE_TYPE_EBOOK]: `${ADMIN_HOST}/t/course/ebook/detail/%resourceId`,
	[RESOURCE_TYPE_ENTITY]: `${ADMIN_HOST}/t/ecommerce/goods/entity#/resource_list_page`,
	[RESOURCE_TYPE_CONTENT_MARKET]: `${ADMIN_HOST}#xerun_nosupport_jump`,
	[RESOURCE_TYPE_SVIP]: `${ADMIN_HOST}/t/user_operation/index#/index/svipList?svip_id=%resourceId-1`,
	[RESOURCE_TYPE_CAMP]: `${ADMIN_HOST}/t/training_camp#/camp_period_manage`,
	[RESOURCE_TYPE_EXAM]: `${ADMIN_HOST}/t/exam/examination#/examIndex/appraiseList?tab_type=0&exam_id=%resourceId`,
	[RESOURCE_TYPE_COURSE_OFFLINE]: `${ADMIN_HOST}#xerun_nosupport_jump`,
	[RESOURCE_TYPE_SMALL_CLASS]: `${ADMIN_HOST}#xerun_nosupport_jump`,
	[RESOURCE_TYPE_PRACTICE]: `${ADMIN_HOST}/t/exam/practiceBook#/practiceBook/practiceEdit?editId=%resourceId`,
	[RESOURCE_TYPE_SINGLE_BIG_CLASS]: `${ADMIN_HOST}#xerun_nosupport_jump`,
	[RESOURCE_TYPE_PAID_COUPON]: `${ADMIN_HOST}#xerun_nosupport_jump`,
	[RESOURCE_TYPE_OFFLINE_PACKAGE_COURSE]: `${ADMIN_HOST}#xerun_nosupport_jump`,
	[RESOURCE_TYPE_AI_INTERACTION]: `${ADMIN_HOST}/t/course/ai/detail/%resourceId`,
	[RESOURCE_TYPE_REDEEM_CODE]: `${ADMIN_HOST}#xerun_nosupport_jump`,
	[RESOURCE_TYPE_INVITE_CODE]: `${ADMIN_HOST}#xerun_nosupport_jump`,
	[RESOURCE_TYPE_PROMO_CODE]: `${ADMIN_HOST}#xerun_nosupport_jump`,
	[RESOURCE_TYPE_COUPON]: `${ADMIN_HOST}#xerun_nosupport_jump`,
	[RESOURCE_TYPE_SRV]: `${ADMIN_HOST}#xerun_nosupport_jump`,
	[RESOURCE_TYPE_EKC]: `${ADMIN_HOST}/t/course/camp_pro/detail/%resourceId`,
	[RESOURCE_TYPE_DISCUSS]: `${ADMIN_HOST}#xerun_nosupport_jump`,
};

export const RESOURCE_H5_LINK_MAP = {
	[RESOURCE_TYPE_ARTICLE]: `${H5_HOST}`,
	[RESOURCE_TYPE_AUDIO]: `${H5_HOST}`,
	[RESOURCE_TYPE_VIDEO]: `${H5_HOST}`,
	[RESOURCE_TYPE_ALIVE]: `${H5_HOST}`,
	[RESOURCE_TYPE_MEMBER]: `${H5_HOST}`,
	[RESOURCE_TYPE_PACKAGE]: `${H5_HOST}`,
	[RESOURCE_TYPE_COMMUNITY]: `${H5_HOST}/xe.community.community_service/v2/feedList?app_id=%appId&community_id=%resourceId`,
	[RESOURCE_TYPE_TOPIC]: `${H5_HOST}`,
	[RESOURCE_TYPE_ACTIVITY]: `${H5_HOST}`,
	[RESOURCE_TYPE_EXERCISE_BOOK]: `${H5_HOST}`,
	[RESOURCE_TYPE_CLOCK]: `${H5_HOST}`,
	[RESOURCE_TYPE_EBOOK]: `${H5_HOST}`,
	[RESOURCE_TYPE_ENTITY]: `${H5_HOST}`,
	[RESOURCE_TYPE_CONTENT_MARKET]: `${H5_HOST}`,
	[RESOURCE_TYPE_SVIP]: `${H5_HOST}`,
	[RESOURCE_TYPE_CAMP]: `${H5_HOST}`,
	[RESOURCE_TYPE_EXAM]: `${H5_HOST}`,
	[RESOURCE_TYPE_COURSE_OFFLINE]: `${H5_HOST}`,
	[RESOURCE_TYPE_SMALL_CLASS]: `${H5_HOST}`,
	[RESOURCE_TYPE_PRACTICE]: `${H5_HOST}`,
	[RESOURCE_TYPE_SINGLE_BIG_CLASS]: `${H5_HOST}`,
	[RESOURCE_TYPE_PAID_COUPON]: `${H5_HOST}`,
	[RESOURCE_TYPE_OFFLINE_PACKAGE_COURSE]: `${H5_HOST}`,
	[RESOURCE_TYPE_AI_INTERACTION]: `${H5_HOST}`,
	[RESOURCE_TYPE_REDEEM_CODE]: `${H5_HOST}`,
	[RESOURCE_TYPE_INVITE_CODE]: `${H5_HOST}`,
	[RESOURCE_TYPE_PROMO_CODE]: `${H5_HOST}`,
	[RESOURCE_TYPE_COUPON]: `${H5_HOST}`,
	[RESOURCE_TYPE_SRV]: `${H5_HOST}`,
	[RESOURCE_TYPE_EKC]: `${H5_HOST}`,
	[RESOURCE_TYPE_DISCUSS]: `${H5_HOST}`,
};
export const RESOURCE_PC_LINK_MAP = {
	[RESOURCE_TYPE_ARTICLE]: `${PC_HOST}`,
	[RESOURCE_TYPE_AUDIO]: `${PC_HOST}`,
	[RESOURCE_TYPE_VIDEO]: `${PC_HOST}`,
	[RESOURCE_TYPE_ALIVE]: `${PC_HOST}`,
	[RESOURCE_TYPE_MEMBER]: `${PC_HOST}`,
	[RESOURCE_TYPE_PACKAGE]: `${PC_HOST}`,
	[RESOURCE_TYPE_COMMUNITY]: 'https://quanzi.xiaoe-tech.com/%resourceId/feed_list?app_id=%appId',
	[RESOURCE_TYPE_TOPIC]: `${PC_HOST}`,
	[RESOURCE_TYPE_ACTIVITY]: `${PC_HOST}`,
	[RESOURCE_TYPE_EXERCISE_BOOK]: `${PC_HOST}`,
	[RESOURCE_TYPE_CLOCK]: `${PC_HOST}`,
	[RESOURCE_TYPE_EBOOK]: `${PC_HOST}`,
	[RESOURCE_TYPE_ENTITY]: `${PC_HOST}`,
	[RESOURCE_TYPE_CONTENT_MARKET]: `${PC_HOST}`,
	[RESOURCE_TYPE_SVIP]: `${PC_HOST}`,
	[RESOURCE_TYPE_CAMP]: `${PC_HOST}`,
	[RESOURCE_TYPE_EXAM]: `${PC_HOST}`,
	[RESOURCE_TYPE_COURSE_OFFLINE]: `${PC_HOST}`,
	[RESOURCE_TYPE_SMALL_CLASS]: `${PC_HOST}`,
	[RESOURCE_TYPE_PRACTICE]: `${PC_HOST}`,
	[RESOURCE_TYPE_SINGLE_BIG_CLASS]: `${PC_HOST}`,
	[RESOURCE_TYPE_PAID_COUPON]: `${PC_HOST}`,
	[RESOURCE_TYPE_OFFLINE_PACKAGE_COURSE]: `${PC_HOST}`,
	[RESOURCE_TYPE_AI_INTERACTION]: `${PC_HOST}`,
	[RESOURCE_TYPE_REDEEM_CODE]: `${PC_HOST}`,
	[RESOURCE_TYPE_INVITE_CODE]: `${PC_HOST}`,
	[RESOURCE_TYPE_PROMO_CODE]: `${PC_HOST}`,
	[RESOURCE_TYPE_COUPON]: `${PC_HOST}`,
	[RESOURCE_TYPE_SRV]: `${PC_HOST}`,
	[RESOURCE_TYPE_EKC]: `${PC_HOST}`,
	[RESOURCE_TYPE_DISCUSS]: `${PC_HOST}`,
};

export const getResourceInfoUrl = (appId, resourceId, resourceType, system) => {
	let linkMap = {
		[SYS_ADMIN]: RESOURCE_ADMIN_LINK_MAP,
		[SYS_H5]: RESOURCE_H5_LINK_MAP,
		[SYS_PC]: RESOURCE_PC_LINK_MAP,
	};
	if(linkMap[system] === undefined){
		throw `system error:${system}`;
	}
	let linkPattern = linkMap[system][resourceType];
	if(linkPattern === undefined){
		throw `resource type link no supported:${system} / ${resourceType}`;
	}
	return linkPattern.replace('%resourceId', resourceId).replace('%appId', appId);
}


/**
 * 解析文本中包含的资源ID（去重）
 * @param {String} txt
 * @returns {unknown[]}
 */
export const resolveResourceIdList = (txt) => {
	let id_list = {};
	for(let type in RESOURCE_PREFIX_MAP){
		let ids = resolveIdList(txt, RESOURCE_PREFIX_MAP[type]);
		ids.forEach(id => {
			id_list[id] = {type, id};
		});
	}
	return Object.values(id_list);
}

/**
 * 解析指定前缀id列表
 * @param txt
 * @param prefix
 * @param sizeLimit
 * @returns {unknown[]}
 */
const resolveIdList = (txt, prefix, sizeLimit = [20, 26]) => {
	let id_list = {};
	txt = ` ${txt} `;
	let reg = new RegExp("\\W(" + regQuote(prefix) + `[A-Za-z0-9_]{${sizeLimit[0]},${sizeLimit[1]}})`, 'igm');
	let matches = Array.from(txt.matchAll(reg));
	if(matches && matches.length){
		matches.forEach(([o, id]) => {
			id_list[id] = id;
		});
	}
	return Object.values(id_list);
}

/**
 * 提取圈子ID列表
 * @param txt
 * @returns {String[]}
 */
export const resolveCommunityId = (txt) => {
	let cid_list = [];
	resolveResourceIdList(txt).forEach(({type, id}) => {
		if(type === RESOURCE_TYPE_COMMUNITY){
			cid_list.push(id);
		}
	});
	return cid_list;
}

/**
 * 提取店铺ID列表
 * @param txt
 * @returns {String[]}
 */
export const resolveAppIds = (txt) => {
	return resolveIdList(txt, 'app', [12, 12]);
};

/**
 * 提取用户ID列表
 * @param txt
 * @returns {String[]}
 */
export const resolveUserIds = (txt) => {
	return resolveIdList(txt, 'u_', [20, 30]);
}