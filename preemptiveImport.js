export function preemptiveImport(arg) {
    const linkTagId = arg[0];
    if (linkTagId !== undefined) {
        const linkTag = self[linkTagId];
        if (linkTag === undefined) {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', e => {
                    preemptiveImport(arg);
                });
                return;
            }
        }
        else {
            if (linkTag.localName === 'link') { //security precaution
                if (linkTag.dataset.loaded === 'true') {
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
    if (dynamicImport !== undefined) {
        try {
            dynamicImport();
            return;
        }
        catch (e) { }
    }
    //No luck with dynamic import, try CDN
    const CDNPath = arg[2];
    if (CDNPath !== undefined) {
        import(CDNPath);
    }
}
