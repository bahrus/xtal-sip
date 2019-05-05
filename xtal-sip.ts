import { hydrate, up} from "trans-render/hydrate.js";
import { define } from "trans-render/define.js";
import { XtallatX } from "xtal-element/xtal-latx.js";
import { observeCssSelector } from "xtal-element/observeCssSelector.js";

const importmap = document.querySelector('script[type^="importmap"]');

let mappingLookup: { [key: string]: string } = {};
if (importmap !== null) {
  const parsed = JSON.parse(importmap.innerHTML);
  mappingLookup = parsed.imports;
}

//const prereq = 'prereq';
export class XtalSip extends observeCssSelector(XtallatX(hydrate(HTMLElement))) {
  static get is() {
    return "xtal-sip";
  }

  // static get observedAttributes(){
  //   return super.observedAttributes.concat([prereq]);
  // }

  _preLoaded = true;



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
  

  get selector(){
    return '[data-imp]';
  }


  _conn = false;
  connectedCallback() {
    this.style.display = 'none';
    //this[up]([prereq]);
    this._conn = true;
    this.onPropsChange();
  }
  _aL = false;
  onPropsChange() {
    if (!this._conn || this._disabled || !this.selector || !this._preLoaded) return;
    let id = this.id || XtalSip.is;
    if (!this._aL) {
      this.addCSSListener(this.animationName, this.selector, this.insertListener);
      this._aL = true;
    }
  }

  _wildMap: string[];

  getImportKey(tagName: string) {
    if(!this.validateTagName(tagName)) throw "Invalid Key";
    return `${tagName}`;
  }
  _re = /^[a-z-]+$/
  validateTagName(tagName: string){
    return tagName.search(this._re) !== -1;
  }

  get animationName(){
    return XtalSip.is;
  }
  de2(type1: string, type2: string, tagName: string, detail: any, promise: any){
    this.de(type1 + tagName, detail, true);
    this.de(type2, detail, true);
    promise(detail);
  }
  // tryBackup(target: HTMLElement){
  //   const imp = target.dataset.imp;
    
  //   if(imp !== undefined && imp.length > 0){
  //     this.doImport(imp, target.localName);
  //   }
  // }
  async doImport(key: string, tagName: string){
    return new Promise(resolve =>{
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
    })

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
          //this.tryBackup(target)
        }
      }, 0);
    }
  }
}
define(XtalSip);
