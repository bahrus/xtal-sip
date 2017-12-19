

(function () {
    interface IReference {
        path?: string;
        async?: boolean;
        isScript?: boolean;
        useES6Module?: boolean;
        preemptive?: boolean;
        element: HTMLLinkElement;
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
        static _lookupMap: { [key: string]: IReference[] };
        static _alreadyAdded: { [key: string]: boolean } = {};
        static _alreadyLoaded: { [key: string]: string } = {};
        static useJITLoading = false;

        //static _preemptive: { [key: string]: boolean } = {};
        static get is() { return 'xtal-sip'; }
        static _tieBreaker: (tagName: string, options: IReference[]) => IReference;
        // static set tieBreaker(val: (tagName: string, options: IReference[]) => IReference) {
        //     XtalSip._tieBreaker = val;
        // }

        replaceAll(str, find, replace) {
            return str.replace(new RegExp(find, 'g'), replace);
        }
        static getLookup(tagName) {
            const lookupOptions = XtalSip._lookupMap[tagName];
            if (!lookupOptions) return;
            if (lookupOptions.length > 1) {
                throw "Duplicate tagname found: " + tagName;
               // return XtalSip._tieBreaker(tagName, lookupOptions);
            } else {
                return lookupOptions[0];
            }
        }
        static loadDependencies(tagNames: string[]){
            tagNames.forEach(tagName => XtalSip.loadDependency(tagName))
        }
        static loadDependency(tagName: string) {
            XtalSip._alreadyAdded[tagName] = true;
            const lookup = this.getLookup(tagName);
            if (!lookup) return;
            if (XtalSip._alreadyLoaded[lookup.path]) return;
            if (customElements.get(tagName)) return;
            let newTag;
            if (lookup.isScript) {
                newTag = document.createElement('script');
                newTag.src = lookup.path;
                //if(lookup.async) scriptTag.setAttribute('async', '');
            } else {
                newTag = document.createElement("link");
                newTag.setAttribute("rel", "import");
                newTag.setAttribute("href", lookup.path);

            }
            if (lookup.async) newTag.setAttribute('async', '');
            setTimeout(() => {
                document.head.appendChild(newTag);
            }, 50);
        }
        qsa(css, from?: HTMLElement | Document): HTMLElement[] {
            return [].slice.call((from ? from : this).querySelectorAll(css));
        }
        get_h() {
            let parentElement = this.parentElement;
            while (parentElement) {
                if (parentElement.shadowRoot) return parentElement.shadowRoot;
                parentElement = parentElement.parentElement;
            }
            return document.body;
        }
        process_h(h: HTMLElement | ShadowRoot) {
            if (!h) return;
            const lm = XtalSip._lookupMap;
            for (const key in XtalSip._alreadyAdded) {
                delete lm[key];
            }
            XtalSip._alreadyAdded = {};
            for (const key in lm) {
                if (XtalSip._alreadyAdded[key]) continue;
                const ref = XtalSip.getLookup(key);
                if (ref.preemptive) {
                    XtalSip.loadDependency(key);
                    continue;
                }
                if (h.querySelector(key)) {
                    XtalSip.loadDependency(key);

                }
            }
        }
        connectedCallback() {
            if (!XtalSip._lookupMap) {
                // document.body.addEventListener('dom-change', e => {
                //     const src = e.srcElement as HTMLElement
                //     this.process_h(src);
                //     this.process_h(src.previousElementSibling as HTMLElement) //for dom bind
                // })
                XtalSip._lookupMap = {};
                //if (!XtalSip.useJITLoading) {

                    this.qsa('link[rel-ish="preload"]', document.head).forEach(el => {
                        //const isPreemptive = el.dataset.preemptive !== undefined;
                        const isAsync = el.dataset.async !== undefined;
                        //const isPreFetch = el.getAttribute('rel-ish') === 'prefetch'
                        const href = el.getAttribute('href');
                        el.dataset.tags.split(',').forEach(tag => {
                            //if (isPreemptive) XtalSip._preemptive[tag] = true;
                            let modifiedHref = href;
                            let counter = 0;
                            tag.split('-').forEach(token => {
                                modifiedHref = this.replaceAll(modifiedHref, '\\{' + counter + '\\}', token);
                                counter++;
                            });
                            let base = el.dataset.base;
                            if(!base){
                                const baseId = el.dataset.baseRef;
                                if(baseId) base = document.getElementById(baseId).dataset.base;
                            }
                            if(!base) base = '';
                            modifiedHref = base + modifiedHref;
                            //from https://developer.mozilla.org/en-US/docs/Web/HTML/Preloading_content

                            const preloadLink = document.createElement("link") as HTMLLinkElement;
                            preloadLink.href = modifiedHref;
                            preloadLink.rel = 'preload';
                            preloadLink['as'] = el['as'];
                            preloadLink.dataset.tag = tag;
                            Object.assign(preloadLink.dataset, el.dataset);
                            document.head.appendChild(preloadLink);
                        });

                    });
                //}
                this.qsa( 'link[rel="preload"][data-tag]', document.head).forEach(el => {
                    const tag = el.dataset.tag;
                    let needTieBreaking = false;
                    const newRef = {
                        //hre el['href']
                        path: el.getAttribute('href'),
                        async: el.dataset.async !== undefined,
                        isScript: el['as'] === 'script',
                        preemptive: el.dataset.preemptive !== undefined,
                        element: el
                    } as IReference;
                    const oldRef = XtalSip._lookupMap[tag]
                    if (!oldRef) {
                        XtalSip._lookupMap[tag] = [newRef];
                    }else if(XtalSip._tieBreaker){
                        const test = [oldRef[0], newRef];
                        const bestRef = XtalSip._tieBreaker(tag, test);
                        XtalSip._lookupMap[tag] = [bestRef];
                    }
                    //XtalSip._lookupMap[tag].push();
                });

            }
            const load = this.getAttribute('load')
            if (load) {
                load.split(',').forEach(tag => {
                    //console.log('loading ' + tag);
                    XtalSip.loadDependency(tag);
                })
            } else {
                this.process_h(this.parentElement);
            }
        }


    }
    const detail = {};
    document.head.dispatchEvent(new CustomEvent('xtal-sip-init', {
        detail: detail,
    } as CustomEventInit));
    XtalSip._tieBreaker = detail['tieBreaker'];
    customElements.define('xtal-sip', XtalSip);

    setTimeout(() =>{
        const xs = document.createElement('xtal-sip');
        xs.setAttribute('load', 'dom-bind');
        document.body.appendChild(xs);
    }, 50);

})();