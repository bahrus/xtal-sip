var xtal;
(function (xtal) {
    var elements;
    (function (elements) {
        class XtalSip extends HTMLElement {
            constructor() {
                super(...arguments);
                this._href = '/web_component_ref.json';
            }
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
            loadDependency(tagName) {
                const lookup = this._lookupMap[tagName];
                if (!lookup)
                    return;
                if (customElements.get(tagName))
                    return;
                const link = document.createElement("link");
                link.setAttribute("rel", "import");
                link.setAttribute("href", lookup);
                document.head.appendChild(link);
            }
            connectedCallback() {
                const _this = this;
                fetch(this._href).then(resp => {
                    resp.json().then(val => {
                        this._lookupMap = val;
                        const parentNode = _this.parentNode;
                    });
                });
            }
        }
        customElements.define('xtal-sip', XtalSip);
    })(elements = xtal.elements || (xtal.elements = {}));
})(xtal || (xtal = {}));
//# sourceMappingURL=xtal-sip.js.map