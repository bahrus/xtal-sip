(function(){const a='xtal-sip',b=customElements.define;customElements.define=(a,d)=>{const e=c.get(a);e&&Object.assign(d,e.el.dataset),b(a,d)};class c extends HTMLElement{replace(a,b,c){return a.replace(new RegExp(b,'g'),c)}static get(a){if(c._lM){const b=c._lM[a];if(b)if(1<b.length)throw'Duplicate tagname found: '+a;else return b[0]}}static loadDeps(a){a.forEach((a)=>c.loadDep(a))}static loadDep(a){c._added[a]=!0;const b=this.get(a);if(!b)return;if(c._loaded[b.path])return;if(customElements.get(a))return;let d,e=document.head;b.isJS?(d=document.createElement('script'),d.src=b.path):b.isCC?(d=document.createElement('c-c'),d.setAttribute('href',b.path),e=document.body):(d=document.createElement('link'),d.setAttribute('rel','import'),d.setAttribute('href',b.path)),b.async&&d.setAttribute('async',''),setTimeout(()=>{e.appendChild(d)},50)}qsa(a,b){return[].slice.call((b?b:this).querySelectorAll(a))}get_h(){for(let a=this.parentElement;a;){const b=a.shadowRoot;if(b)return b;a=a.parentElement}return document.body}process_h(a){if(a){const b=c._lM;for(const a in c._added)delete b[a];for(const d in c._added={},b){if(c._added[d])continue;const b=c.get(d);if(b.preemptive){c.loadDep(d);continue}a.querySelector(d)&&c.loadDep(d)}}}connectedCallback(){if(!c._lM){c._lM={};const b={};this.qsa('link[rel-ish="preload"]',document.head).forEach((a)=>{c._sub&&c._sub(a),a.dataset.tags.split(',').forEach((c)=>{b[c]||(b[c]=[]),b[c].push(a)})});const d=[];for(var a in b){const e=b[a];let f;if(1===e.length?f=e[0]:c._tB&&(f=c._tB(a,e)),f){if(f.alreadyAdded)continue;f.alreadyAdded=!0,d.push(f)}}d.forEach((a)=>{const b=a.dataset.async!==void 0,c=a.getAttribute('href');a.dataset.tags.split(',').forEach((b)=>{let d=c,e=0;b.split('-').forEach((a)=>{d=this.replace(d,'\\{'+e+'\\}',a),e++});let f=a.dataset.base;if(!f){const b=a.dataset.baseRef;b&&(f=document.querySelector(b).dataset.base)}f||(f=''),d=f+d;const g=document.createElement('link');g.href=d,g.rel='preload',g.setAttribute('as',a.getAttribute('as')),g.dataset.tag=b,Object.assign(g.dataset,a.dataset),document.head.appendChild(g)})}),this.qsa('link[rel="preload"][data-tag]',document.head).forEach((a)=>{const b=a.dataset.tag;const d={path:a.getAttribute('href'),async:a.dataset.async!==void 0,isJS:'script'===a.getAttribute('as'),isCC:'c-c'===a.dataset.importer,preemptive:a.dataset.preemptive!==void 0,el:a},e=c._lM[b];e||(c._lM[b]=[]),c._lM[b].push(d)})}const b=this.getAttribute('load');b?b.split(',').forEach((a)=>{c.loadDep(a)}):this.process_h(this.parentElement)}}c._added={},c._loaded={},c.useJITLoading=!1;const d={};document.head.dispatchEvent(new CustomEvent(a+'-init',{detail:d})),c._tB=d.tieBreaker,c._sub=d.substitutor,customElements.define(a,c),document.addEventListener('DOMContentLoaded',()=>{const b=document.createElement(a);b.setAttribute('load','dom-bind'),document.body.appendChild(b)})})();