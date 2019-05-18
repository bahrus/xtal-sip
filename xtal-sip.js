export function getHost(el) {
    let parent = el;
    while (parent = (parent.parentNode)) {
        if (parent.nodeType === 11) {
            return parent['host'];
        }
        else if (parent.tagName.indexOf('-') > -1) {
            return parent;
        }
        else if (parent.tagName === 'BODY') {
            return null;
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
const eventNames = ["animationstart", "MSAnimationStart", "webkitAnimationStart"];
export class XtalSip extends HTMLElement {
    constructor() {
        super(...arguments);
        this._conn = false;
        this._aL = false;
        this._fS = false;
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
        if (!this._conn)
            return;
        let id = this.id || XtalSip.is;
        this.loadScript();
    }
    loadAll(immediate, lazy) {
        const promiseAll = Promise.all(immediate.map(key => this.doImport(this.getImportKey(key), key)));
        promiseAll.then(val => {
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
        this.loadAll(immediate.map(s => s.substr(0, s.length - 1)), lazy);
    }
    initCssListener(selector) {
        if (!this._aL) {
            this.addCSSListener(this.animationName, selector, this.insertListener);
            this._aL = true;
        }
    }
    //_wildMap: string[];
    getImportKey(tagName) {
        return `${tagName}`;
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
                    this.de2('failed-to-load-', 'load-failure', tagName, detail, resolve);
                    console.error(e.message);
                });
            })
                .catch(e => {
                detail.err = e.message;
                this.de2('failed-to-load-', 'load-failure', tagName, detail, resolve);
                console.error(e.message);
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
                    this.de2('failed-to-load-', 'load-failure', tagName, {
                        key: key,
                        tagName: tagName,
                        msg: "key not found in importmap"
                    });
                }
            }, 0);
        }
    }
    addCSSListener(id, targetSelector, insertListener) {
        // See https://davidwalsh.name/detect-node-insertion
        if (this._boundInsertListener)
            return;
        const styleInner = /* css */ `
      @keyframes ${id} {
          from {
              opacity: 0.99;
          }
          to {
              opacity: 1;
          }
      }

      ${targetSelector}{
          animation-duration: 0.001s;
          animation-name: ${id};
      }
      `;
        const style = document.createElement('style');
        style.innerHTML = styleInner;
        const host = getHost(this);
        if (host !== null) {
            host.shadowRoot.appendChild(style);
        }
        else {
            document.head.appendChild(style);
        }
        this._boundInsertListener = insertListener.bind(this);
        const container = host ? host.shadowRoot : document;
        eventNames.forEach(name => {
            container.addEventListener(name, this._boundInsertListener, false);
        });
    }
    disconnectedCallback() {
        if (this._boundInsertListener) {
            const host = getHost(this);
            const container = host ? host.shadowRoot : document;
            eventNames.forEach(name => {
                container.removeEventListener(name, this._boundInsertListener);
            });
        }
    }
}
customElements.define(XtalSip.is, XtalSip);
