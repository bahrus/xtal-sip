var xtal;
(function (xtal) {
    var elements;
    (function (elements) {
        /**
        * `xtal-sip`
        * Dynamically load custom elements from central config file.
        *
        * @customElement
        * @polymer
        * @demo demo/index.html
        */
        class XtalSip extends HTMLElement {
            static get is() { return 'xtal-sip'; }
            // static get observedAttributes() {
            //     return [
            //         /** @type {string} 
            //          * Url of mapping file
            //          */
            //         'href',
            //     ];
            // }
            // static get properties(){
            //     return{
            //         href:{
            //             type: String
            //         }
            //     }
            // }
            // attributeChangedCallback(name, oldValue, newValue) {
            //     switch (name) {
            //         case 'href':
            //             this._href = newValue;
            //             break;
            //     }
            // }
            replaceAll(str, find, replace) {
                return str.replace(new RegExp(find, 'g'), replace);
            }
            // removeAttr(node: HTMLElement) {
            //     node.removeAttribute('upgrade-me');
            // }
            loadDependency(tagName) {
                //if(XtalSip._alreadyAdded[tagName]) return this.removeAttr(node);
                XtalSip._alreadyAdded[tagName] = true;
                //if(customElements.get(tagName)) return this.removeAttr(node);
                let lookup = XtalSip._lookupMap[tagName];
                // if(!lookup) {
                //     for(const key in this._lookupMap){
                //         const noWildCard = key.replace('{0}', '');
                //         if(!tagName.startsWith(noWildCard)) continue;
                //         const sub = tagName.substr(noWildCard.length);
                //         lookup = this._lookupMap[key];
                //         lookup = this.replaceAll(lookup, "\\{0\\}", sub);
                //     }
                // }
                const link = document.createElement("link");
                link.setAttribute("rel", "import");
                link.setAttribute("href", lookup.path);
                if (lookup.async)
                    link.setAttribute('async', '');
                setTimeout(() => {
                    document.head.appendChild(link);
                }, 50);
                // customElements.whenDefined(tagName).then(() =>{
                //     this.removeAttr(node);
                // })
            }
            qsa(css, from) {
                return [].slice.call((from ? from : this).querySelectorAll(css));
            }
            get_h() {
                let parentElement = this.parentElement;
                while (parentElement) {
                    if (parentElement.shadowRoot)
                        return parentElement.shadowRoot;
                    parentElement = parentElement.parentElement;
                }
                return document.body;
            }
            connectedCallback() {
                const preemptive = {};
                if (!XtalSip._lookupMap) {
                    XtalSip._lookupMap = {};
                    this.qsa('link[rel-ish="preload', document.head).forEach(el => {
                        const isPreemptive = el.dataset.preemptive !== null;
                        const isAsync = el.dataset.async !== null;
                        const href = el.getAttribute('href');
                        el.dataset.tags.split(',').forEach(tag => {
                            if (isPreemptive)
                                preemptive[tag] = true;
                            let modifiedHref = href;
                            let counter = 0;
                            tag.split('-').forEach(token => {
                                modifiedHref = this.replaceAll(modifiedHref, '\\{' + counter + '\\}', token);
                                counter++;
                            });
                            //from https://developer.mozilla.org/en-US/docs/Web/HTML/Preloading_content
                            const preloadLink = document.createElement("link");
                            preloadLink.href = modifiedHref;
                            preloadLink.rel = "preload";
                            preloadLink['as'] = "script";
                            preloadLink.dataset.tag = tag;
                            document.head.appendChild(preloadLink);
                        });
                    });
                    this.qsa('link[rel="preload"][data-tag]', document.head).forEach(el => {
                        const tag = el.dataset.tag;
                        XtalSip._lookupMap[tag] = {
                            //hre el['href']
                            path: el.getAttribute('href'),
                            async: el.dataset.async !== null,
                        };
                        preemptive[tag] = true;
                    });
                }
                const h = this.get_h();
                for (const key in XtalSip._lookupMap) {
                    if (XtalSip._alreadyAdded[key])
                        continue;
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
        XtalSip._alreadyAdded = {};
        customElements.define('xtal-sip', XtalSip);
    })(elements = xtal.elements || (xtal.elements = {}));
})(xtal || (xtal = {}));
//# sourceMappingURL=xtal-sip.js.map