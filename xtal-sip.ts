import { hydrate, up } from "trans-render/hydrate.js";
import { define } from "trans-render/define.js";
import { XtallatX } from "xtal-element/xtal-latx.js";
import { observeCssSelector } from "xtal-element/observeCssSelector.js";

const selector = "selector";
const mapping = "mapping";
const importmap = document.querySelector('script[type^="importmap"]');

let mappingLookup: { [key: string]: string } = {};
if (importmap !== null) {
  const parsed = JSON.parse(importmap.innerHTML);
  mappingLookup = parsed.imports;
}


export class XtalSip extends observeCssSelector(
  XtallatX(hydrate(HTMLElement))
) {
  static get is() {
    return "xtal-sip";
  }
  static get observedAttributes() {
    return super.observedAttributes.concat([selector, mapping]);
  }
  _selector: string;
  get selector() {
    return this._selector;
  }
  set selector(nv) {
    this.attr(selector, nv);
  }

  attributeChangedCallback(name: string, oldVal: string, newVal: string) {
    let foundMatch = false;
    switch (name) {
      case selector:
        this._selector = newVal;
        foundMatch = true;
        break;
    }
    if (!foundMatch) super.attributeChangedCallback(name, oldVal, newVal);
    this.onPropsChange();
  }

  _conn = false;
  connectedCallback() {
    this[up]([selector]);
    this._conn = true;
    this.onPropsChange();
  }
  _aL = false;
  onPropsChange() {
    if (!this._conn || this._disabled || !this._selector) return;
    let id = this.id || XtalSip.is;
    if (!this._aL) {
      this.addCSSListener(this.animationName, this._selector, this.insertListener);
      this._aL = true;
    }
  }

  _wildMap: string[];

  getImportKey(tagName: string) {
    return `${tagName}/${tagName}.js`;
  }

  get animationName(){
    return XtalSip.is;
  }

  insertListener(e: any) {
    if (e.animationName === this.animationName) {
      const target = e.target as HTMLElement;
      setTimeout(() => {
        const tagName = target.localName;
        if (customElements.get(tagName) !== undefined) return;
        const key = this.getImportKey(tagName);
        if (mappingLookup[key] !== undefined) {
          const detail = {
            tagName: tagName,
            importStatement: key
          };
          import(key)
            .then(() => {
              customElements
                .whenDefined(tagName)
                .then(() => {
                  this.de("loaded-" + tagName, detail, true);
                  this.de('load-success', detail, true)
                })
                .catch(() => {
                  this.de("failed-to-load-" + tagName, detail, true);
                  this.de('load-failure', detail);
                });
            })
            .catch(e => {
              this.de("failed-to-load-" + tagName, detail, true);
              this.de('load-failure', detail, true);
            });
        }
      }, 0);
    }
  }
}
define(XtalSip);
