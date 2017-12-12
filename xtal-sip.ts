
(function () {
    interface IReference {
        path?: string;
        async?: boolean;
        isScript?: boolean;
        useES6Module?: boolean;
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
        static _lookupMap: { [key: string]: IReference };
        static _alreadyAdded: { [key: string]: boolean } = {};
        static _preemptive: { [key: string]: boolean } = {};
        static get is() { return 'xtal-sip'; }


        replaceAll(str, find, replace) {
            return str.replace(new RegExp(find, 'g'), replace);
        }

        loadDependency(tagName: string) {
            XtalSip._alreadyAdded[tagName] = true;
            let lookup = XtalSip._lookupMap[tagName];
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
            for (const key in XtalSip._lookupMap) {
                if (XtalSip._alreadyAdded[key]) continue;
                if (XtalSip._preemptive[key] || h.querySelector(key) || this.parentElement.querySelector(key)) {
                    this.loadDependency(key);

                }
            }
        }
        connectedCallback() {
            if (!XtalSip._lookupMap) {
                document.body.addEventListener('dom-change', e => {
                    const src = e.srcElement as HTMLElement
                    this.process_h(src);
                    this.process_h(src.previousElementSibling as HTMLElement) //for dom bind
                })
                XtalSip._lookupMap = {};

                this.qsa('link[rel-ish="preload"]', document.head).forEach(el => {
                    const isPreemptive = el.dataset.preemptive !== undefined;
                    const isAsync = el.dataset.async !== undefined;
                    //const isPreFetch = el.getAttribute('rel-ish') === 'prefetch'
                    const href = el.getAttribute('href');
                    el.dataset.tags.split(',').forEach(tag => {
                        if (isPreemptive) XtalSip._preemptive[tag] = true;
                        let modifiedHref = href;
                        let counter = 0;
                        tag.split('-').forEach(token => {
                            modifiedHref = this.replaceAll(modifiedHref, '\\{' + counter + '\\}', token);
                            counter++;
                        });
                        //from https://developer.mozilla.org/en-US/docs/Web/HTML/Preloading_content
                        const preloadLink = document.createElement("link") as HTMLLinkElement;
                        preloadLink.href = modifiedHref;
                        preloadLink.rel = 'preload';
                        preloadLink['as'] = el['as'];
                        preloadLink.dataset.tag = tag;
                        document.head.appendChild(preloadLink);
                    });

                });
                this.qsa('link[rel="preload"][data-tag]', document.head).forEach(el => {
                    const tag = el.dataset.tag;
                    XtalSip._lookupMap[tag] = {
                        //hre el['href']
                        path: el.getAttribute('href'),
                        async: el.dataset.async !== undefined,
                        isScript: el['as'] === 'script',
                    } as IReference;
                    XtalSip._preemptive[tag] = el.dataset.preemptive !== undefined;
                });
            }
            const h = this.get_h();
            this.process_h(h);



        }


    }
    customElements.define('xtal-sip', XtalSip);
})();