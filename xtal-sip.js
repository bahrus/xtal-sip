export function getHost(el) {
    let parent = el;
    while (parent = (parent.parentNode)) {
        if (parent.nodeType === 11) {
            return parent.host;
        }
    }
    return null;
}
//let usesShim = false;
const importmap = document.querySelector('script[type^="importmap"]');
let mappingLookup = {};
let collapsedMap = [];
if (importmap !== null) {
    const parsed = JSON.parse(importmap.innerHTML);
    const imports = parsed.imports;
    if (typeof imports !== undefined) {
        const filteredMappingLookup = {};
        for (const key in imports) {
            const val = imports[key];
            let iPos = -1;
            if (key.startsWith('-')) {
                const collapse = {
                    endsWith: key,
                    path: val,
                };
                collapsedMap.push(collapse);
            }
            else if (key.endsWith('-')) {
                const collapse = {
                    startsWith: key,
                    path: val,
                };
                collapsedMap.push(collapse);
            }
            else if ((iPos = key.indexOf('-*-')) > -1) {
                const collapse = {
                    startsWith: key.substr(0, iPos + 1),
                    endsWith: key.substr(iPos + 3),
                    path: val,
                };
                collapsedMap.push(collapse);
            }
            else {
                filteredMappingLookup[key] = imports[key];
            }
        }
        mappingLookup = filteredMappingLookup;
    }
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
        const listener = new CSSListener(lazy.join(','), host, this, XtalSip.is, this.newTag.bind(this));
        listener.addCSSListener(this.id || 'xtal-sip');
        this._listener = listener;
    }
    newTag(e) {
        const tagName = e.target.localName;
        if (customElements.get(tagName) !== undefined)
            return;
        const key = this.getImportKey(tagName);
        if (mappingLookup[key] !== undefined) {
            this.doImport(key, tagName);
        }
        else {
            collapsedMap.forEach(item => {
                let foundStartsWithMatch = false;
                let foundEndsWithMatch = false;
                if (item.startsWith !== undefined) {
                    if (key.startsWith(item.startsWith)) {
                        foundStartsWithMatch = true;
                        foundEndsWithMatch = (item.endsWith === undefined);
                    }
                }
                if (key.endsWith !== undefined) {
                    if (key.endsWith(item.endsWith)) {
                        foundEndsWithMatch = true;
                        if (item.startsWith === undefined)
                            foundStartsWithMatch = true;
                    }
                }
                if (foundStartsWithMatch && foundEndsWithMatch) {
                    this.doImport(item.path, tagName);
                    return;
                }
            });
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
        let host = getHost(this);
        host = (host && host.shadowRoot) ? host.shadowRoot : document;
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
