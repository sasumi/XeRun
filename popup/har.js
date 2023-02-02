import {buildCookieCmd, batchAddListener} from "../common/function.js";

let dropZoneDom = document.querySelector('.drop-file-zone');
let dropFile = document.querySelector('.drop-file-zone input[type=file]');
let dropFileTip = document.querySelector('.drop-file-zone .tip');
let resultDom = document.querySelector('.result-zone');

const resultHarStr = (str)=>{
    try {
        let json = JSON.parse(str);
        let link = json.log.entries[0].request.url;
        let cookie = buildCookieCmd(json.log.entries[0].request.cookies);
        let code = `document.cookie = "${cookie}"`;
        return {link, code};
    } catch(error){
        return {error};
    }
}

const resolveHarFile = file => {
    let fr = new FileReader();
    resultDom.innerHTML = '<span class="loading">resolving</span>';
    fr.onload = ()=>{
        let {error, link, code} = resultHarStr(fr.result);
        if(error){
            resultDom.innerHTML = `<span class="error">${error}</span>`;
        } else{
            resultDom.innerHTML = `
            <dl class="result">
                    <dt>解析结果</dt>
                    <dd>
                        <ol>
                            <li>访问页面 <a target="_blank" href="${link}">${link}</a>，并打开控制台（F12）</li>
                            <li>
                                复制以下控制台命令，并回车执行
                                <code>${code}</code>
                            </li>
                        </ol>
                    </dd>
                </dl>
            `;
        }
    };
    fr.readAsText(file);
};

batchAddListener(dropFile, ['dragover','mouseout','dragleave','mouseup'], e=>{dropZoneDom.classList.add('dragover')});
dropFile.addEventListener('change', e => {
    let file = dropFile.files[0];
    if(file){
        dropFileTip.innerHTML = `${file.name}<br/><u>重新选择</u>`;
        resolveHarFile(file);
    } else {
        dropFileTip.innerHTML = '请选择Har文件';
    }
});
dropFile.addEventListener('drop', e=>{
    debugger;
    console.log(e);
    dropZoneDom.classList.remove('dragover');
    e.preventDefault();
    if(e.dataTransfer.files){
        [...e.dataTransfer.files].forEach(file=>{
            dropFileTip.innerHTML = `${file.name}<br/><u>重新选择</u>`;
            resolveHarFile(file);
        });
    }
});
