console.log('background started');

const openTabOnce = (url, onComplete)=>{
    chrome.tabs.create({active:false, url:url}, tab=>{
        console.log('tab.id', tab.id);
        let id = tab.id;
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab)=>{
            if(tabId === id && changeInfo.status && changeInfo.status === 'complete'){
                console.log('complete');
                setTimeout(()=>{
                    chrome.tabs.remove(tab.id);
                    onComplete();
                }, 1000);
            }
        });
    });
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse)=>{
    switch(request?.action){
        case 'openTabOnce':
            openTabOnce(request.url, ()=>{
                console.log('[bg] sendResponse');
                sendResponse();
            });
            return;
    }
    throw "no action found";
});
