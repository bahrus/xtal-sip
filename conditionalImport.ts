import {preemptiveImport} from './preemptiveImport.js';
import {ICssObserve} from 'css-observe/types.d.js';

import {ConditionalLoadingLookup, PreemptiveLoadingArgument} from './types.d.js';

const loadedTags = new Set<string>();
let addedCssObserveImport = false;
export function conditionalImport(shadowPeer: HTMLElement, lookup: ConditionalLoadingLookup){
    doManualCheck(shadowPeer, lookup);
    if(document.readyState === 'loading'){
        document.addEventListener('DOMContentLoaded', e => {
            doManualCheck(shadowPeer, lookup);
        });
    }
    if(!addedCssObserveImport){
        addedCssObserveImport = true;
        conditionalImport(shadowPeer, {
            'css-observe':[
                ['css-observe.js', () => import('css-observe/css-observe.js'), '//unpkg.com/css-observe@0.0.27/css-observe.js?module']
            ]
        });
    }

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
        const loadingInstructions = lookup[tagName];
        const tags = parseTag(tagName);
        for(const tagName2 of tags){
            if(loadedTags.has(tagName2)) continue;
            if(host.querySelector(tagName2) !== null){
                loadedTags.add(tagName2);
                loadingInstructions.forEach(loadingInstruction =>{
                    preemptiveImport(loadingInstruction as PreemptiveLoadingArgument);
                });
            }
        }

    }
}
const re = /\{([^)]+)\}/g;
function parseTag(tag: string){
    const braceSplit = tag.split(re);
    if(braceSplit.length === 1) return [tag];
    if(braceSplit.length === 3){
        const returnArr = [];
        const names = braceSplit[1].split('|');
        return names.map(name => `${braceSplit[0]}${name}${braceSplit[2]}`);
    }
    console.error(braceSplit);
}

