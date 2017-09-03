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
        _alreadyAdded: {[key: string] : boolean};
        static get is(){return 'xtal-sip';}
        static get observedAttributes() {
            return [
                /** @type {string} 
                 * Url of mapping file
                 */
                'href',
            ];
        }
        static get properties(){
            return{
                href:{
                    type: String
                }
            }
        }

        attributeChangedCallback(name, oldValue, newValue) {
            switch (name) {
                case 'href':
                    this._href = newValue;
                    break;
            }
        }

        replaceAll(str, find, replace) {
            return str.replace(new RegExp(find, 'g'), replace);
        }

        loadDependency(tagName: string){
            if(this._alreadyAdded[tagName]) return;
            this._alreadyAdded[tagName] = true;
            let lookup = this._lookupMap[tagName];
            if(!lookup) {
                for(const key in this._lookupMap){
                    const noWildCard = key.replace('{0}', '');
                    if(!tagName.startsWith(noWildCard)) continue;
                    const sub = tagName.substr(noWildCard.length);
                    lookup = this._lookupMap[key];
                    lookup = this.replaceAll(lookup, "\\{0\\}", sub);
                }
            }
            if(customElements.get(tagName)) return;
            const link = document.createElement("link");
            link.setAttribute("rel", "import");
            link.setAttribute("href", lookup as string);
            document.head.appendChild(link);
        }
        
        connectedCallback(){
            const _this = this;
            this._alreadyAdded = {};
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