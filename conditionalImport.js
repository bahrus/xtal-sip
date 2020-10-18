import { preemptiveImport } from './preemptiveImport.js';
const loadedTags = new Set();
export function conditionalImport(shadowPeer, lookup) {
    doManualCheck(shadowPeer, lookup);
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', e => {
            doManualCheck(shadowPeer, lookup);
        });
    }
    import('css-observe/css-observe.js'); //TODO eat your own dogfood
    const unloadedTags = [];
    for (const tagName in lookup) {
        if (!loadedTags.has(tagName))
            unloadedTags.push(tagName);
        loadedTags.add(tagName);
    }
    const cssObserve = document.createElement('css-observe');
    cssObserve.observe = true;
    cssObserve.selector = unloadedTags.join(',');
    cssObserve.addEventListener('latest-match-changed', (e) => {
        const tag = e.detail.value;
        const loadingInstructions = lookup[tag.localName];
        loadingInstructions.forEach(instruction => {
            preemptiveImport(instruction);
        });
    });
    shadowPeer.insertAdjacentElement('afterend', cssObserve);
}
function doManualCheck(shadowPeer, lookup) {
    let host = shadowPeer.getRootNode();
    if (host.nodeType === 9) {
        host = document.firstElementChild;
    }
    for (const tagName in lookup) {
        if (loadedTags.has(tagName))
            continue;
        if (host.querySelector(tagName) !== null) {
            loadedTags.add(tagName);
            const loadingInstructions = lookup[tagName];
            loadingInstructions.forEach(loadingInstruction => {
                preemptiveImport(loadingInstruction);
            });
        }
    }
}
