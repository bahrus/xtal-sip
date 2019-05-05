export function getHost(el: HTMLElement) : HTMLElement | null {
  let parent : any = el;
  while (parent = (parent.parentNode)) {
      if (parent.nodeType === 11) {
          return (<any>parent)['host'] as HTMLElement;
      } else if ((<HTMLElement>parent).tagName.indexOf('-') > -1) {
          return parent;
      }  else if (parent.tagName === 'BODY') {
          return null;
      }
  }
  return null;
}

const importmap = document.querySelector('script[type^="importmap"]');


let mappingLookup: { [key: string]: string } = {};
if (importmap !== null) {
  const parsed = JSON.parse(importmap.innerHTML);
  mappingLookup = parsed.imports;
}

const eventNames = ["animationstart", "MSAnimationStart", "webkitAnimationStart"];

export class XtalSip extends HTMLElement {
  static get is() {
    return "xtal-sip";
  }



  _conn = false;
  connectedCallback() {
    this.style.display = 'none';
    //this[up]([prereq]);
    this._conn = true;
    this.onPropsChange();
  }
  _aL = false;
  _fS = false;
  onPropsChange() {
    if (!this._conn) return;
    let id = this.id || XtalSip.is;
    this.loadScript()
  }

  loadAll(immediate: string[], lazy: string[]){
    const promiseAll = Promise.all(immediate.map(key => this.doImport(this.getImportKey(key), key)));
    promiseAll.then(val =>{
      this.initCssListener(lazy.join(','));
    })

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
    this.loadAll(immediate, lazy);
  }

  initCssListener(selector: string){
    if (!this._aL) {
      this.addCSSListener(this.animationName, selector, this.insertListener);
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
  de2(type1: string, type2: string, tagName: string, detail: any, promise: any){
    this.de(type1 + tagName, detail);
    this.de(type2, detail);
    promise(detail);
  }

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

  _boundInsertListener!: any;

  addCSSListener(id: string, targetSelector: string, insertListener: any){
      // See https://davidwalsh.name/detect-node-insertion
      if(this._boundInsertListener) return;
      const styleInner = /* css */`
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
      const host = <any>getHost((<any>this as HTMLElement));
      if(host !== null){
          host.shadowRoot.appendChild(style);
      }else{
          document.head.appendChild(style);
      }
      this._boundInsertListener = insertListener.bind(this);
      const container = host ? host.shadowRoot : document;
      eventNames.forEach(name =>{
          container.addEventListener(name, this._boundInsertListener, false);
      })

  }

  disconnectedCallback(){
      if(this._boundInsertListener){
          const host = <any>getHost(this);
          const container = host ? host.shadowRoot : document;
          eventNames.forEach(name =>{
              container.removeEventListener(name, this._boundInsertListener);
          })

      }
  }




}
customElements.define(XtalSip.is, XtalSip);
