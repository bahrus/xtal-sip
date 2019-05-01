import { hydrate, up } from "trans-render/hydrate.js";
import { define } from "trans-render/define.js";
import { XtallatX } from "xtal-element/xtal-latx.js";
import { observeCssSelector } from "xtal-element/observeCssSelector.js";

const selector = "selector";
const mapping = "mapping";
const importmap = document.querySelector('script[type^="importmap"]');

// let mappingLookup : {[key: string] : string} = {};
// if(importmap !== null){
//   const parsed = JSON.parse(importmap.innerHTML);
//   mappingLookup = parsed.imports;
// }
//   for(const key in imp){
//     const val = imp[key];
//     const hashSplit = val.split('#');
//     if(hashSplit.length === 2){
//       const tags = hashSplit[1].split(',');
//       tags.forEach(tag =>{
//         let tag2 = tag;
//         if(tag==='!'){
//           const last = key.split('/').pop();
//           tag2 = last.split('.')[0]; 
//         }
//         mappingLookup[tag2] = key;
//       })
//     }
//   }
// }

export function replaceAll(source: string, search: string, replacement: string) {
  return source.replace(new RegExp(search, 'g'), replacement);
};

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
  _mapping: {[key: string]: string} = {};
  get mapping(){
    return this._mapping;
  }
  set mapping(nv: {[key: string]: string} ){
    this._mapping = nv;
    this.onPropsChange();
  }
  attributeChangedCallback(name: string, oldVal: string, newVal: string) {
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
    if(!foundMatch) super.attributeChangedCallback(name, oldVal, newVal);
    this.onPropsChange();
  }

  _conn = false;
  connectedCallback() {
    this[up]([selector]);
    //super.connectedCallback();
    this._conn = true;
    this.onPropsChange();
  }
  _aL = false;
  onPropsChange() {
    if (!this._conn || this._disabled || !this._selector) return;
    let id = this.id || XtalSip.is;
    if(!this._aL){
      this.addCSSListener(XtalSip.is, this._selector, this.insertListener);
      this._aL = true;
    }
  }

  _wildMap: string[];


  insertListener(e: any) {
    if (e.animationName === XtalSip.is) {
      const target = e.target as HTMLElement;
      setTimeout(() => {
        const tagName = target.localName;
        if(customElements.get(tagName) !== undefined) return;

          const localLookup = this._mapping[tagName];
          let importStatement = null;
          if(localLookup !== undefined){
            importStatement = replaceAll(localLookup, '$0', tagName);
          }else{
            if(this._wildMap === undefined){
              this._wildMap = [];
              for(const key in this._mapping){
                if(key.endsWith('-')) this._wildMap.push(key);
              }
            }
            const match = this._wildMap.find(s => tagName.startsWith(s));
            if(match !== undefined){
              const wildCardLookup = this._mapping[match];
              const $1 = tagName.replace(match, '');
              importStatement = replaceAll(wildCardLookup, '$1', $1);
            }
          }

        if(importStatement === null){
          importStatement = `${tagName}/${tagName}.js`;
        }

        import(importStatement).then(() =>{
          this.de('loaded-' + tagName,{
            importStatement: importStatement
          }, true);
        })
        //}

      }, 0);
    }
  }
}
define(XtalSip);
