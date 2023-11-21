import {openSupperAdminLink} from "../common/common.js";

let search = new URLSearchParams(location.search);
let jumpUrl = search.get('jumpUrl');
if(jumpUrl){
	openSupperAdminLink(jumpUrl);
}