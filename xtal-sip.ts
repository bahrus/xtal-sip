export interface IReference {
    // path?: string;
    // async?: boolean;
    // //isJS?: boolean;
    // //isCC?: boolean;
    // //useESM?: boolean;
    // type?: string;
    // preemptive?: boolean;
    el: HTMLLinkElement;
}

(function () {
    const xtal_sip = 'xtal-sip';
    if(customElements.get(xtal_sip)) return;
    const originalDefine = customElements.define;
    const boundDefine = originalDefine.bind(customElements);
    customElements.define = function(name: string, cls: any){
        const lookup = XtalSip.get(name);
        if(lookup){
            Object.assign(cls, lookup.el.dataset);
        }
        boundDefine(name, cls);
    }
    /**
    * `xtal-sip`
    * Dynamically load custom elements from central config file. 
    *
    * @customElement
    * @polymer
    * @demo demo/index.html
    */
    class XtalSip extends HTMLElement {
        static _lM: { [key: string]: IReference};
        static _added: { [key: string]: boolean } = {};
        static useJITLoading = false;

        static _tB: (tagName: string, candidates: HTMLLinkElement[]) => IReference; //tie breaker
        static _sub: (link: HTMLLinkElement) => void;
        
        replace(str, find, replace) {
            return str.replace(new RegExp(find, 'g'), replace);
        }
        static get(tagName) : IReference {
            let a;
            if(!(a = XtalSip._lM) || !(a = a[tagName])) return; //this happens when boostrapping xtal sip.
            return a as IReference;
        }
        static loadDeps(tagNames: string[]) {
            tagNames.forEach(tagName => XtalSip.loadDep(tagName))
        }
        static loadDep(tagName: string) {
            XtalSip._added[tagName] = true;
            const lookup = this.get(tagName);
            if (!lookup) return;
            const el = lookup.el, d=el.dataset;
            if (customElements.get(tagName)) return;
            let nodeName, pathName;
            switch(el.getAttribute('as')){
                case 'document':
                    nodeName = d['importer'] ? 'c-c' : 'link';
                    pathName = 'href';
                    break;
                case 'script':
                    nodeName = 'script';
                    pathName = 'src';
                    break;

            }
            let target = d['importer'] ? document.body : document.head as HTMLElement;

            const newTag = document.createElement(nodeName);
            newTag.setAttribute(pathName, el.getAttribute('href'));
            newTag.setAttribute('rel', 'import');  // no harm done for other types
            if (el['async']) newTag.setAttribute('async', '');
            setTimeout(() => {
                target.appendChild(newTag);
            }, 50);
        }
        qsa(css, from?: HTMLElement | Document): HTMLElement[] {
            return [].slice.call((from ? from : this).querySelectorAll(css));
        }

        connectedCallback() {
            if (!XtalSip._lM) {
                XtalSip._lM = {};
                const tagToFakeLink = {};
                this.qsa('link[rel-ish="preload"]', document.head).forEach(el => {
                    if(XtalSip._sub) XtalSip._sub(el as HTMLLinkElement); //substitution
                    el.dataset.tags.split(',').forEach(tag => {
                        if(!tagToFakeLink[tag]) tagToFakeLink[tag] = [];
                        tagToFakeLink[tag].push(el);
                    })
                });
                const goodEls = [];
                for(var key in tagToFakeLink){
                    const els = tagToFakeLink[key];
                    let elToAdd;
                    if(els.length === 1) {
                        elToAdd = els[0];
                    }else{
                        if(XtalSip._tB){
                            elToAdd = XtalSip._tB(key, els);
                        }
                    }
                    if(elToAdd){
                        if(elToAdd['alreadyAdded']) continue;
                        elToAdd['alreadyAdded'] = true;
                        goodEls.push(elToAdd);
                    }
                }
                goodEls.forEach(el =>{
                    const isAsync = el.dataset.async !== undefined;
                    const href = el.getAttribute('href');
                    el.dataset.tags.split(',').forEach(tag => {
                        let modifiedHref = href;
                        let counter = 0;
                        tag.split('-').forEach(token => {
                            modifiedHref = this.replace(modifiedHref, '\\{' + counter + '\\}', token);
                            counter++;
                        });
                        let base = el.dataset.base;
                        if (!base) {
                            const baseRef = el.dataset.baseRef;
                            if (baseRef) base = document.querySelector(baseRef).dataset.base;
                        }
                        if (!base) base = '';
                        modifiedHref = base + modifiedHref;
                        //from https://developer.mozilla.org/en-US/docs/Web/HTML/Preloading_content

                        const preloadLink = document.createElement("link") as HTMLLinkElement;
                        preloadLink.href = modifiedHref;
                        preloadLink.rel = 'preload';
                        preloadLink.setAttribute('as', el.getAttribute('as'));
                        preloadLink.dataset.tag = tag;
                        Object.assign(preloadLink.dataset, el.dataset);
                        document.head.appendChild(preloadLink);
                    });

                });
                //}
                this.qsa('link[rel="preload"][data-tag]', document.head).forEach(el => {
                    const tag = el.dataset.tag;
                    const newRef = {
                        el: el
                    } as IReference;
                    XtalSip._lM[tag] = newRef;
                });

            }
            this.getAttribute('load').split(',').forEach(tag => {
                XtalSip.loadDep(tag);
            })

        }


    }
    const detail = {};
    document.head.dispatchEvent(new CustomEvent(xtal_sip + '-init', {
        detail: detail,
    } as CustomEventInit));
    XtalSip._tB = detail['tieBreaker'];
    XtalSip._sub = detail['substitutor'];
    customElements.define(xtal_sip, XtalSip);

    document.addEventListener("DOMContentLoaded", e => { 
        const xs = document.createElement(xtal_sip);
        xs.setAttribute('load', 'dom-bind');
        document.body.appendChild(xs);
    });


})();