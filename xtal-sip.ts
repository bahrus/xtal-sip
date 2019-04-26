import { hydrate, up } from "trans-render/hydrate.js";
import { define } from "trans-render/define.js";
import { XtallatX } from "xtal-element/xtal-latx.js";
import { observeCssSelector } from "xtal-element/observeCssSelector.js";

const selector = "selector";
export class XtalSip extends observeCssSelector(
  XtallatX(hydrate(HTMLElement))
) {
  static get is() {
    return "xtal-sip";
  }
  static get observedAttributes() {
    return super.observedAttributes.concat([selector]);
  }
  _selector: string;
  get selector() {
    return this._selector;
  }
  set selector(nv) {
    this.attr(selector, nv);
  }
  attributeChangedCallback(name: string, oldVal: string, newVal: string) {
    switch (name) {
      case selector:
        this._selector = newVal;
        break;
    }
    super.attributeChangedCallback(name, oldVal, newVal);
    this.onPropsChange();
  }

  _conn = false;
  connectedCallback() {
    this[up]([selector]);
    super.connectedCallback();
    this._conn = true;
  }

  onPropsChange(){
    if(!this._conn || this._disabled || !this._selector) return;
    let id = this.id || XtalSip.is;
    this.addCSSListener(XtalSip.is, this._selector, this.insertListener);
  }

  insertListener(e: any) {
    if (e.animationName === this.id) {
      const target = e.target;
      setTimeout(() => {
        //this.appendTemplates(target as HTMLElement);
        //this.attachScripts(target as HTMLElement);
      }, 0);
    }
  }
}
define(XtalSip);
