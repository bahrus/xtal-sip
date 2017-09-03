module xtal.elements {
    interface IReference{
        path?: string;
        async?: boolean;
        useES6Module?: boolean; 
    }
    class XtalSip extends HTMLElement{
        _href = '/web_component_ref.json';
        lookupMap: {[key: string] : string | IReference};

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
            
        }
        
        connectedCallback(){
            const _this = this;
            fetch(this._href).then(resp =>{
                resp.json().then(val => {
                    const parentNode = _this.parentNode;
                    
                })
            })
        }
    }
}