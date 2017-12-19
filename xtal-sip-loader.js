(function () {
    var ESX = 'ES' + ((navigator.userAgent.indexOf('Trident') > -1) ? '5' : '6');
    var cs = document.currentScript['src'].replace('xtal-sip-loader.js', 'build/' + ESX + '/xtal-sip.js');
    var sc = document.createElement('script');
    sc.src = cs;
    document.head.appendChild(sc);
})();
//# sourceMappingURL=xtal-sip-loader.js.map