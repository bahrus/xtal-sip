(function(){if("loading"!==document.readyState){plus()}else{document.addEventListener("DOMContentLoaded",()=>{plus()})}function plus(){const XtalSip=customElements.get("xtal-sip");function replace(str,find,replace){return str.replace(new RegExp(find,"g"),replace)}const detail={};document.head.dispatchEvent(new CustomEvent("xtal-sip-init",{detail:detail}));const tB=detail.tieBreaker,sub=detail.substitutor,tagToFakeLink={};[].slice.call(document.head.querySelectorAll("link[rel-ish=\"preload\"]")).forEach(el=>{if(sub)sub(el);el.dataset.tags.split(",").forEach(tag=>{if(!tagToFakeLink[tag])tagToFakeLink[tag]=[];tagToFakeLink[tag].push(el)})});const goodFakeLinkEls=[];for(var key in tagToFakeLink){const els=tagToFakeLink[key];let elToAdd;if(1===els.length){elToAdd=els[0]}else{if(tB){elToAdd=tB(key,els)}}if(elToAdd){if(elToAdd._a)continue;elToAdd._a=!0;goodFakeLinkEls.push(elToAdd)}}goodFakeLinkEls.forEach(el=>{const href=el.getAttribute("href");el.dataset.tags.split(",").forEach(tag=>{let modifiedHref=href,counter=0;tag.split("-").forEach(token=>{modifiedHref=replace(modifiedHref,"\\{"+counter+"\\}",token);counter++});const d=el.dataset,base=d.baseRef?window[d.baseRef].href:"";modifiedHref=base+modifiedHref;const preloadLink=el.cloneNode();preloadLink.removeAttribute("rel-ish");preloadLink.removeAttribute("data-tags");preloadLink.href=modifiedHref;preloadLink.id=tag.split("-").join("_");preloadLink.rel=el.getAttribute("rel-ish");document.head.appendChild(preloadLink)})});const notFound=[];for(var key in XtalSip._notFound){notFound.push(key)}XtalSip._notFound={};XtalSip.load(...notFound)}})();