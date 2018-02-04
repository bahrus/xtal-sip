(function () {
    if (document.readyState !== "loading") {
        plus();
    } else {
        document.addEventListener("DOMContentLoaded", e => {
            plus();
        });
    }
    function plus(){

        const XtalSip = customElements.get('xtal-sip');
        function replace(str, find, replace) {
            return str.replace(new RegExp(find, 'g'), replace);
        }
        const detail = {};
        document.head.dispatchEvent(new CustomEvent('xtal-sip-init', {
            detail: detail,
        } as CustomEventInit));
        const tB = detail['tieBreaker'];
        const sub = detail['substitutor'];
        const tagToFakeLink = {};
        [].slice.call(document.head.querySelectorAll('link[rel-ish="preload"]')).forEach(el => {
            if (sub) sub(el as HTMLLinkElement); //substitution
            el.dataset.tags.split(',').forEach(tag => {
                if (!tagToFakeLink[tag]) tagToFakeLink[tag] = [];
                tagToFakeLink[tag].push(el);
            })
        });
        const goodFakeLinkEls = [];
        //tie breaker
        for (var key in tagToFakeLink) {
            const els = tagToFakeLink[key];
            let elToAdd;
            if (els.length === 1) {
                elToAdd = els[0];
            } else {
                if (tB) {
                    elToAdd = tB(key, els);
                }
            }
            if (elToAdd) {
                if (elToAdd['_a']) continue; //already added
                elToAdd['_a'] = true;
                goodFakeLinkEls.push(elToAdd);
            }
        }
        //Now clone fake els to real preload links to allow browser to preload link
        goodFakeLinkEls.forEach((el: HTMLElement) => {
            const href = el.getAttribute('href');
            el.dataset.tags.split(',').forEach(tag => {
                let modifiedHref = href;
                let counter = 0;
                tag.split('-').forEach(token => {
                    modifiedHref = replace(modifiedHref, '\\{' + counter + '\\}', token);
                    counter++;
                });
                const d = el.dataset;
                const base = d.baseRef ? window[d.baseRef].href : '';
                modifiedHref = base + modifiedHref;
                //from https://developer.mozilla.org/en-US/docs/Web/HTML/Preloading_content
                const preloadLink = el.cloneNode() as HTMLLinkElement;
                preloadLink.removeAttribute('rel-ish');
                preloadLink.removeAttribute('data-tags');
                preloadLink.href = modifiedHref;
                preloadLink.id = tag.split('-').join('_');
                preloadLink.rel = el.getAttribute('rel-ish'); //el.getAttribute('rel-ish') if support prefetch
                document.head.appendChild(preloadLink);
            });

        });

        const notFound = [];
        for (var key in XtalSip._notFound) {
            notFound.push(key);
        }
        XtalSip._notFound = {};
        XtalSip.load(...notFound);
    }
})();

