(function () {
    /**
    * `xtal-sip`
    *
    * Dependency free web component that helps manage and load web component dependency mappings
    * on an as-needed basis.
    *
    *
    * @customElement
    * @polymer
    * @demo demo/index.html
    */
    class XtalSip extends HTMLElement {
        static get(tagName) {
            return window[tagName.split('-').join('_')];
        }
        static load(...args) {
            args.forEach(tagName => XtalSip.loadDep(tagName));
        }
        static loadDep(tagName) {
            const lookup = this.get(tagName);
            if (!lookup) {
                XtalSip._notFound[tagName] = true;
                return;
            }
            const href = lookup.getAttribute('href');
            if (XtalSip._a[href])
                return; //already added
            XtalSip._a[href] = true;
            const d = lookup.dataset;
            if (customElements.get(tagName))
                return;
            let nodeName, pathName = 'href';
            switch (lookup.getAttribute('as')) {
                case 'document':
                    nodeName = 'link';
                    //pathName = 'href';
                    break;
                case 'script':
                    nodeName = 'script';
                    pathName = 'src';
                    break;
                case 'fetch':
                    nodeName = lookup.dataset.importer;
                    //pathName = 'href'
                    break;
            }
            let target = d['importer'] ? document.body : document.head;
            const newTag = document.createElement(nodeName);
            newTag.setAttribute(pathName, href);
            newTag.setAttribute('rel', 'import'); // no harm done for other types
            if (lookup['async'])
                newTag.setAttribute('async', '');
            setTimeout(() => {
                target.appendChild(newTag);
            }, 1);
        }
        connectedCallback() {
            if (document.readyState !== "loading") {
                this.do();
            }
            else {
                document.addEventListener("DOMContentLoaded", e => {
                    this.do();
                });
            }
        }
        do() {
            const tags = this.getAttribute('load').split(',');
            tags.forEach(tag => {
                XtalSip.loadDep(tag);
            });
            let tagsNotLoadedYet = tags.slice(0);
            tags.forEach(tag => {
                customElements.whenDefined(tag).then(() => {
                    tagsNotLoadedYet = tagsNotLoadedYet.filter(t => t !== tag);
                    if (tagsNotLoadedYet.length === 0) {
                        this.dispatchEvent(new CustomEvent('loaded-changed', {
                            detail: {
                                value: true,
                            },
                            bubbles: true,
                            composed: true
                        }));
                    }
                });
            });
        }
    }
    XtalSip._a = {}; //added
    XtalSip._notFound = {};
    customElements.define('xtal-sip', XtalSip);
})();
//# sourceMappingURL=xtal-sip.js.map