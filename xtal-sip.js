(function () {
    const xtal_sip = 'xtal-sip';
    if (customElements.get(xtal_sip))
        return;
    const originalDefine = customElements.define;
    const boundDefine = originalDefine.bind(customElements);
    customElements.define = function (name, cls) {
        const lookup = XtalSip.get(name);
        if (lookup) {
            Object.assign(cls, lookup.el.dataset);
        }
        boundDefine(name, cls);
    };
    /**
    * `xtal-sip`
    * Dynamically load custom elements from central config file.
    *
    * @customElement
    * @polymer
    * @demo demo/index.html
    */
    class XtalSip extends HTMLElement {
        // static set tieBreaker(val: (tagName: string, options: IReference[]) => IReference) {
        //     XtalSip._tieBreaker = val;
        // }
        replace(str, find, replace) {
            return str.replace(new RegExp(find, 'g'), replace);
        }
        static get(tagName) {
            let a;
            if (!(a = XtalSip._lM) || !(a = a[tagName]))
                return; //this happens when boostrapping xtal sip.
            return a;
        }
        static loadDeps(tagNames) {
            tagNames.forEach(tagName => XtalSip.loadDep(tagName));
        }
        static loadDep(tagName) {
            XtalSip._added[tagName] = true;
            const lookup = this.get(tagName);
            if (!lookup)
                return;
            const el = lookup.el, d = el.dataset;
            if (customElements.get(tagName))
                return;
            let nodeName, pathName;
            switch (el.getAttribute('as')) {
                case 'document':
                    nodeName = d['importer'] ? 'c-c' : 'link';
                    pathName = 'href';
                    break;
                case 'script':
                    nodeName = 'script';
                    pathName = 'src';
                    break;
            }
            //let newTag;
            let target = document.head;
            // if (lookup.isJS) {
            //     newTag = document.createElement('script');
            //     newTag.src = lookup.path;
            // }else if(lookup.isCC){
            //     newTag = document.createElement('c-c');
            //     newTag.setAttribute('href', lookup.path);
            //     target = document.body
            // } else {
            //     newTag = document.createElement("link");
            //     newTag.setAttribute("rel", "import");
            //     newTag.setAttribute("href", lookup.path);
            // }
            const newTag = document.createElement(nodeName);
            newTag.setAttribute(pathName, el.getAttribute('href'));
            newTag.setAttribute('rel', 'import'); // no harm done for other types
            if (el['async'])
                newTag.setAttribute('async', '');
            setTimeout(() => {
                target.appendChild(newTag);
            }, 50);
        }
        qsa(css, from) {
            return [].slice.call((from ? from : this).querySelectorAll(css));
        }
        connectedCallback() {
            if (!XtalSip._lM) {
                XtalSip._lM = {};
                const tagToFakeLink = {};
                this.qsa('link[rel-ish="preload"]', document.head).forEach(el => {
                    if (XtalSip._sub)
                        XtalSip._sub(el); //substitution
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
                        if (XtalSip._tB) {
                            elToAdd = XtalSip._tB(key, els);
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
                            modifiedHref = this.replace(modifiedHref, '\\{' + counter + '\\}', token);
                            counter++;
                        });
                        let base = el.dataset.base;
                        if (!base) {
                            const baseRef = el.dataset.baseRef;
                            if (baseRef)
                                base = document.querySelector(baseRef).dataset.base;
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
                    //let needTieBreaking = false;
                    const newRef = {
                        //hre el['href']
                        // path: el.getAttribute('href'),
                        // async: el.dataset.async !== undefined,
                        // isJS: el.getAttribute('as') === 'script',
                        // isCC: el.dataset.importer === 'c-c',
                        // preemptive: el.dataset.preemptive !== undefined,
                        el: el
                    };
                    // const oldRef = XtalSip._lM[tag]
                    // if (!oldRef) {
                    //     XtalSip._lM[tag] = [];
                    // } 
                    XtalSip._lM[tag] = newRef;
                    //XtalSip._lookupMap[tag].push();
                });
            }
            this.getAttribute('load').split(',').forEach(tag => {
                //console.log('loading ' + tag);
                XtalSip.loadDep(tag);
            });
        }
    }
    XtalSip._added = {};
    //static _loaded: { [key: string]: string } = {};
    XtalSip.useJITLoading = false;
    const detail = {};
    document.head.dispatchEvent(new CustomEvent(xtal_sip + '-init', {
        detail: detail,
    }));
    XtalSip._tB = detail['tieBreaker'];
    XtalSip._sub = detail['substitutor'];
    customElements.define(xtal_sip, XtalSip);
    document.addEventListener("DOMContentLoaded", e => {
        const xs = document.createElement(xtal_sip);
        xs.setAttribute('load', 'dom-bind');
        document.body.appendChild(xs);
    });
})();
//# sourceMappingURL=xtal-sip.js.map