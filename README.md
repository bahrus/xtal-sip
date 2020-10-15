# \<xtal-sip\>

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/xtal-sip)

<a href="https://nodei.co/npm/xtal-sip/"><img src="https://nodei.co/npm/xtal-sip.png"></a>

<img src="https://badgen.net/bundlephobia/minzip/xtal-sip">


Dynamically &#34;water&#34; a custom element tag with the necessary dependencies to sprout the tag from an inert seedling to a thing of beauty.

<details>
<summary>
Backdrop, the good and the bad.
</summary>

The good:

Browsers now support modules, including relative references between files.  Hip hip hooray!

Dynamic imports are shipping in every modern browser, which also support relative references.  Hip hip hooray!

The bad:

When it comes to cross package resolution, on the other hand, the only proposal on the table is import maps. But whether import maps are going to be there for the long haul remains an open question, in my mind.  It has been [sitting behind a flag since version 74 in Chrome, and no release date has been announced](https://www.chromestatus.com/feature/5315286962012160).  Part of the reason for its languishing behind the flag, I think, is the lackluster response from other vendor browsers.  It is [well polyfilled](https://github.com/guybedford/es-module-shims), at least.   

Firefox is taking a bit of a [Of course...](https://www.youtube.com/watch?v=VBn8XttrSew)  [approach to the question](https://github.com/mozilla/standards-positions/issues/146).  Relying on bare import resolution still feels much more tenuous than I'd like.  The strongest case for relying on bare import resolution is there is no better competing alternative, for now.  I think, though, without some assurance of the longevity of the specification, it will be an uphill battle building the infrastructure around import maps that it so sorely needs.  VS Code / TypeScript support is quite confusing and inconsistent, as far as supporting bare import specifiers. Ironically, VSCode is more helpful in this regard if one sticks with JS.  I would be motivated to raise bug reports in VS Code / TypeScript's crushing sea of issues, but on what basis can I argue that they are under any obligation to support this "standard" in its current state?

Back to the good:

1.  It seems (by design) that the strict rules that govern bare import specifiers happens to be largely compatible with the considerably more lenient rules that bundling tools like webpack and Parcel support, and which developers have grown used to using, even during development. 
2.  For those of us who enjoy the lightweight, instantaneous feedback of build-less development, the es-dev-server does a great job of server-side "polyfilling" import maps (or bare import specifiers with package.json serving as a substitute for import maps, to be accurate).  

Back to the bad:

However, even in the sphere of web component development, not all web component libraries are making themselves compatible with the es-dev-server.  Some of that is due to legacy / backwards compatibility needs, which hopefully will fade with time.  But another looming cause is that a sizable portion of web component libraries are built on stencil (and perhaps other JSX libraries), which tends to work best with a bundling step, even during development.  The fact that the library uses JSX means that some compiling will be necessary anyway, so from that point of view, they may not care much.  But it does mean that there's a bit of a rift there.  I've tried, unsuccessfully, to use Ionic components, and Shoelace components, using bare import specifiers and the es-dev-server.  On the other hand Ionic and shoelace both provide easy CDN url's.  But pointing a library exclusively to a CDN url in the raw code doesn't seem like the right solution.

Another weakness of import maps, in my mind, is it isn't easy to collapse mappings of multiple bare import endpoints to a single bundled (CDN) url.  Perhaps this will come with bundled exchanges, but my guess is bundled exchanges will land in all browsers by the end of the decade, when the igalium-based browser reaches 99% market share.  It still seems to be only google people spearheading this initiative.  So what to do until then?

Back to the good:

Unlike other types of library references, web components have one nice advantage when it comes to imports:  They register global tag names, hence the only thing that matters is loading the library.  This, combined with the problem statement below is the impetus (currently) for xtal-sip.

Back to the bad:

Without browser support, all of these solutions depend on node.js as the development environment.  That kind of technological, exclusive cultural monoculture should give us pause.  And to take advantage of all modern web component libraries may require a bundling step as well.  Even more exclusive.

</details>

In addition to the problems discussed in detail in the "Backdrop" section above, consider this problem:

Most every web application can be recursively broken down into logical regions, building blocks which are assembled together to form the whole site.

xtal-sip takes the philosophical stance that at the most micro level, utilizing highly reusable, generic custom elements -- elements that can extend the HTML vocabulary, elements that could be incorporated into the browser, even -- form a great foundation to build on.

But as one zooms out from the micro to the macro, the nature of the components changes in significant ways.  

At the micro level, components will have few, if any, dependencies, and those dependencies will tend to be quite stable, and likely all be used.  The dependencies will skew more towards tightly coupled utility libraries. 

"Macro" level components will tend to be heavy on business-domain specific data, heavy on gluing / orchestrating smaller components, light on difficult, esoteric JavaScript.  They aren't confined to static JS files, and likely will include dynamic content as well.  They will also be heavy on conditional sections of the application only loading if requested by the user.

ES module based web components may or may not be the best fit for these application macro "modules".  A better fit might be a server-centric solution, like  [Rails](https://goiabada.blog/rails-components-faedd412ce19), just to take an example.  

A significant pain point has to do with loading all the third-party web components these macro components / compositions require, and loading them into memory only when needed.  

The goals of xtal-sip are:

1.  Provide a declarative way of progressively, dynamically loading web component dependencies into memory, only when needed.
2.  Do so without introducing another additional listing of dependencies that competes with import maps / package.json.
3.  Provide workarounds for referencing libraries where tooling solutions and browser support for bare import specifiers is inconsistent.
4.  Be compatible with technologies outside the node.js monoculture.

## dynamicImport

xtal-sip provides a function "dynamicImport" described below.

xtal-sip operates on a "strongest to weakest" hierarchy of mappings.  At the strongest level are link tags contained either in the head, or inside a footer tag.  Some of them important functionality
recognized by web browsers, such as preloading resources ahead of time.  Sticking first to JS references, we can define a slew of easily streamable mappings.  For example:

```html
<html>
  <head>
    <!-- optional, provides the most specific, and powerful mapping -->
    <!-- Use modulepreload if used during initial presentation, lazyloadmapping if not -->
    <!-- modulepreloads should go in head tag, lazyloadmapping inside a xtal-sip tag somewhere towards the end -->
    <link rel=modulepreload     href="https://cdn.snowpack.dev/@myScope@1.2.3/dist/my-bundled-elements.js" class="@myScope" integrity=...>
    
  </head>
  <body>
  ...
    <xtal-sip>
      <link rel=lazyloadmapping   href="https://unpkg.com/@yourScope@3.2.1/your-element-1.js?module" class="@yourScope" data-element="your-element" integrity=...>
    </xtal-sip>
  </body>

</html>

```

xtal-sip will be able to work with these link tags, without the benefit of import maps or bare import specifiers.  However, import maps can provide a helpful stepping stone if the browser supports it, as we will discuss below.

Then your library references can look like:

```JavaScript
dynamicImport(shadowDOMPeerElement, {
  'my-element-1':[
    ['.@myScope', () => import('@myScope/my-element-1.js'), , 'https://unpkg.com/@myScope/my-element-1.js?module']
  ],
  'my-element-2':[
    ['.@myScope', () => import('@myScope/my-element-2.js'), 'https://unpkg.com/@myScope/my-element-2.js?module'],
  ],
  'your-element':[
    [() => import('@yourScope/your-element.js'), '.@yourScope[data-element="your-element"]']
  ] 
});
```

1.  When element my-element-1 is encountered in the same ShadowDOM realm as shadowDOMPeerElement, then:
    1.  If the first element of the array is defined, and if a corresponding link can be found (after waiting for an xtal-sip tag to appear somewhere), then the href from the link tag is loaded using import(...).
    2.  If 1.1 above fails or the first element is undefined, try evaluating the second element of the array.
    3.  If 1.1 and 1.2 fail or aren't defined, do an import() of the third element of the array.



Note that the es-dev-server and most bundlers will resolve this just fine (I think), so if no link tags are present, they will resolve.  The penalty of this approach is, of course, a more complicated import statement, but now we have lazy loading into memory, a backup for running the code on a plain http server like nginx, without bundling. 

An extra challenge posed by [shoelace.style](https://shoelace.style/?id=quick-start) and [ionic](https://ionicframework.com/docs/intro/cdn#ionic-framework-cdn) is that their CDN requires not one but two references -- one to a bundled js file, the other to a css file.  I suspect other design libraries built with Stencil will follow suit (and probably has).

It's also been my experience that, with web components, referencing a css file that needs to be made outside the ShadowDOM, [when it comes to fonts](https://github.com/bahrus/scratch-box) is a common need.


How should we modify the dynamicImport function to accommodate both a js reference and a css reference that needs to be added (say) to document.head?

This is subject to change as the CSS/stylesheet/constructible stylesheet proposals flap in the wind, but I'm thinking:

```html
<html>
  <head>
    <!-- optional, provides the most specific, and powerful mapping -->
    <!-- Use modulepreload if used during initial presentation, lazyloadmapping if not -->
    <!-- modulepreloads should go in head tag, lazyloadmapping inside a xtal-sip tag somewhere towards the end -->
    <link rel=modulepreload     href="https://cdn.snowpack.dev/@myScope@1.2.3/dist/my-bundled-elements.js" class="@myScope" integrity=...>
  </head>
  <body>
  ...
    <xtal-sip>
      <link rel=lazyloadmapping   href="https://unpkg.com/@yourScope@3.2.1/your-element-1.js?module" class="@yourScope" data-element="your-element" integrity=...>
    </xtal-sip>
  </body>
</html>
```

If there will be a delay before the bundled font file will be used, then use something different from rel=preload.

```JavaScript
dynamicImport(shadowDOMPeerElement, {
  'my-element-1':[
    [() => import('@myScope/my-element-1.js'), '.@myScopeJS', 'https://cdn.snowpack.dev/@myScope/dist/my-bundled-elements.js'],
    [() => {type: 'css', scope: 'global', selector: '#@myScope/my-css', fallback: 'https://www.jsdelivr.com/package/npm/@myScope/dist/my-bundled-font.css'}]
  ],
  'my-element-2':[
    [() => import('@myScope/my-element-2.js'), '.@myScope'],
    [() => {type: 'css', scope: 'global', selector: '#@myScope/my-css', fallback: 'https://www.jsdelivr.com/package/npm/@myScope/dist/my-bundled-font.css'}]
  ],
  'your-element-1':[
    [() => import('@yourScope/your-element-1.js'), '.@yourScope']
  ] 
});

```

Note that I'm (indirectly) floating something I've not seen proposed anywhere -- that (at least for css references) the dynamic import function be extended to get the mapping look-up via a css selector to a link element in document.head, which contains the fully qualified resource URL, hashintegrities, etc.  scope = "global" signifies that this is a global css file, like a font file (font-awesome, google web fonts, etc) that needs to be added to the head tag (or some equivalent).  Being that import doesn't support this currently, we simply map to a JS configuration object instead, in lieu of some standard approach.

Relative references (relative to the JS file location) would still work with no mapping:

```JavaScript
import('./my-css.css', {type: 'css'})
```

working in some (fuzzy in my mind) constructible stylesheets.

https://bugzilla.mozilla.org/show_bug.cgi?id=1520690

https://www.chromestatus.com/features/5394843094220800

https://github.com/WICG/construct-stylesheets/issues/45#issuecomment-577674453



The concern raised by Firefox is a good one -- ideally there *would* be one solution for everything.  And it's certainly worth bringing up the issue early, to gain a fuzzy idea how this will work.  But I'm reasonably certain that the idea that there should be a single mapping that manages all cross-package mappings, for all types of resources, and for all types of attributes, is a good one to consider, but, like other similar attempts, [seems out of reach of mortals for the time being](https://en.wikipedia.org/wiki/Unified_field_theory).  That ship has sailed, essentially, by the existence of preload tags, in my opinion.

Note that the solution above relies on three systems of mapping -- JS mapping between custom element names, and a symbolic reference.  Then, for JS files, we need an importmaps JSON data structure that takes us from a "branding / scope" to a concrete domain/context/generalized resource ID for JS files, but an optional additional mapping that serves the useful purpose of prefetching without parsing.  This last mapping seems like the right place to include things like hashintegrity, specific versions, maybe even media specific mappings, etc.  And storing in this format, it can be naturally streamed, more so, perhaps, than JSON.

I don't think we should feel that bad that there isn't perfect symmetry between JS and CSS mapping.

1.  The early years of the web demonstrate that HTML can be useful by itself without external CSS files.  And clearly JS by itself can be useful -- web components can be built using JS by itself, as can many useful software applications.  But there has yet to be a significant role played by CSS files by themselves.  They exist to serve HTML.  What this means is that while the demand for JS to be able to reference other packages has been proven by the rapid rise of npm, and while the demand for HTML being able to reference third-party HTML demonstrated by the ubiquity of iframes.  This demand goes well beyond any concerns about reducing bandwidth by sharing common code.
2.  Yes, there can be popular self-contained CSS libraries, like Bootstrap or web fonts, that could be shared via a CDN.





