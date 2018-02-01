(function () {
    var ESX = 'ES' + ((navigator.userAgent.indexOf('Trident') > -1) ? '5' : '6');
    const cs_src = self['xtal_sip'] ? xtal_sip.src : document.currentScript.src;
    const base = cs_src.split('/').slice(0, -1).join('/');
    if (ESX === 'ES5') {
        loadScript(base + '/ES5Compat.js', loadSip);
    }
    else {
        loadSip();
    }
    function loadScript(src, callBack) {
        var scr = document.createElement('script');
        scr.src = src;
        scr.async = false;
        if (callBack) {
            scr.onload = function () {
                callBack();
            };
        }
        document.head.appendChild(scr);
    }
    function loadSip() {
        loadScript(base + '/build/' + ESX + '/xtal-sip.js', loadSipPlus);
    }
    function loadSipPlus() {
        loadScript(base + '/build/' + ESX + '/xtal-sip-plus.js');
    }
})();
//# sourceMappingURL=xtal-sip-loader.js.map