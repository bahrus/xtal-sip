(function(){var XtalSip=function(_HTMLElement){babelHelpers.inherits(XtalSip,_HTMLElement);function XtalSip(){babelHelpers.classCallCheck(this,XtalSip);return babelHelpers.possibleConstructorReturn(this,(XtalSip.__proto__||Object.getPrototypeOf(XtalSip)).apply(this,arguments))}babelHelpers.createClass(XtalSip,[{key:"connectedCallback",value:function connectedCallback(){var _this=this;if("loading"!==document.readyState){this.do()}else{document.addEventListener("DOMContentLoaded",function(){_this.do()})}}},{key:"do",value:function _do(){var _this2=this,tags=this.getAttribute("load").split(",");tags.forEach(function(tag){XtalSip.loadDep(tag)});var tagsNotLoadedYet=tags.slice(0);tags.forEach(function(tag){customElements.whenDefined(tag).then(function(){tagsNotLoadedYet=tagsNotLoadedYet.filter(function(t){return t!==tag});if(0===tagsNotLoadedYet.length){_this2.dispatchEvent(new CustomEvent("loaded-changed",{detail:{value:!0},bubbles:!0,composed:!0}))}})})}}],[{key:"get",value:function get(tagName){return window[tagName.split("-").join("_")]}},{key:"load",value:function load(){for(var _len=arguments.length,args=Array(_len),_key=0;_key<_len;_key++){args[_key]=arguments[_key]}args.forEach(function(tagName){return XtalSip.loadDep(tagName)})}},{key:"loadDep",value:function loadDep(tagName){var lookup=this.get(tagName);if(!lookup){XtalSip._notFound[tagName]=!0;return}var href=lookup.getAttribute("href");if(XtalSip._a[href])return;XtalSip._a[href]=!0;var d=lookup.dataset;if(customElements.get(tagName))return;var nodeName,pathName="href";switch(lookup.getAttribute("as")){case"document":nodeName="link";break;case"script":nodeName="script";pathName="src";break;case"fetch":nodeName=lookup.dataset.importer;break;}var target=d.importer?document.body:document.head,newTag=document.createElement(nodeName);newTag.setAttribute(pathName,href);newTag.setAttribute("rel","import");if(lookup.async)newTag.setAttribute("async","");setTimeout(function(){target.appendChild(newTag)},1)}}]);return XtalSip}(HTMLElement);XtalSip._a={};XtalSip._notFound={};customElements.define("xtal-sip",XtalSip)})();