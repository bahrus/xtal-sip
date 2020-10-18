import {preemptiveImport} from './preemptiveImport.js';
import {ICssObserve} from 'css-observe/types.d.js';

import {ConditionalLoadingLookup, PreemptiveLoadingArgument} from './types.d.js';

const loadedTags = new Set<string>();

export function conditionalImport(shadowPeer: HTMLElement, lookup: ConditionalLoadingLookup){
    doManualCheck(shadowPeer, lookup);
    if(document.readyState === 'loading'){
        document.addEventListener('DOMContentLoaded', e => {
            doManualCheck(shadowPeer, lookup);
        });
    }
    import('css-observe/css-observe.js');//TODO eat your own dogfood
    const unloadedTags = [];
    for(const tagName in lookup){
        if(!loadedTags.has(tagName)) unloadedTags.push(tagName);
        loadedTags.add(tagName);
    }
    const cssObserve = document.createElement('css-observe') as ICssObserve;
    cssObserve.observe = true;
    cssObserve.selector = unloadedTags.join(',');
    cssObserve.addEventListener('latest-match-changed', (e: CustomEvent) => {
        const tag = e.detail.value as HTMLElement;
        const loadingInstructions = lookup[tag.localName];
        loadingInstructions.forEach(instruction =>{
            preemptiveImport(instruction as PreemptiveLoadingArgument);
        });
    });
    shadowPeer.insertAdjacentElement('afterend', cssObserve);
}

function doManualCheck(shadowPeer: HTMLElement, lookup: ConditionalLoadingLookup){
    let host = shadowPeer.getRootNode() as Element;
    if(host.nodeType === 9){
        host = document.firstElementChild;
    }
    for(const tagName in lookup){
        if(loadedTags.has(tagName)) continue;
        if(host.querySelector(tagName) !== null){
            loadedTags.add(tagName);
            const loadingInstructions = lookup[tagName];
            loadingInstructions.forEach(loadingInstruction =>{
                preemptiveImport(loadingInstruction as PreemptiveLoadingArgument);
            });
        }
    }
}

