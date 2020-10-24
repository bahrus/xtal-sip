import {preemptiveImport} from './preemptiveImport.js';
import {ICssObserve} from 'css-observe/types.d.js';
import {ConditionalLoadingLookup, PreemptiveLoadingArgumentJS, ConditionalLoadingTuple} from './types.d.js';

const loadedTags = new Set<string>();
let addedCssObserveImport = false;
export function conditionalImport(shadowOrShadowPeer: HTMLElement | DocumentFragment, lookup: ConditionalLoadingLookup){
    doManualCheck(shadowOrShadowPeer, lookup);
    if(document.readyState === 'loading'){
        document.addEventListener('DOMContentLoaded', e => {
            doManualCheck(shadowOrShadowPeer, lookup);
        });
    }


    const unloadedTags = [];
    for(const tagName in lookup){
        if(!loadedTags.has(tagName)) unloadedTags.push(tagName);
        //loadedTags.add(tagName);
    }
    if(unloadedTags.length === 0) return;
    const cssSelector = unloadedTags.join(',');
    const cssObserve = document.createElement('css-observe') as ICssObserve;
    cssObserve.observe = true;
    cssObserve.selector = cssSelector;
    cssObserve.addEventListener('latest-match-changed', (e: CustomEvent) => {
        const tag = e.detail.value as HTMLElement;
        const loadingInstructions = lookup[tag.localName];
        loadingInstructions.forEach(instruction =>{
            preemptiveImport(instruction as PreemptiveLoadingArgumentJS);
        });
    });
    switch(shadowOrShadowPeer.nodeType){
        case 9:
        case 11:{
            shadowOrShadowPeer.appendChild(cssObserve);
            break;
        }
        default:{
            (shadowOrShadowPeer as HTMLElement).insertAdjacentElement('afterend', cssObserve);
        }
    }
    
    if(!addedCssObserveImport){
        addedCssObserveImport = true;
        // conditionalImport(shadowOrShadowPeer, {
        //     'css-observe':[
        //         ['css-observe/css-observe.js', () => import('css-observe/css-observe.js'), ({path}) => `//unpkg.com/${path}?module`]
        //     ]
        // });
        preemptiveImport(['css-observe/css-observe.js', () => import('css-observe/css-observe.js'), ({path}) => `//unpkg.com/${path}?module`,,]);
    }
}

function getContext(loadingInstruction: ConditionalLoadingTuple){
    let importOptions = loadingInstruction[3];
    if(importOptions === undefined){
        importOptions = {};
        loadingInstruction[3] = importOptions;
    }
    return importOptions;
}

function doManualCheck(shadowOrShadowPeer: HTMLElement | DocumentFragment, lookup: ConditionalLoadingLookup){

    let host = shadowOrShadowPeer.nodeType === 11 ? shadowOrShadowPeer : shadowOrShadowPeer.getRootNode() as Element;
    if(host.nodeType === 9){
        host = document.firstElementChild;
    }
    for(const tagName in lookup){
        const loadingInstructions = lookup[tagName];
        const tags = parseTag(tagName);
        let count = 0;
        for(const tagName2 of tags){
            if(loadedTags.has(tagName2)) continue;
            if(host.querySelector(tagName2) !== null){
                loadedTags.add(tagName2);
                loadingInstructions.forEach(loadingInstruction =>{
                    const clonedLoadingInstruction = {...loadingInstruction};
                    if(Array.isArray(clonedLoadingInstruction[1])){
                        clonedLoadingInstruction[1] = clonedLoadingInstruction[1][count];
                    }
                    const importOptions = getContext(clonedLoadingInstruction);
                    importOptions.localName = tagName2;
                    preemptiveImport(loadingInstruction as PreemptiveLoadingArgumentJS);
                });
            }
            count++;
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

