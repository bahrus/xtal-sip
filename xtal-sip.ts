import { hydrate} from "trans-render/hydrate.js";
import { define } from "trans-render/define.js";
import { XtallatX } from "xtal-element/xtal-latx.js";
import { observeCssSelector } from "xtal-element/observeCssSelector.js";

//const selector = "selector";
//const mapping = "mapping";
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
  // static get observedAttributes() {
  //   return super.observedAttributes.concat([selector, mapping]);
  // }
  // _selector: string;
  // get selector() {
  //   return this._selector;
  // }
  // set selector(nv) {
  //   this.attr(selector, nv);
  // }

  get selector(){
    return '[data-imp]';
  }

  // attributeChangedCallback(name: string, oldVal: string, newVal: string) {
  //   let foundMatch = false;
  //   switch (name) {
  //     case selector:
  //       this._selector = newVal;
  //       foundMatch = true;
  //       break;
  //   }
  //   if (!foundMatch) super.attributeChangedCallback(name, oldVal, newVal);
  //   this.onPropsChange();
  // }

  _conn = false;
  connectedCallback() {
    //this[up]([selector]);
    this._conn = true;
    this.onPropsChange();
  }
  _aL = false;
  onPropsChange() {
    if (!this._conn || this._disabled || !this.selector) return;
    let id = this.id || XtalSip.is;
    if (!this._aL) {
      this.addCSSListener(this.animationName, this.selector, this.insertListener);
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
  de2(type1: string, type2: string, tagName: string, detail: any){
    this.de(type1 + tagName, detail, true);
    this.de(type2, detail, true);
  }
  tryBackup(target: HTMLElement){
    const imp = target.dataset.imp;
    if(imp !== undefined && imp.length > 0){
      this.doImport(imp, target.localName);
    }
  }
  doImport(key: string, tagName: string){
    const detail = {
      tagName: tagName,
      importStatement: key
    };
    import(key)
    .then(() => {
      customElements
        .whenDefined(tagName)
        .then(() => {
          // this.de("loaded-" + tagName, detail, true);
          // this.de('load-success', detail, true)
          this.de2('loaded-', 'load-success', tagName, detail);
        })
        .catch(() => {
          // this.de("failed-to-load-" + tagName, detail, true);
          // this.de('load-failure', detail);
          this.de2('failed-to-load-', 'load-failure', tagName, detail);
        });
    })
    .catch(e => {
      // this.de("failed-to-load-" + tagName, detail, true);
      // this.de('load-failure', detail, true);
      this.de2('failed-to-load-', 'load-failure', tagName, detail);
    });
  }
  insertListener(e: any) {
    if (e.animationName === this.animationName) {
      const target = e.target as HTMLElement;
      setTimeout(() => {
        const tagName = target.localName;
        if (customElements.get(tagName) !== undefined) return;
        const key = this.getImportKey(tagName);
        if (mappingLookup[key] !== undefined) {

          this.doImport(key, tagName);
        }else{
          this.tryBackup(target)
        }
      }, 0);
    }
  }
}
define(XtalSip);
