(function () {
    var ESX = 'ES' + ((navigator.userAgent.indexOf('Trident') > -1) ? '5' : '6');
    let cs_src = '';
    let script = document.head.querySelector('script[data-tag="xtal-sip"]');
    if (script) {
        cs_src = script['src'];
    }
    else {
        let cs = document.currentScript;
        if (cs) {
            cs_src = cs['src'];
        }
        else {
            cs_src = '/bower_components/xtal-sip/stal-sip-loader.js';
        }
    }
    if (ESX === 'ES5') {
        var es5Compat = document.createElement('script');
        es5Compat.src = cs_src.replace('xtal-sip-loader.js', 'ES5Compat.js');
        document.head.appendChild(es5Compat);
    }
    var cs = cs_src.replace('xtal-sip-loader.js', 'build/' + ESX + '/xtal-sip.js'); //TODO
    var sc = document.createElement('script');
    sc.src = cs;
    document.head.appendChild(sc);
})();
//# sourceMappingURL=xtal-sip-loader.js.map