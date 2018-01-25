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
        static _a: { [key: string]: boolean } = {}; //added
        static _notFound: {[key: string]: boolean} = {};
        static get(tagName): HTMLLinkElement {
            return window[tagName.split('-').join('_')];
        }
        static load(...args: string[]) {
            args.forEach(tagName => XtalSip.loadDep(tagName))
        }
        static loadDep(tagName: string) {
            const lookup = this.get(tagName);
            if (!lookup) {
                XtalSip._notFound[tagName] = true;
                return;
            }
            if(XtalSip._a[tagName]) return; //already added
            XtalSip._a[tagName] = true;
            const d = lookup.dataset;
            if (customElements.get(tagName)) return;
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
            let target = d['importer'] ? document.body : document.head as HTMLElement;

            const newTag = document.createElement(nodeName);
            newTag.setAttribute(pathName, lookup.getAttribute('href'));
            newTag.setAttribute('rel', 'import');  // no harm done for other types
            if (lookup['async']) newTag.setAttribute('async', '');
            setTimeout(() => {
                console.log('appending');
                console.log(newTag);
                target.appendChild(newTag);
            }, 1);
        }
        connectedCallback() {
            if (document.readyState !== "loading") {
                this.do();
            } else {
                document.addEventListener("DOMContentLoaded", e => {
                    this.do();
                });
            }
        }
        do(){
            this.getAttribute('load').split(',').forEach(tag => {
                XtalSip.loadDep(tag);
            })
        }
    }
    customElements.define('xtal-sip', XtalSip);
})();