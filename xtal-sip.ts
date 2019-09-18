//import { CSSListener } from './CSSListener.js';

export function getHost(el: HTMLElement) : HTMLElement | null {
  let parent : any = el;
  while (parent = (parent.parentNode)) {
      if (parent.nodeType === 11) {
          return parent.host;
      }
  }
  return null;
}

//let usesShim = false;
const importmap = document.querySelector('script[type^="importmap"]') as HTMLScriptElement;


let mappingLookup: { [key: string]: string } = {};
if (importmap !== null) {
  const parsed = JSON.parse(importmap.innerHTML);
  mappingLookup = parsed.imports;
  //usesShim = importmap.type!=="importmap";
}

//const eventNames = ["animationstart", "MSAnimationStart", "webkitAnimationStart"];

export class XtalSip extends HTMLElement {
  static get is() {
    return "xtal-sip";
  }


  _c = false;
  connectedCallback() {
    this.style.display = 'none';
    this._c = true;
    this.onPropsChange();
  }
  _aL = false;
  _fS = false;
  onPropsChange() {
    if (!this._c) return;
    let id = this.id || XtalSip.is;
    this.loadScript();
  }

  _listener: any;
  async addCSSListener(lazy: string[], host: HTMLElement | Document | DocumentFragment){
    if(lazy.length === 0) return;
    const {CSSListener} = await import('./CSSListener.js');
    const listener  = new CSSListener(lazy.join(','), host, this, XtalSip.is, this.newTag.bind(this));
    listener.addCSSListener(this.id || 'xtal-sip');
    this._listener = listener;
  }

  newTag(e: Event){
    const tagName = (e.target as HTMLElement).localName;
    if (customElements.get(tagName) !== undefined) return;
    const key = this.getImportKey(tagName);
    if (mappingLookup[key] !== undefined) {

      this.doImport(key, tagName);
    }else{
      const detail = {
        key: key,
        tagName: tagName,
        message: key + " not found in importmap."
      };
      this.de3(tagName, detail, null, detail);
    }
  }
  de3(tagName, detail, resolve, e){
    this.de2('failed-to-load-', 'load-failure', tagName, detail, resolve);
    console.error(tagName, e);
  }

  loadAll(immediate: string[], lazy: string[], host: HTMLElement | Document | DocumentFragment){
    const promiseAll = Promise.all(immediate.map(key => this.doImport(this.getImportKey(key), key)));
    promiseAll.then(val =>{
      this.addCSSListener(lazy, host);
      //this.initCssListener(lazy.join(','));
    });

  }

  loadScript(){
    if(this._fS) return;
    const script = this.querySelector('script');
    if(script === null){
      setTimeout(() => this.loadScript(), 10);
      return;
    }
    const json = JSON.parse(script.innerHTML) as string[];
    const immediate = json.filter(s => s.endsWith('!'));
    const lazy = json.filter(s => !s.endsWith('!'));
    let host : HTMLElement | ShadowRoot | Document = getHost(this);
    host = (host && host.shadowRoot) ? host.shadowRoot  : document ;

    const reallyLazy  = [];
    lazy.forEach(tag =>{
      if(host.querySelector(tag) !== null){
        immediate.push(tag + '!');
      }else{
        reallyLazy.push(tag);
      }
    })
    this.loadAll(immediate.map(s => s.substr(0, s.length - 1)), reallyLazy, host);

  }


  getImportKey(tagName: string) {
    return tagName;
  }


  get animationName(){
    return XtalSip.is;
  }


  de(name: string, detail: any) {
    const eventName = name;
    const newEvent = new CustomEvent(eventName, {
        detail: detail,
        bubbles: true,
        composed: false,
    } as CustomEventInit);
    this.dispatchEvent(newEvent);
    this.setAttribute(eventName, '');
    return newEvent;
}
  de2(type1: string, type2: string, tagName: string, detail: any, promise?: any){
    this.de(type1 + tagName, detail);
    this.de(type2, detail);
    if(promise) promise(detail);
  }

  async doImport(key: string, tagName: string){
    return new Promise(resolve =>{
      const detail = {
        tagName: tagName,
        importStatement: key
      } as any;
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
    })

  }


  disconnectedCallback(){
    if(this._listener) this._listener.disconnect();
  }

}
customElements.define(XtalSip.is, XtalSip);
