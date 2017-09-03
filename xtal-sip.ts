module xtal.elements {
    interface IReference{
        path?: string;
        async?: boolean;
        useES6Module?: boolean; 
    }
    /**
    * `xtal-sip`
    * Dynamically load custom elements from central config file. 
    *
    * @customElement
    * @polymer
    * @demo demo/index.html
    */
    class XtalSip extends HTMLElement{
        _href = '/web_component_ref.json';
        _lookupMap: {[key: string] : string | IReference};
        static get is(){return 'xtal-sip';}
        static get observedAttributes() {
            return [
                /** @type {string} 
                 * Url of mapping file
                 */
                'href',
            ];
        }

        attributeChangedCallback(name, oldValue, newValue) {
            switch (name) {
                case 'href':
                    this._href = newValue;
                    break;
            }
        }

        loadDependency(tagName: string){
            const lookup = this._lookupMap[tagName];
            if(!lookup) return;
            if(customElements.get(tagName)) return;
            const link = document.createElement("link");
            link.setAttribute("rel", "import");
            link.setAttribute("href", lookup as string);
            document.head.appendChild(link);
        }
        
        connectedCallback(){
            const _this = this;
            fetch(this._href).then(resp =>{
                resp.json().then(val => {
                    this._lookupMap = val;
                    const parentNode = _this.parentNode as HTMLElement;
                    if(parentNode.hasAttribute("upgrade-me")){
                        this.loadDependency(parentNode.tagName.toLowerCase());
                    }
                    const descendants = parentNode.querySelectorAll('[upgrade-me]');
                    for(let i = 0, ii = descendants.length; i < ii; i++){
                        const descendant = descendants[i];
                        this.loadDependency(descendant.tagName.toLowerCase());
                    }
                })
            })
        }
    }
    customElements.define('xtal-sip', XtalSip);
}