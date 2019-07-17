//import { CSSListener } from './CSSListener.js';
export function getHost(el) {
    let parent = el;
    while (parent = (parent.parentNode)) {
        if (parent.nodeType === 11) {
            return parent;
        }
        else if (parent.tagName === 'BODY') {
            return parent;
        }
    }
    return null;
}
const importmap = document.querySelector('script[type^="importmap"]');
let mappingLookup = {};
if (importmap !== null) {
    const parsed = JSON.parse(importmap.innerHTML);
    mappingLookup = parsed.imports;
}
//const eventNames = ["animationstart", "MSAnimationStart", "webkitAnimationStart"];
export class XtalSip extends HTMLElement {
    constructor() {
        super(...arguments);
        this._c = false;
        this._aL = false;
        this._fS = false;
    }
    static get is() {
        return "xtal-sip";
    }
    connectedCallback() {
        this.style.display = 'none';
        this._c = true;
        this.onPropsChange();
    }
    onPropsChange() {
        if (!this._c)
            return;
        let id = this.id || XtalSip.is;
        this.loadScript();
    }
    async addCSSListener(lazy, host) {
        if (lazy.length === 0)
            return;
        const { CSSListener } = await import('./CSSListener.js');
        this._listener = new CSSListener(lazy.join(','), host, this, XtalSip.is, this.newTag);
    }
    newTag(target) {
        debugger;
        const tagName = target.localName;
        if (customElements.get(tagName) !== undefined)
            return;
        const key = this.getImportKey(tagName);
        if (mappingLookup[key] !== undefined) {
            this.doImport(key, tagName);
        }
        else {
            const detail = {
                key: key,
                tagName: tagName,
                message: key + " not found in importmap."
            };
            this.de3(tagName, detail, null, detail);
        }
    }
    de3(tagName, detail, resolve, e) {
        this.de2('failed-to-load-', 'load-failure', tagName, detail, resolve);
        console.error(tagName, e);
    }
    loadAll(immediate, lazy, host) {
        const promiseAll = Promise.all(immediate.map(key => this.doImport(this.getImportKey(key), key)));
        promiseAll.then(val => {
            this.addCSSListener(lazy, host);
            //this.initCssListener(lazy.join(','));
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
        const host = getHost(this) || document;
        const reallyLazy = [];
        lazy.forEach(tag => {
            if (host.querySelector(tag) !== null) {
                immediate.push(tag + '!');
            }
            else {
                reallyLazy.push(tag);
            }
        });
        this.loadAll(immediate.map(s => s.substr(0, s.length - 1)), reallyLazy, host);
    }
    getImportKey(tagName) {
        return tagName;
    }
    get animationName() {
        return XtalSip.is;
    }
    de(name, detail) {
        const eventName = name;
        const newEvent = new CustomEvent(eventName, {
            detail: detail,
            bubbles: true,
            composed: false,
        });
        this.dispatchEvent(newEvent);
        this.setAttribute(eventName, '');
        return newEvent;
    }
    de2(type1, type2, tagName, detail, promise) {
        this.de(type1 + tagName, detail);
        this.de(type2, detail);
        if (promise)
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
                    .catch(e => {
                    //this.de2('failed-to-load-', 'load-failure', tagName, detail, resolve);
                    this.de3(tagName, detail, resolve, e);
                });
            })
                .catch(e => {
                detail.err = e.message;
                //this.de2('failed-to-load-', 'load-failure', tagName, detail, resolve);
                this.de3(tagName, detail, resolve, e);
            });
        });
    }
    disconnectedCallback() {
        if (this._listener)
            this._listener.disconnect();
    }
}
customElements.define(XtalSip.is, XtalSip);
