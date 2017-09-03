var xtal;
(function (xtal) {
    var elements;
    (function (elements) {
        /**
        * `xtal-sip`
        * Dynamically load custom elements from central config file.
        *
        * @customElement
        * @polymer
        * @demo demo/index.html
        */
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
                        if (parentNode.hasAttribute("upgrade-me")) {
                            this.loadDependency(parentNode.tagName.toLowerCase());
                        }
                        const descendants = parentNode.querySelectorAll('[upgrade-me]');
                        for (let i = 0, ii = descendants.length; i < ii; i++) {
                            const descendant = descendants[i];
                            this.loadDependency(descendant.tagName.toLowerCase());
                        }
                    });
                });
            }
        }
        customElements.define('xtal-sip', XtalSip);
    })(elements = xtal.elements || (xtal.elements = {}));
})(xtal || (xtal = {}));
//# sourceMappingURL=xtal-sip.js.map