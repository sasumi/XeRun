import {
    escapeHtml,
    fireEvent,
    hide,
    listenEvent,
    show
} from "../common/common.js";

const TYPE_TEXT = 'text';
const TYPE_MARKDOWN = 'markdown';
const TYPE_NEWS = 'news';

const markdown2Html = txt => {
    txt = "\n"+txt+"\n";
    let maskTxt = txt.replace(/<font\s*color="(.*?)"\s*\>/ig, '__COLOR_START_$1__')
        .replace(/<\/font>/ig, '__COLOR_END__')
        .replace(/\*\*(.*?)\*\*/g, "__STRONG_START__$1__STRONG_END__")
        .replace(/\n>\s+([^\n]+)/mg, "\n__QUOTE_START__$1__QUOTE_END__")
        .replace(/\n######\s(.*?)\n/mg, "\n__H6_START__$1__H6_END__")
        .replace(/\n#####\s(.*?)\n/mg, "\n__H5_START__$1__H5_END__")
        .replace(/\n####\s(.*?)\n/mg, "\n__H4_START__$1__H4_END__")
        .replace(/\n###\s(.*?)\n/mg, "\n__H3_START__$1__H3_END__")
        .replace(/\n##\s(.*?)\n/mg, "\n__H2_START__$1__H2_END__")
        .replace(/\n#\s(.*?)\n/mg, "\n__H1_START__$1__H1_END__")
        .trim();
    let maskHtml = escapeHtml(maskTxt);
    maskHtml = maskHtml.replace(/\[(.*?)\]\((.*?)\)/g, function(m, title, link){
       return `<a href="${link}" target="_blank">${title||link}</a>`;
    });

    let html = maskHtml.replace(/__COLOR_START_(.*?)__/g, '<span class="color-$1">')
        .replace(/__H(\d)_START__/g, '<span class="title-$1">')
        .replace(/__H(\d)_END__/g, '</span>')
        .replace(/__COLOR_END__/g, '</span>')
        .replace(/__STRONG_START__/g, '<strong>')
        .replace(/__STRONG_END__/g, '</strong>')
        .replace(/__QUOTE_END__<br\/>__QUOTE_START__/g, '<br/>')
        .replace(/__QUOTE_START__/g, '<quote>')
        .replace(/__QUOTE_END__<br\/>/ig,'</quote>')
        .replace(/__QUOTE_END__/g,'</quote>');

        console.log('txt', JSON.stringify(txt));
        console.log('maskTxt', JSON.stringify(maskTxt));
        console.log('maskHtml', JSON.stringify(maskHtml));
        console.log('html', JSON.stringify(html));
    return html;
};

const previewRobot = (txt, type) => {
    switch(type){
        case TYPE_MARKDOWN:
            return markdown2Html(txt);
        default:
            return escapeHtml(txt);
    }
};

const generateCode = (txt, type, mentioned_list = ['@all'], mentioned_mobile_list = []) => {
    switch (type) {
        case TYPE_TEXT:
        case TYPE_MARKDOWN:
            return `{
                "msgtype": "${type}",
                "${type}": {
                    "content": ${JSON.stringify(txt)},
                    "mentioned_list":${JSON.stringify(mentioned_list)},
                    "mentioned_mobile_list":${JSON.stringify(mentioned_mobile_list)}
                }
            }`;
        case TYPE_NEWS:
            return `{
                "msgtype": "${type}",
                "${type}": {
                   "articles" : [
                       {
                           "title" : "中秋节礼品领取",
                           "description" : "今年中秋节公司有豪礼相送",
                           "url" : "www.qq.com",
                           "picurl" : "http://res.mail.qq.com/node/ww/wwopenmng/images/independent/doc/test_pic_msg1.png"
                       }
                    ]
                }
            }`
        default:
            throw `No supported type:${type}`;
    }
};



let CURRENT_TYPE = TYPE_MARKDOWN;

let txtDom = document.querySelector('.txt');
let previewDom = document.querySelector('.preview-content');
let tabs = document.querySelectorAll('.tab li');
let codeLink = document.querySelector('.code-link');
let codeDom = document.querySelector('.code');

codeLink.addEventListener('click', e => {
    show(codeDom);
    codeDom.value = generateCode(txtDom.value, CURRENT_TYPE);
});

document.body.parentNode.addEventListener('click', e=>{
    if(codeDom.style.display != 'none' &&  e.target !== codeDom && e.target != codeLink){
        console.log('asdfasdf');
        hide(codeDom);
    }
});

tabs.forEach(tab => {
    tab.addEventListener('click', e => {
        tabs.forEach(tab => tab.classList.remove('active'));
        tab.classList.add('active');
        CURRENT_TYPE = tab.getAttribute('data-type');
        fireEvent('TypeChanged', CURRENT_TYPE);
    });
});

listenEvent('TypeChanged', type=>{
    previewDom.innerHTML = previewRobot(txtDom.value, CURRENT_TYPE);
});
txtDom.addEventListener('input', e => {
    previewDom.innerHTML = previewRobot(txtDom.value, CURRENT_TYPE);
});
previewDom.innerHTML = previewRobot(txtDom.value, CURRENT_TYPE);