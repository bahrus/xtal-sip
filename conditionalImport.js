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
        const loadingInstructions = lookup[tagName];
        const tags = parseTag(tagName);
        console.log(tags);
        for (const tagName2 of tags) {
            if (loadedTags.has(tagName2))
                continue;
            if (host.querySelector(tagName2) !== null) {
                loadedTags.add(tagName2);
                loadingInstructions.forEach(loadingInstruction => {
                    preemptiveImport(loadingInstruction);
                });
            }
        }
    }
}
const re = /\{([^)]+)\}/g;
function parseTag(tag) {
    const braceSplit = tag.split(re);
    if (braceSplit.length === 1)
        return [tag];
    if (braceSplit.length === 3) {
        const returnArr = [];
        const names = braceSplit[1].split('|');
        return names.map(name => `${braceSplit[0]}${name}${braceSplit[2]}`);
    }
    console.error(braceSplit);
}
