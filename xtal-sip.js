(function () {
    const xtal_sip = 'xtal-sip';
    if (customElements.get(xtal_sip))
        return;
    class XtalSip extends HTMLElement {
        static get(tagName) {
            return document.head.querySelector(`link[data-tag="${tagName}"]`);
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
            XtalSip._added[tagName] = true;
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
                    nodeName = 'c-c';
                    //pathName = 'href'
                    break;
            }
            let target = d['importer'] ? document.body : document.head;
            const newTag = document.createElement(nodeName);
            newTag.setAttribute(pathName, lookup.getAttribute('href'));
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
            this.getAttribute('load').split(',').forEach(tag => {
                XtalSip.loadDep(tag);
            });
        }
    }
    XtalSip._added = {};
    XtalSip._notFound = {};
    customElements.define(xtal_sip, XtalSip);
})();
//# sourceMappingURL=xtal-sip.js.map