import {PreemptiveLoadingArgument} from './types.d.js';

//TODO:  return import when available?
export async function preemptiveImport(arg: PreemptiveLoadingArgument){
    const linkTagId = arg[0];
    if(linkTagId !== undefined){
        const linkTag = self[linkTagId] as HTMLLinkElement | undefined;
        if(linkTag === undefined){
            if(document.readyState === 'loading'){
                document.addEventListener('DOMContentLoaded', e => {
                    preemptiveImport(arg);
                });
                return;
            }
        }else{
            if(linkTag.localName === 'link'){ //security precaution
                if(linkTag.dataset.loaded === 'true'){
                    return;
                }
                //TODO:  dry
                switch(linkTag.rel){
                    case 'modulelazyload':
                    case 'modulepreload':{
                        const scriptTag = document.createElement('script');
                        scriptTag.type = 'module';
                        scriptTag.integrity = linkTag.integrity;
                        scriptTag.src = linkTag.href;
                        scriptTag.crossOrigin = linkTag.crossOrigin
                        document.head.appendChild(scriptTag);
                        linkTag.dataset.loaded = 'true';
                        return;
                    }
                    case 'lazyload':
                    case 'preload':{
                        switch(linkTag.as){
                            case 'script':{
                                const scriptTag = document.createElement('script');
                                scriptTag.integrity = linkTag.integrity;
                                scriptTag.crossOrigin = linkTag.crossOrigin;
                                scriptTag.src = linkTag.href;
                                document.head.appendChild(scriptTag);
                                linkTag.dataset.loaded = 'true';
                                return;
                            }
                            case 'style':{
                                const styleTag = document.createElement('link');
                                styleTag.rel = 'stylesheet';
                                styleTag.integrity = linkTag.integrity;
                                styleTag.crossOrigin = linkTag.crossOrigin;
                                styleTag.href = linkTag.href;
                                document.head.appendChild(styleTag);
                                return;
                            }
                        }
                    }
                }

            }
        }
    }
    //No go for linkTag, try importmap.
    const dynamicImport = arg[1];
    switch(typeof dynamicImport){
        case 'function':{
            try{
                await dynamicImport();
                return;
            }catch(e){}
        }
    }
    //No luck with importMap, try CDN
    const CDNPath = arg[2];
    const options = arg[3];
    if(CDNPath !== undefined){
        if(options !== undefined){
            const cssScope = options.cssScope;
            if(cssScope !== undefined){
                switch(cssScope){
                    case 'global':
                        const styleTag = document.createElement('link');
                        styleTag.rel = 'stylesheet';
                        styleTag.href = CDNPath;
                        document.head.appendChild(styleTag);
                        break;
                    case 'shadow':
                        throw 'No idea how to implement'
                }
            }else{
                import(CDNPath);
            }
        }else{
            import(CDNPath);
        }
    }else{
        throw `Unable to resolve ${linkTagId} and ${dynamicImport.toString()}`; 
    }
}