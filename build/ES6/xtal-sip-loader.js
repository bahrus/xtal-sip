(function(){function a(a,b){var c=document.createElement('script');c.src=a,c.async=!1,b&&(c.onload=function(){b()}),document.head.appendChild(c)}function b(){a(f+'/build/'+d+'/xtal-sip.js',c)}function c(){a(f+'/build/'+d+'/xtal-sip-plus.js')}var d='ES'+(-1<navigator.userAgent.indexOf('Trident')?'5':'6');const e=self.xtal_sip?xtal_sip.src:document.currentScript.src,f=e.split('/').slice(0,-1).join('/');'ES5'===d?a(f+'/ES5Compat.js',b):b()})();