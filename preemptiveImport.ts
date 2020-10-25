import {PreemptiveLoadingArgument, IContext} from './types.d.js';

//TODO:  return import when available?
export async function preemptiveImport(arg: PreemptiveLoadingArgument){
    const ctx = arg[3] || {} as IContext;
    arg[3] = ctx;
    let linkTagId = arg[0];
    if(linkTagId !== undefined){
        if(typeof(linkTagId) === 'function'){
            linkTagId = linkTagId(ctx) as string;
        }
        ctx.path = linkTagId;
        const linkTag = self[linkTagId] as HTMLLinkElement | undefined;
        if(linkTag === undefined){
            if(document.readyState === 'loading'){
                document.addEventListener('DOMContentLoaded', e => {
                    preemptiveImport(arg);
                });
                return;
            }else{
                if(self['link-debug']){
                    console.warn(`link tag with id ${linkTagId} not found.`);
                }
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
                const actualPath = await dynamicImport(ctx);
                if(typeof actualPath === 'string'){
                    await import(actualPath);
                }
                return;
            }catch(e){}
        }
    }
    //No luck with importMap, try CDN
    let CDNPath = arg[2];
    const options = arg[4] || {cssScope: 'na'};
    if(CDNPath !== undefined){
        if(typeof CDNPath === 'function'){
            CDNPath = CDNPath(ctx) as string;
        }
        if(options !== undefined && options.cssScope !== 'na'){
            const cssScope = options.cssScope;
            if(cssScope !== undefined){
                const styleTag = document.createElement('link');
                styleTag.rel = 'stylesheet';
                styleTag.href = CDNPath;
                switch(cssScope){
                    case 'global':
                        document.head.appendChild(styleTag);
                        break;
                    case 'shadow':
                        //TODO:  Constructible Stylesheets.
                        options.host.appendChild(styleTag);
                        break;
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