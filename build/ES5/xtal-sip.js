(function(){var a='xtal-sip';if(!customElements.get(a)){var b=customElements.define,c=b.bind(customElements);customElements.define=function(a,b){var e=d.get(a);e&&Object.assign(b,e.dataset),c(a,b)};var d=function(a){function b(){return babelHelpers.classCallCheck(this,b),babelHelpers.possibleConstructorReturn(this,(b.__proto__||Object.getPrototypeOf(b)).apply(this,arguments))}return babelHelpers.inherits(b,a),babelHelpers.createClass(b,[{key:'connectedCallback',value:function(){this.getAttribute('load').split(',').forEach(function(a){b.loadDep(a)})}}],[{key:'replace',value:function(a,b,c){return a.replace(new RegExp(b,'g'),c)}},{key:'get',value:function(a){return document.head.querySelector('link[rel="preload"][data-tag="'+a+'"]')}},{key:'loadDeps',value:function(a){a.forEach(function(a){return b.loadDep(a)})}},{key:'loadDep',value:function(a){b._added[a]=!0;var c=this.get(a);if(c){var e=c,f=e.dataset;if(!customElements.get(a)){var d,g;switch(e.getAttribute('as')){case'document':d=f.importer?'c-c':'link',g='href';break;case'script':d='script',g='src';}var h=f.importer?document.body:document.head,i=document.createElement(d);i.setAttribute(g,e.getAttribute('href')),i.setAttribute('rel','import'),e.async&&i.setAttribute('async',''),setTimeout(function(){h.appendChild(i)},50)}}}},{key:'qsa',value:function(a,b){return[].slice.call(b.querySelectorAll(a))}},{key:'init',value:function(){var a=this,c={};this.qsa('link[rel-ish="preload"]',document.head).forEach(function(a){b._sub&&b._sub(a),a.dataset.tags.split(',').forEach(function(b){c[b]||(c[b]=[]),c[b].push(a)})});var d=[];for(var e in c){var f=c[e],g=void 0;if(1===f.length?g=f[0]:b._tB&&(g=b._tB(e,f)),g){if(g._a)continue;g._a=!0,d.push(g)}}d.forEach(function(b){var c=b.getAttribute('href');b.dataset.tags.split(',').forEach(function(e){var f=c,g=0;e.split('-').forEach(function(b){f=a.replace(f,'\\{'+g+'\\}',b),g++});var h=b.dataset,d=h.base||(h.baseRef?document.querySelector(h.baseRef).dataset.base:'');f=d+f;var i=b.cloneNode();i.href=f,i.dataset.tag=e,i.rel='preload',document.head.appendChild(i)})})}}]),b}(HTMLElement);d._added={};var e={};document.head.dispatchEvent(new CustomEvent(a+'-init',{detail:e})),d._tB=e.tieBreaker,d._sub=e.substitutor,d.init(),customElements.define(a,d)}})();