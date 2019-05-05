import { hydrate } from "trans-render/hydrate.js";
import { define } from "trans-render/define.js";
import { XtallatX } from "xtal-element/xtal-latx.js";
import { observeCssSelector } from "xtal-element/observeCssSelector.js";
const importmap = document.querySelector('script[type^="importmap"]');
let mappingLookup = {};
if (importmap !== null) {
    const parsed = JSON.parse(importmap.innerHTML);
    mappingLookup = parsed.imports;
}
//const prereq = 'prereq';
export class XtalSip extends observeCssSelector(XtallatX(hydrate(HTMLElement))) {
    constructor() {
        super(...arguments);
        // static get observedAttributes(){
        //   return super.observedAttributes.concat([prereq]);
        // }
        this._preLoaded = true;
        // attributeChangedCallback(n: string, ov: string, nv: string){
        //   let foundAttrib = false;
        //   switch(n){
        //     case prereq:
        //       foundAttrib = true;
        //       this._preLoaded = false;
        //       this._prereq = nv;
        //       break;
        //   }
        //   if(!foundAttrib) super.attributeChangedCallback(n, ov, nv);
        //   this.onPropsChange();
        // }
        // _prereq: string;
        // get prereq(){
        //   return this._prereq;
        // }
        // set prereq(nv){
        //   this.attr(prereq, nv);
        // }
        // get selector(){
        //   return '[data-imp]';
        // }
        this._conn = false;
        this._aL = false;
        this._fS = false;
        this._re = /^[a-z-]+$/;
    }
    static get is() {
        return "xtal-sip";
    }
    connectedCallback() {
        this.style.display = 'none';
        //this[up]([prereq]);
        this._conn = true;
        this.onPropsChange();
    }
    onPropsChange() {
        if (!this._conn || this._disabled || !this._preLoaded)
            return;
        let id = this.id || XtalSip.is;
        this.loadScript();
    }
    loadAll(immediate, lazy) {
        const promiseAll = Promise.all(immediate.map(key => this.doImport(this.getImportKey(key), key)));
        promiseAll.then(val => {
            this._preLoaded = true;
            this.initCssListener(lazy.join(','));
        });
    }
    loadScript() {
        if (this._fS)
            return;
        const script = this.querySelector('script');
        if (script === null) {
            setTimeout(() => this.loadScript(), 10);
            return;
        }
        const json = JSON.parse(script.innerHTML);
        const immediate = json.filter(s => s.endsWith('!'));
        const lazy = json.filter(s => !s.endsWith('!'));
        this.loadAll(immediate, lazy);
    }
    initCssListener(selector) {
        if (!this._aL) {
            this.addCSSListener(this.animationName, selector, this.insertListener);
            this._aL = true;
        }
    }
    getImportKey(tagName) {
        if (!this.validateTagName(tagName))
            throw "Invalid Key";
        return `${tagName}`;
    }
    validateTagName(tagName) {
        return tagName.search(this._re) !== -1;
    }
    get animationName() {
        return XtalSip.is;
    }
    de2(type1, type2, tagName, detail, promise) {
        this.de(type1 + tagName, detail, true);
        this.de(type2, detail, true);
        promise(detail);
    }
    async doImport(key, tagName) {
        return new Promise(resolve => {
            const detail = {
                tagName: tagName,
                importStatement: key
            };
            import(key)
                .then(() => {
                customElements
                    .whenDefined(tagName)
                    .then(() => {
                    this.de2('loaded-', 'load-success', tagName, detail, resolve);
                })
                    .catch(() => {
                    this.de2('failed-to-load-', 'load-failure', tagName, detail, resolve);
                });
            })
                .catch(e => {
                this.de2('failed-to-load-', 'load-failure', tagName, detail, resolve);
            });
        });
    }
    insertListener(e) {
        if (e.animationName === this.animationName) {
            const target = e.target;
            setTimeout(() => {
                const tagName = target.localName;
                if (customElements.get(tagName) !== undefined)
                    return;
                const key = this.getImportKey(tagName);
                if (mappingLookup[key] !== undefined) {
                    this.doImport(key, tagName);
                }
                else {
                    //this.tryBackup(target)
                }
            }, 0);
        }
    }
}
define(XtalSip);
