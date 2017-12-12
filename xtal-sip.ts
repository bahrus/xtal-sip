
(function () {
    interface IReference {
        path?: string;
        async?: boolean;
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
        static get is() { return 'xtal-sip'; }


        replaceAll(str, find, replace) {
            return str.replace(new RegExp(find, 'g'), replace);
        }

        loadDependency(tagName: string) {
            //if(XtalSip._alreadyAdded[tagName]) return this.removeAttr(node);
            XtalSip._alreadyAdded[tagName] = true;
            //if(customElements.get(tagName)) return this.removeAttr(node);
            let lookup = XtalSip._lookupMap[tagName];


            const link = document.createElement("link");
            link.setAttribute("rel", "import");
            link.setAttribute("href", lookup.path);
            if(lookup.async) link.setAttribute('async', '');
            setTimeout(() => {
                document.head.appendChild(link);
            }, 50);
            // customElements.whenDefined(tagName).then(() =>{
            //     this.removeAttr(node);
            // })

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
        connectedCallback() {
            const preemptive : {[key: string] :  boolean} = {}; 
            if (!XtalSip._lookupMap) {

                XtalSip._lookupMap = {};
                
                this.qsa('link[rel-ish="preload"]', document.head).forEach(el => {
                    const isPreemptive = el.dataset.preemptive !== undefined;
                    const isAsync = el.dataset.async !== undefined;
                    //const isPreFetch = el.getAttribute('rel-ish') === 'prefetch'
                    const href = el.getAttribute('href');
                    el.dataset.tags.split(',').forEach(tag => {
                        if(isPreemptive) preemptive[tag] = true;
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
                    } as IReference;
                    preemptive[tag] = el.dataset.preemptive !== undefined;
                });
            }
            const h = this.get_h();
            for (const key in XtalSip._lookupMap) {
                if (XtalSip._alreadyAdded[key]) continue;
                if (preemptive[key] || h.querySelector(key) || this.parentElement.querySelector(key)) {
                    this.loadDependency(key);

                }
            }


            //            const _this = this;
            // fetch(this._href).then(resp =>{
            //     resp.json().then(val => {
            //         this._lookupMap = val;
            //         const parentNode = _this.parentNode as HTMLElement;
            //         if(parentNode.hasAttribute("upgrade-me")){
            //             this.loadDependency(parentNode.tagName.toLowerCase(), parentNode);
            //         }
            //         const descendants = parentNode.querySelectorAll('[upgrade-me]');
            //         for(let i = 0, ii = descendants.length; i < ii; i++){
            //             const descendant = descendants[i] as HTMLElement;
            //             this.loadDependency(descendant.tagName.toLowerCase(), descendant);
            //         }
            //     })
            // })
        }


    }
    customElements.define('xtal-sip', XtalSip);
})();