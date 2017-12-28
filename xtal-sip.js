(function () {
    /**
    * `xtal-sip`
    * Dynamically load custom elements from central config file.
    *
    * @customElement
    * @polymer
    * @demo demo/index.html
    */
    class XtalSip extends HTMLElement {
        //static _preemptive: { [key: string]: boolean } = {};
        static get is() { return 'xtal-sip'; }
        // static set tieBreaker(val: (tagName: string, options: IReference[]) => IReference) {
        //     XtalSip._tieBreaker = val;
        // }
        replaceAll(str, find, replace) {
            return str.replace(new RegExp(find, 'g'), replace);
        }
        static getLookup(tagName) {
            const lookupOptions = XtalSip._lookupMap[tagName];
            if (!lookupOptions)
                return;
            if (lookupOptions.length > 1) {
                throw "Duplicate tagname found: " + tagName;
                // return XtalSip._tieBreaker(tagName, lookupOptions);
            }
            else {
                return lookupOptions[0];
            }
        }
        static loadDependencies(tagNames) {
            tagNames.forEach(tagName => XtalSip.loadDependency(tagName));
        }
        static loadDependency(tagName) {
            XtalSip._alreadyAdded[tagName] = true;
            const lookup = this.getLookup(tagName);
            if (!lookup)
                return;
            if (XtalSip._alreadyLoaded[lookup.path])
                return;
            if (customElements.get(tagName))
                return;
            let newTag;
            let target = document.head;
            if (lookup.isScript) {
                newTag = document.createElement('script');
                newTag.src = lookup.path;
            }
            else if (lookup.isCCRef) {
                newTag = document.createElement('c-c');
                newTag.setAttribute('href', lookup.path);
                target = document.body;
            }
            else {
                newTag = document.createElement("link");
                newTag.setAttribute("rel", "import");
                newTag.setAttribute("href", lookup.path);
            }
            if (lookup.async)
                newTag.setAttribute('async', '');
            setTimeout(() => {
                target.appendChild(newTag);
            }, 50);
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
        process_h(h) {
            if (!h)
                return;
            const lm = XtalSip._lookupMap;
            for (const key in XtalSip._alreadyAdded) {
                delete lm[key];
            }
            XtalSip._alreadyAdded = {};
            for (const key in lm) {
                if (XtalSip._alreadyAdded[key])
                    continue;
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
                //filter out duplicate tags for same tag name
                const tagToFakeLink = {};
                this.qsa('link[rel-ish="preload"]', document.head).forEach(el => {
                    if (XtalSip._substitutor)
                        XtalSip._substitutor(el);
                    el.dataset.tags.split(',').forEach(tag => {
                        if (!tagToFakeLink[tag])
                            tagToFakeLink[tag] = [];
                        tagToFakeLink[tag].push(el);
                    });
                });
                const goodEls = [];
                //const alreadyAdded = {};
                //debugger;
                for (var key in tagToFakeLink) {
                    const els = tagToFakeLink[key];
                    let elToAdd;
                    if (els.length === 1) {
                        elToAdd = els[0];
                    }
                    else {
                        if (XtalSip._tieBreaker) {
                            elToAdd = XtalSip._tieBreaker(key, els);
                        }
                    }
                    if (elToAdd) {
                        if (elToAdd['alreadyAdded'])
                            continue;
                        elToAdd['alreadyAdded'] = true;
                        goodEls.push(elToAdd);
                    }
                }
                // this.qsa('link[rel-ish="preload"]', document.head).forEach(el => {
                goodEls.forEach(el => {
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
                        if (!base) {
                            const baseId = el.dataset.baseRef;
                            if (baseId)
                                base = document.getElementById(baseId).dataset.base;
                        }
                        if (!base)
                            base = '';
                        modifiedHref = base + modifiedHref;
                        //from https://developer.mozilla.org/en-US/docs/Web/HTML/Preloading_content
                        const preloadLink = document.createElement("link");
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
                        isScript: el.getAttribute('as') === 'script',
                        isCCRef: el.dataset.importer === 'c-c',
                        preemptive: el.dataset.preemptive !== undefined,
                        element: el
                    };
                    const oldRef = XtalSip._lookupMap[tag];
                    if (!oldRef) {
                        XtalSip._lookupMap[tag] = [];
                    }
                    XtalSip._lookupMap[tag].push(newRef);
                    //XtalSip._lookupMap[tag].push();
                });
            }
            const load = this.getAttribute('load');
            if (load) {
                load.split(',').forEach(tag => {
                    //console.log('loading ' + tag);
                    XtalSip.loadDependency(tag);
                });
            }
            else {
                this.process_h(this.parentElement);
            }
        }
    }
    XtalSip._alreadyAdded = {};
    XtalSip._alreadyLoaded = {};
    XtalSip.useJITLoading = false;
    const detail = {};
    document.head.dispatchEvent(new CustomEvent('xtal-sip-init', {
        detail: detail,
    }));
    XtalSip._tieBreaker = detail['tieBreaker'];
    XtalSip._substitutor = detail['substitutor'];
    customElements.define('xtal-sip', XtalSip);
    document.addEventListener("DOMContentLoaded", e => {
        const xs = document.createElement('xtal-sip');
        xs.setAttribute('load', 'dom-bind');
        document.body.appendChild(xs);
    });
})();
//# sourceMappingURL=xtal-sip.js.map