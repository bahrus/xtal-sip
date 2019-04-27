import { hydrate, up } from "trans-render/hydrate.js";
import { define } from "trans-render/define.js";
import { XtallatX } from "xtal-element/xtal-latx.js";
import { observeCssSelector } from "xtal-element/observeCssSelector.js";
const selector = "selector";
const mapping = "mapping";
const importmap = document.querySelector('script[type^="importmap"]');
const mappingLookup = {};
if (importmap !== null) {
    const parsed = JSON.parse(importmap.innerHTML);
    const imp = parsed.imports;
    for (const key in imp) {
        const val = imp[key];
        const hashSplit = val.split('#');
        if (hashSplit.length === 2) {
            const tags = hashSplit[1].split(',');
            tags.forEach(tag => {
                let tag2 = tag;
                if (tag === '!') {
                    const last = key.split('/').pop();
                    tag2 = last.split('.')[0];
                }
                mappingLookup[tag2] = key;
            });
        }
    }
}
export function replaceAll(source, search, replacement) {
    return source.replace(new RegExp(search, 'g'), replacement);
}
;
export class XtalSip extends observeCssSelector(XtallatX(hydrate(HTMLElement))) {
    constructor() {
        super(...arguments);
        this._mapping = {};
        this._conn = false;
        this._aL = false;
    }
    static get is() {
        return "xtal-sip";
    }
    static get observedAttributes() {
        return super.observedAttributes.concat([selector, mapping]);
    }
    get selector() {
        return this._selector;
    }
    set selector(nv) {
        this.attr(selector, nv);
    }
    get mapping() {
        return this._mapping;
    }
    set mapping(nv) {
        this._mapping = nv;
        this.onPropsChange();
    }
    attributeChangedCallback(name, oldVal, newVal) {
        let foundMatch = false;
        switch (name) {
            case mapping:
                this._mapping = JSON.parse(newVal);
                foundMatch = true;
                break;
            case selector:
                //(<any>this)["_" + name] = newVal;
                this._selector = newVal;
                foundMatch = true;
                break;
        }
        if (!foundMatch)
            super.attributeChangedCallback(name, oldVal, newVal);
        this.onPropsChange();
    }
    connectedCallback() {
        this[up]([selector]);
        //super.connectedCallback();
        this._conn = true;
        this.onPropsChange();
    }
    onPropsChange() {
        if (!this._conn || this._disabled || !this._selector)
            return;
        let id = this.id || XtalSip.is;
        if (!this._aL) {
            this.addCSSListener(XtalSip.is, this._selector, this.insertListener);
            this._aL = true;
        }
    }
    insertListener(e) {
        if (e.animationName === XtalSip.is) {
            const target = e.target;
            setTimeout(() => {
                const tagName = target.localName;
                if (customElements.get(tagName) !== undefined)
                    return;
                const globalLookup = mappingLookup[tagName];
                const localLookup = this._mapping[tagName];
                const importStatement = globalLookup !== undefined ? globalLookup : replaceAll(localLookup ? localLookup : '$0/$0.js', '$0', tagName);
                if (importStatement !== undefined) {
                    import(importStatement).then(() => {
                        this.de('loaded-' + tagName, {
                            importStatement: importStatement
                        }, true);
                    });
                }
            }, 0);
        }
    }
}
define(XtalSip);
