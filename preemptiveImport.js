export function preemptiveImport(arg) {
    const linkTagId = arg[0];
    if (linkTagId !== undefined) {
        const linkTag = self[linkTagId];
        if (linkTag === undefined) {
            //TODO:  add wait for xtal-sip tag.
        }
        else {
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
