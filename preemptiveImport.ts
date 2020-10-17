import {PreemptiveLoadingTuple} from './types.d.js';
export function preemptiveImport(arg: PreemptiveLoadingTuple){
    const linkTagId = arg[0];
    if(linkTagId !== undefined){
        const linkTag = self[linkTagId] as HTMLLinkElement | undefined;
        if(linkTag === undefined){
            //TODO:  add wait for xtal-sip tag.
        }else{
            if(linkTag.localName === 'link'){ //security precaution
                if(linkTag.dataset.loaded === 'true'){
                    return;
                }
                //TODO:  non modules and style links
                const scriptTag = document.createElement('script');
                scriptTag.type = 'module';
                scriptTag.integrity = linkTag.integrity;
                scriptTag.src = linkTag.href;
                document.head.appendChild(scriptTag);
                linkTag.dataset.loaded = 'true';
                return;
            }
        }
    }
    //No go for linkTag, try importmap.
    const dynamicImport = arg[1];
    if(dynamicImport !== undefined){
        try{
            dynamicImport();
            return;
        }catch(e){}
    }
    //No luck with dynamic import, try CDN
    const CDNPath = arg[2];
    if(CDNPath !== undefined){
        import(CDNPath);
    }
}