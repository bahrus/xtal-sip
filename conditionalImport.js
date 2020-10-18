export function conditionalImport(shadowPeer, lookup) {
}
const eventNames = ["animationstart", "MSAnimationStart", "webkitAnimationStart"];
export function addCSSListener(id, self, targetSelector, insertListener, customStyles = '') {
    // See https://davidwalsh.name/detect-node-insertion
    if (self._boundInsertListeners === undefined) {
        self._boundInsertListeners = {};
    }
    const boundInsertListeners = self._boundInsertListeners;
    if (boundInsertListeners[targetSelector] !== undefined)
        return;
    const styleInner = /* css */ `
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

    ${customStyles}`;
    const style = document.createElement('style');
    style.innerHTML = styleInner;
    self._host = self.getRootNode(); //experimental  <any>getShadowContainer((<any>this as HTMLElement));
    if (self._host.nodeType === 9) {
        self._host = document.firstElementChild;
    }
    const hostIsShadow = self._host.localName !== 'html';
    if (hostIsShadow) {
        self._host.appendChild(style);
    }
    else {
        document.head.appendChild(style);
    }
    boundInsertListeners[targetSelector] = insertListener.bind(self);
    const container = hostIsShadow ? self._host : document;
    eventNames.forEach(name => {
        container.addEventListener(name, boundInsertListeners[targetSelector], false);
    });
}
