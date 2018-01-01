export interface IReference {
    path?: string;
    async?: boolean;
    isJS?: boolean;
    isCC?: boolean;
    useESM?: boolean;
    preemptive?: boolean;
    el: HTMLLinkElement;
}

(function () {
    const xtal_sip = 'xtal-sip';
    if(customElements.get(xtal_sip)) return;
    const originalDefine = customElements.define;
    const boundDefine = originalDefine.bind(window.customElements);
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
        static _lM: { [key: string]: IReference[] };
        static _added: { [key: string]: boolean } = {};
        static _loaded: { [key: string]: string } = {};
        static useJITLoading = false;

        //static _preemptive: { [key: string]: boolean } = {};
        static _tB: (tagName: string, candidates: HTMLLinkElement[]) => IReference; //tie breaker
        static _sub: (link: HTMLLinkElement) => void;
        // static set tieBreaker(val: (tagName: string, options: IReference[]) => IReference) {
        //     XtalSip._tieBreaker = val;
        // }

        replace(str, find, replace) {
            return str.replace(new RegExp(find, 'g'), replace);
        }
        static get(tagName) {
            if(!XtalSip._lM) return; //this happens when boostrapping xtal sip.
            const lookupOptions = XtalSip._lM[tagName];
            if (!lookupOptions) return;
            if (lookupOptions.length > 1) {
                throw "Duplicate tagname found: " + tagName;
                // return XtalSip._tieBreaker(tagName, lookupOptions);
            } else {
                return lookupOptions[0];
            }
        }
        static loadDeps(tagNames: string[]) {
            tagNames.forEach(tagName => XtalSip.loadDep(tagName))
        }
        static loadDep(tagName: string) {
            XtalSip._added[tagName] = true;
            const lookup = this.get(tagName);
            if (!lookup) return;
            if (XtalSip._loaded[lookup.path]) return;
            if (customElements.get(tagName)) return;
            let newTag;
            let target = document.head as HTMLElement;
            if (lookup.isJS) {
                newTag = document.createElement('script');
                newTag.src = lookup.path;
            }else if(lookup.isCC){
                newTag = document.createElement('c-c');
                newTag.setAttribute('href', lookup.path);
                target = document.body
            } else {
                newTag = document.createElement("link");
                newTag.setAttribute("rel", "import");
                newTag.setAttribute("href", lookup.path);
            }
            if (lookup.async) newTag.setAttribute('async', '');
            setTimeout(() => {
                target.appendChild(newTag);
            }, 50);
        }
        qsa(css, from?: HTMLElement | Document): HTMLElement[] {
            return [].slice.call((from ? from : this).querySelectorAll(css));
        }
        // get_h() {
        //     let parentElement = this.parentElement;
        //     while (parentElement) {
        //         const sr = parentElement.shadowRoot;
        //         if (sr) return sr;
        //         parentElement = parentElement.parentElement;
        //     }
        //     return document.body;
        // }
        // process_h(h: HTMLElement | ShadowRoot) {
        //     if (!h) return;
        //     const lm = XtalSip._lM;
        //     for (const key in XtalSip._added) {
        //         delete lm[key];
        //     }
        //     XtalSip._added = {};
        //     for (const key in lm) {
        //         if (XtalSip._added[key]) continue;
        //         const ref = XtalSip.get(key);
        //         if (ref.preemptive) {
        //             XtalSip.loadDep(key);
        //             continue;
        //         }
        //         if (h.querySelector(key)) {
        //             XtalSip.loadDep(key);

        //         }
        //     }
        // }
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
                //const alreadyAdded = {};
                //debugger;
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
                // this.qsa('link[rel-ish="preload"]', document.head).forEach(el => {
                goodEls.forEach(el =>{
                    //const isPreemptive = el.dataset.preemptive !== undefined;
                    const isAsync = el.dataset.async !== undefined;
                    //const isPreFetch = el.getAttribute('rel-ish') === 'prefetch'
                    const href = el.getAttribute('href');
                    el.dataset.tags.split(',').forEach(tag => {
                        //if (isPreemptive) XtalSip._preemptive[tag] = true;
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
                    let needTieBreaking = false;
                    const newRef = {
                        //hre el['href']
                        path: el.getAttribute('href'),
                        async: el.dataset.async !== undefined,
                        isJS: el.getAttribute('as') === 'script',
                        isCC: el.dataset.importer === 'c-c',
                        preemptive: el.dataset.preemptive !== undefined,
                        el: el
                    } as IReference;
                    const oldRef = XtalSip._lM[tag]
                    if (!oldRef) {
                        XtalSip._lM[tag] = [];
                    } 
                    XtalSip._lM[tag].push(newRef);
                    //XtalSip._lookupMap[tag].push();
                });

            }
            this.getAttribute('load').split(',').forEach(tag => {
                //console.log('loading ' + tag);
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