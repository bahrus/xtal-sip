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
            static get is() { return 'xtal-sip'; }
            static get observedAttributes() {
                return [
                    /** @type {string}
                     * Url of mapping file
                     */
                    'href',
                ];
            }
            static get properties() {
                return {
                    href: {
                        type: String
                    }
                };
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
            removeAttr(node) {
                node.removeAttribute('upgrade-me');
            }
            loadDependency(tagName, node) {
                if (XtalSip._alreadyAdded[tagName])
                    return this.removeAttr(node);
                XtalSip._alreadyAdded[tagName] = true;
                if (customElements.get(tagName))
                    return this.removeAttr(node);
                let lookup = this._lookupMap[tagName];
                if (!lookup) {
                    for (const key in this._lookupMap) {
                        const noWildCard = key.replace('{0}', '');
                        if (!tagName.startsWith(noWildCard))
                            continue;
                        const sub = tagName.substr(noWildCard.length);
                        lookup = this._lookupMap[key];
                        lookup = this.replaceAll(lookup, "\\{0\\}", sub);
                    }
                }
                const link = document.createElement("link");
                link.setAttribute("rel", "import");
                link.setAttribute("href", lookup);
                setTimeout(() => {
                    document.head.appendChild(link);
                }, 50);
                customElements.whenDefined(tagName).then(() => {
                    this.removeAttr(node);
                });
            }
            connectedCallback() {
                const _this = this;
                fetch(this._href).then(resp => {
                    resp.json().then(val => {
                        this._lookupMap = val;
                        const parentNode = _this.parentNode;
                        if (parentNode.hasAttribute("upgrade-me")) {
                            this.loadDependency(parentNode.tagName.toLowerCase(), parentNode);
                        }
                        const descendants = parentNode.querySelectorAll('[upgrade-me]');
                        for (let i = 0, ii = descendants.length; i < ii; i++) {
                            const descendant = descendants[i];
                            this.loadDependency(descendant.tagName.toLowerCase(), descendant);
                        }
                    });
                });
            }
        }
        XtalSip._alreadyAdded = {};
        customElements.define('xtal-sip', XtalSip);
    })(elements = xtal.elements || (xtal.elements = {}));
})(xtal || (xtal = {}));
//# sourceMappingURL=xtal-sip.js.map