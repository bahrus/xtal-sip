import {preemptiveImport} from './preemptiveImport.js';

import {ConditionalLoadingLookup, PreemptiveLoadingArgument} from './types.d.js';

const loadedTags = new Set<string>();

export function conditionalImport(shadowPeer: HTMLElement, lookup: ConditionalLoadingLookup){
    doManualCheck(shadowPeer, lookup);
    if(document.readyState === 'loading'){
        document.addEventListener('DOMContentLoaded', e => {
            doManualCheck(shadowPeer, lookup);
        });
    }
}

function doManualCheck(shadowPeer: HTMLElement, lookup: ConditionalLoadingLookup){
    let host = shadowPeer.getRootNode() as Element;
    if(host.nodeType === 9){
        host = document.firstElementChild;
    }
    for(var tagName in lookup){
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

