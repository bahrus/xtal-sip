# \<xtal-sip\>

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/xtal-sip)

<a href="https://nodei.co/npm/xtal-sip/"><img src="https://nodei.co/npm/xtal-sip.png"></a>

<img src="https://badgen.net/bundlephobia/minzip/xtal-sip">

Dynamically &#34;water&#34; a custom element tag with the necessary dependencies to sprout the tag from an inert seedling to a thing of beauty.

<details>
  <summary>Whither xtal-sip?</summary>

**NB:** xtal-sip, the web component, has decided to part ways with Middle-earth, and reminds its protégés, described below, that "The road goes ever on and on". 

xtal-sip's spirit lingers on in the hearts and minds of the functions contained in this package.  These functions are determined to carry out xtal-sip's mission.  They claim right of abode, and wish xtal-sip's next adventure be filled with peace and tranquility.

</details>

<details>
<summary>
Down the rabbit hole
</summary>

### Frabjous

Browsers now support ES modules, including relative imports between files.  Hip hip hooray!

Dynamic imports of ES modules are shipping in every modern browser, which also support relative references.  Hip hip hooray!

### Mad Hatter Snark

When it comes to cross-package resolution, on the other hand, the only proposal on the table is import maps. But whether import maps are going to be there for the long haul remains an open question, in my mind.  It has been [sitting behind a flag since version 74 in Chrome, and no release date has been announced](https://www.chromestatus.com/feature/5315286962012160).  Part of the reason for its languishing behind the flag, I think, is the lackluster response from other browser vendors.  It is [well-polyfilled](https://github.com/guybedford/es-module-shims), at least.  Firefox is taking a bit of an [Of course...](https://www.youtube.com/watch?v=VBn8XttrSew)  [approach to the question](https://github.com/mozilla/standards-positions/issues/146), which I suppose is more than can be said of Safari.  Relying on bare import resolution still feels much more tenuous than I'd like.  The strongest case for relying on bare import resolution is there is no better competing alternative, for now.  I think, though, without some assurance of the longevity of the specification via cross-browser positive gestures, it will be an uphill battle building the infrastructure around import maps that it so sorely needs.  VS Code / TypeScript support is quite confusing and inconsistent, as far as supporting bare import specifiers. Ironically, VSCode is more helpful in this regard if one sticks with JS.  I would be motivated to raise bug reports in VS Code / TypeScript's crushing sea of issues, but on what basis can I argue that they are under any obligation to support this "standard" without cross-browser endorsement?

### Beamish Polyfills

1.  It seems (by design) that the strict rules that govern import maps happen to be largely compatible with the considerably more lenient rules that bundling tools like webpack and Parcel support.  Tools which many -- but not all -- developers have grown used to / fond of using, even during development. 
2.  For those of us who enjoy the lightweight, quick to load and reload, instantaneous, abstraction-free feedback of bundle-less development, the @web/dev-server does a great job of server-side "polyfilling" import maps (or bare import specifiers with package.json serving as a substitute for import maps, to be accurate).  Other solutions from snowpack and unpkg.com are also consistent with bare import specifiers.  Perhaps with HTTP3, the gap between what is convenient to this class of developers, and what runs best in production, will continue to narrow.

### JSX Bandersnatch

However, even in the sphere of web component development, not all web component libraries are making themselves compatible with the @web/dev-server.  Some of that is due to legacy / backwards compatibility needs, which hopefully will fade with time.  But another looming cause is that a sizable portion of web component libraries are built on stencil (and perhaps other JSX libraries), which tend to work best with a bundling step, even during development.  The fact that the library uses JSX means that some compiling will be necessary anyway, so from that point of view, developers may not care much what else happens during a save.  But it does mean that there's a bit of a rift there.  I've tried, unsuccessfully, to use Ionic components, and Shoelace components, using bare import specifiers and the @web/dev-server.  On the other hand Ionic and Shoelace both provide easy CDN url's.  But pointing a library exclusively to a (versioned) CDN url in the raw code doesn't seem like the right solution.

### Slithy Standards

Another weakness of import maps, in my mind, is it isn't easy to collapse mappings of multiple bare import endpoints to a single bundled (CDN) url.  Perhaps this will come with bundled exchanges, but my guess is bundled exchanges will land in all browsers by the end of the decade, when the Igalium-based browser reaches 99% market share.  It still seems to be only Google people spearheading this initiative (bundled exchanges).  So what to do until then?

### import-manteau 

Unlike other types of library references, web components have one nice advantage when it comes to imports:  They register global tag names, hence the only thing that matters is loading the library.  This, combined with the problem statement below is the impetus (currently) for xtal-sip.

### Monodule Mimsy

Without browser support, all of these solutions depend on node.js as the development environment.  That kind of exclusive technical monoculture should give us pause.  And to take advantage of *all* modern web component libraries, including Ionic and Shoelace, it may require a bundling step as well if using bare imports only.  Even more of an exclusive set of technologies.

</details>

In addition to the problems discussed in detail in the "Backdrop" section above, consider this problem:

Most every web application can be recursively broken down into logical regions, building blocks which are assembled together to form the whole site.

xtal-sip promulgated the philosophical stance that at the most micro level, utilizing highly reusable, generic custom elements -- elements that can extend the HTML vocabulary, elements that could be incorporated into the browser, even -- form a great foundation to build on.

But as one zooms out from the micro to the macro, the nature of the components changes in significant ways.  

At the micro level, components will have few, if any, dependencies, and those dependencies will tend to be quite stable, and likely all be used.  The dependencies will skew more towards tightly coupled utility libraries. 

"Macro" level components will tend to be heavy on business-domain specific data, heavy on gluing / orchestrating smaller components, light on difficult, esoteric JavaScript.  They aren't confined to static JS files, and likely will include dynamic content as well.  They will also be heavy on conditional sections of the application only loading if requested by the user.

ES module based web components may or may not be the best fit for these application macro "modules".  A better fit might be a server-centric solution, like  [Rails](https://goiabada.blog/rails-components-faedd412ce19), just to take an example.  

A significant pain point has to do with loading all the third-party web components these macro components / compositions require, and loading them into memory only when needed.  

xtal-sip wishes to leave behind a world where:

1.  A declarative way of progressively, dynamically loading web component dependencies into memory on demand is provided.
2.  Do so without introducing another additional listing of dependencies that competes with import maps / package.json, or that isn't part of the web ecosystem.
3.  Workarounds for referencing libraries is possible, even when those libraries aren't consistent with bare import specifiers. 
4.  Productive development is possible, even outside the node.js monoculture.

## conditionalImport

xtal-sip's first protégé, conditionalImport, operates on a "strongest to weakest" ordering of mappings.  At the strongest level are link tags contained either in the head, or, for lower priority resources, towards the end.  For example:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link id="shoelace.css" rel=preload as=style href="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.0.0-beta.21/dist/shoelace/shoelace.css">
    <link id="shoelace.js" rel=modulepreload href="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.0.0-beta.21/dist/shoelace/shoelace.esm.js">
</head>
<body>
  ...
</body>
</html>
```

The browser already does some useful things with link tags, such as preloading resources ahead of time.  conditionalImport enhances/extends the functionality, building a mapping system around it, with very specific versions and integrity hashes.

At the middle specificity level, we have bare import specifiers / import maps, which can also serve the purpose of mapping to specific versions.  In some ways, it is more powerful than the link tag mappings (supporting scoped resolutions, for example), but it is less powerful in other ways (for example, inability to provide hash integrity tests).  I could see standards evolving to link these two more closely together, however.

At the lowest specificity level, our final fallback is to just load an evergreen CDN URL.  Code which makes use of this last fallback probably shouldn't hard-code the specific version in it, with the expectation of keeping up-to-date with the latest, for a variety of good-practice reasons.  It relies a bit on backwards compatibility, but it can always adopt slow moving versioning to mitigate the risk.

With link references, we can define a slew of easily streamable mappings.  For example:

```html
<html>
  <head>
    <!-- optional, provides the most specific, and powerful mapping -->
    <!-- Use modulepreload if used during initial presentation, modulelazyload if not -->
    <!-- modulepreloads should go in head tag, modulelazyload inside a xtal-sip tag somewhere towards the end -->
    <link integrity=... rel=modulepreload href="//cdn.snowpack.dev/@myScope@1.2.3/dist/my-bundled-elements.js" id="myScope/dist/my-bundled-elements.js" >
  </head>
  <body>
  ...
    <link integrity=... rel=modulelazyload  href="//unpkg.com/@yourScope@3.2.1/your-element-1.js?module" id="yourScope/your-element-1.js" >
    <link integrity=... rel=modulelazyload  href="//unpkg.com/@yourScope@3.2.1/your-element-2.js?module" id="yourScope/your-element-2.js" >
  </body>

</html>

```

xtal-sip's apprentices  will be able to work with these link tags, without the benefit of import maps or bare import specifiers.  

Then your library references can look like:

```JavaScript
conditionalImport(shadowDOMPeerElement, {
  'my-element-1':[
    ['@myScope/dist/my-bundled-elements.js', () => import('@myScope/my-element-1.js'), '//unpkg.com/@myScope/my-element-1.js?module']
  ],
  'my-element-2':[
    ['@myScope/dist/my-bundled-elements.js', () => import('@myScope/my-element-2.js'), '//unpkg.com/@myScope/my-element-2.js?module']
  ],
  'your-element-1':[
    ['@yourScope/your-element-1.js', () => import('@yourScope/your-element-1.js'), '//unpkg.com/@yourScope/your-element-1.js?module']
  ] 
});
```

1.  When element my-element-1 is encountered in the same ShadowDOM realm as shadowDOMPeerElement, then:
    1.  If the first element of the array is defined, and if a corresponding link tag can be found with matching id (after waiting for DOMContentLoaded event if required), then the href from the link tag is loaded using import(...).  Note that id's become global constants.
    2.  If 1.i finds no link tag with matching id, or the first element is undefined, if the second element of the array is defined, try evaluating it.  This is where import maps can shine.
    3.  If 1.i and 1.ii fail or aren't defined, do an import() of the third element of the array, an (evergreen) link to a CDN.

Note that the @web/dev-server and most bundlers will resolve the second element of the array just fine (I think), so if no link tags are present, the second argument will come to the rescue.  The penalty of this approach is, of course, a more complicated import statement, but now we have lazy loading into memory, an optional backup for running the code on a plain http server like nginx, with or without bundling, and optional hash integrity checks.

As mentioned earlier, perhaps if such a system took hold, import maps could, in the future, be enhanced, also, to search the link tags for a tag with matching href, and apply whatever integrity attribute it finds in this case.

Hard-coding hash integrity attributes in raw code would be a maintenance nightmare.

## Security Implications

Note that link tags are going to be causing script to load.  Most lists of "dangerous tags" to filter out [include](https://stackoverflow.com/questions/17369559/html-dangerous-tags-to-avoid-while-developing-a-chat-application) the link tag, but do make sure that is the case for your server.

## Drynk Me [TODO]

This seems pretty redundant:

```JavaScript
['@yourScope/your-element-1.js', () => import('@yourScope/your-element-1.js'), '//unpkg.com/@yourScope/your-element-1.js?module']
```

Here we see the path '@yourScope/your-element-1.js' appear three times.  We can reduce this overhead via the following notation:

```JavaScript
['@yourScope/your-element-1.js', ({path}) => import(path), ({path}) => `//unpkg.com/${path}?module`]
```

And of course if have a lot of these, the savings can be even bigger:

```JavaScript
const importFromPath = ({path}) => import(path);
const unpkgFromPath = ({path}) => `//unpkg.com/${path}?module`

...

['@myScope/my-element-1.js',      importFromPath,   ({path}) => unpkgFromPath ],
['@myScope/my-element-2.js',      '"',              '"'                       ],
['@myScope/my-element-3.js',      '"',              '"'                       ],
['@yourScope/your-element-1.js',  '"',              '"'                       ],
['@yourScope/your-element-1.js',  '"',              '"'                       ],


```

In other words, the first element of the array gets put into a context object, which can then be passed in to the remaining items of the array.

**However, there's a big problem with the above shortcut**.  In particular, the middle element of the array won't resolve correctly, if using the most common dev tools today, 
including @web/dev-server, and (I'm guessing) snowpack, unpkg, rollup, Parcel, webpack, etc.

Eventually, when import maps are ubiquitous, yes(!!), but for now, the best we can do safely is:

```JavaScript
const importFromPath = ({path}) => import(path);
const unpkgFromPath = ({path}) => `//unpkg.com/${path}?module`

...

['@myScope/my-element-1.js',      () => import('@myScope/my-element-1.js'),       ({path}) => unpkgFromPath ],
['@myScope/my-element-2.js',      () => import('@myScope/my-element-2.js'),       '"'                       ],
['@myScope/my-element-3.js',      () => import('@myScope/my-element-3.js'),       '"'                       ],
['@yourScope/your-element-1.js',  () => import('@myScope/your-element-1.js'),     '"'                       ],
['@yourScope/your-element-1.js',  () => import('@myScope/your-element-1.js'),     '"'                       ],


```

## More whittling [TODO]

JS is expensive, so anything that can be done to reduce the size of JS, while making the api less painful to work with, is a win-win.

```JavaScript
// CDN Computed Value For myScope
const CVMyScope = ({localName}) => `https://unpkg.com/@myScope/${localName}.js?module`;
conditionalImport(shadowDOMPeerElement, {
  'my-element-1':[
    ['myScope/dist/my-bundled-elements.js', () => import('@myScope/my-element-1.js'), CVMyScope]
  ],
  'my-element-2':[
    ['myScope/dist/my-bundled-elements.js', () => import('@myScope/my-element-2.js'), CVMyScope],
  ],
  'your-element':[
    ['yourScope_your-element_1', () => import('@yourScope/your-element.js')]
  ] 
});
```

## Extra dry [TODO:  only partly implemented]:

```JavaScript
// CDN Computed Value For MyScope
const CVMyScope = ({tagName}) => `//unpkg.com/@myScope/${tagName}.js?module`;
conditionalImport(shadowDOMPeerElement, {
  'my-{element-1|element-2}':[
    ['myScope_my_bundled_elements', [() => import(`@myScope/my-element-1.js`), () => import('@myScope/my-element-2.js')], CVMyScope]
  ],
});
```

There's a little bit of redundancy above, so as not to break compatibility with bundlers / polyfills.

If an element matches the first option (element-1), and the first element of the array doesn't match any link tags, then move on to the second element of the array, that focuses on import maps.

Since we matched on my-element-1, evaluate the first element of the dynamic import array.  If an element matches the second option (my-element-2), evaluate the second element of the array.  Etc.

## Preemptive Loading

If we are working on a device with sufficient memory and other resources, perhaps we don't want to wait to discover an active custom element, and want to just load the dependencies ahead of time.  Yet we do want to take advantage of the mapping fallback system this library provides.  You can use the preemptiveImport function:

```JavaScript
preemptiveImport( ['yourScope/your-element-1.js', () => import('@yourScope/your-element-1.js'), '//unpkg.com/@yourScope/your-element-1.js?module'] );
```

## Do we really need two mapping systems?

So I'm suggesting no less than two ways of mapping JS files here:

1.  A flat, streamable list of link tags, placed strategically to fit the loading sequence of files as flexibly as possible.
2.  A hierarchical look-up that recognizes sub-scoping, all in one place, tailored specifically for JS.

Having two potentially overlapping lists like this is admittedly [a bit irregular](https://www.youtube.com/watch?v=eOnTnQNNfvg).  Maybe some uber mapping system, not recognized by the browser (like package-lock.json?) could be used to generate both. Bundlers could probably be trained to look at the code and generate, at build time, the optimal link / importmap combination.

But I don't see a way around acknowledging the existence of both of these mappings, as far as the browser runtime.

## Language of the middle

An extra challenge posed by [shoelace.style](https://shoelace.style/?id=quick-start) and [ionic](https://ionicframework.com/docs/intro/cdn#ionic-framework-cdn) is that their CDN requires not one but two references -- one to a bundled js file, the other to a bundled css file.  I suspect other design libraries built with Stencil will follow suit (and probably have).

It's also been my experience that, with web components, [when it comes to fonts](https://github.com/bahrus/scratch-box), referencing a css file that needs to be placed outside any ShadowDOM is a common need.

How should we modify the conditionalImport function to accommodate both js reference(s) and css reference(s), some of them needing to be added (say) to document.head?

This is subject to change as the CSS/stylesheet modules / constructible stylesheet proposals flap in the wind, but I'm thinking [TODO]:

```html
<html>
  <head>
    <!-- optional, provides the most specific, and powerful mapping -->
    <!-- Use modulepreload, preload if used during initial presentation, lazyload, modulelazyload if not -->
    <!-- preloads should go in head tag,  lazyload's  somewhere towards the end of the document -->
    <link integrity=... rel=modulepreload     href="//cdn.snowpack.dev/@myScope@1.2.3/dist/my-bundled-elements.js" id="myScope_my_bundled_elements">
    <link integrity=... rel=preload as=style  href="//www.jsdelivr.com/@someCommonSharedCSSFramework@11.12.13/some-common-css.css" id="@someCommonSharedCSSFramework_some_common_css">
  </head>
  <body>
  ...
    <link integrity=... rel=modulelazyload   href="//unpkg.com/@yourScope@3.2.1/your-element-1.js?module" id=yourScope_your-element_1>
    <link integrity=... rel=lazyload as=style  href="//cdn.snowpack.dev/@myScope@1.2.3/dist/my-bundled-css-font.css" id="myScope_my_bundled_css_fonts">
  </body>
</html>
```


```JavaScript
const CVMyScope = ({tagName}) => `//unpkg.com/@myScope/${tagName}.js?module`;
conditionalImport(shadowDOMPeerElement, {
  'my-element-1':[
    ['myScope_my_bundled_elements', () => import('@myScope/my-element-1.js'), CVMyScope],
    [
      'myScope_my_bundled_css_fonts', 
      () => import('@myScope/my-css-font.css', {assert: {type: 'css'}}), 
      '//www.jsdelivr.com/package/npm/@myScope/dist/my-bundled-font.css',
      {cssScope: 'global'}, 
    ],
    [
      'someCommonSharedCSSFramework_some_common_css',
      () => import('@someCommonSharedCSSFramework/my-css-font.css', {assert: {type: 'css'}}),
      '//www.jsdelivr.com/@someCommonSharedCSSFramework/some-common-css.css',
      {cssScope: 'shadow'}
    ]
  ],
  'my-element-2':[
    ['myScope_my_bundled_elements', () => import('@myScope/my-element-2.js'), CVMyScope],
    [ 
      'someCommonSharedCSSFramework_some_common_css',
      () => import('@someCommonSharedCSSFramework/my-css-font.css', {assert: {type: 'css'}}), 
      '//www.jsdelivr.com/@someCommonSharedCSSFramework/some-common-css.css',
      {cssScope: 'shadow'}
    ]
  ],
  'your-element-1':[
    ['yourScope_your-element_1',() => import('@yourScope/your-element-1.js'), '//unpkg.com/@yourScope/your-element-1.js?module']
  ] 
});

```

So if the first element of the import tuple is of type object, then we are not importing JS, but something else (specified by the type).

All the other elements are shifted to the right by one.


## Are we being unfair to CSS?

Does the import map proposal impose an unfair advantage to JS over CSS?  This important question raised by Firefox really hits home with me.

The fact that we've been able to import JS now for a number of years, and not HTML, strikes me as *extremely* unfair.  Are we doing the same thing here?  I'm not sure...

Relative references (relative to the JS file location) would still work with no mapping, should CSS Stylesheet / Modules become a thing:

```JavaScript
import('./my-css.css', {type: 'css'})
```

in tandem [with](https://github.com/WICG/construct-stylesheets/issues/45#issuecomment-577674453) [constructible](https://bugzilla.mozilla.org/show_bug.cgi?id=1520690) [stylesheets](https://www.chromestatus.com/features/5394843094220800) (*how* is fuzzy in my mind).

If CSS/Stylesheet modules allows imports from JS, via relative paths, then one library package could import css packages from another via a JS cross-package "bridge" reference, which could leverage import maps. 

<details>
  <summary>Is a unifying cross-package syntax across JS / HTML / CSS / WASM really possible?</summary>

Yes, it seems it would be nice for a CSS file to reference JS files directly (following importmap rules), especially because Houdini.  So that would appear to be a next step in order to achieve symmetry and universality.

It is interesting to note that Webpack provides a node resolver for [Less](https://www.npmjs.com/package/less-loader#webpack-resolver) and SASS, using the tilda operator.  That would appear to be another prerequisite for native CSS, in order to achieve universality.

CSS imports are quite closely tied to media queries, which certainly isn't often a criteria with JS, but I can see scenarios where it might be nice to specify different JS dependencies based on media queries.  

The concern raised by Firefox is a good one -- ideally there *would* be one solution for everything.  And it's certainly worth bringing up the issue early, to gain a fuzzy idea how this will work.  But my first instinct is that the idea that there should be a single mapping that manages all cross-package mappings, for all types of resources, and for all types of attributes, is a good one to consider, but, like other similar attempts, [seems out of reach of mortals for the time being](https://en.wikipedia.org/wiki/Unified_field_theory).  That ship has sailed, essentially, by the existence of preload tags and existing import syntax for CSS, which differs from JS.

Maybe my first instinct is wrong, and it isn't that out of reach.  Let's assume, after careful analysis, that:

1.  The analysis presented here, that imports for JS is best served by a combination of flat mappings, combined with a [hierarchical JSON to represent scoping](https://github.com/WICG/import-maps#multiple-versions-of-the-same-module) is correct.
2.  The right solution for CSS is also, like JS, a combination of flat mappings, combined with a hierarchy to represent CSS Scoping.
3.  The scoping rules for JS would never conflict with the scoping rules for CSS.

We would then have a strong case that in fact it is useful to combine the two mappings into one JSON blob.  We could then expand the role of import maps, with scoping for both JS and CSS, and perhaps other hierarchies that are only applicable to JS, and other hierarchies only applicable to CSS, as additional keys in the JSON schema.

But none of this invalidates going forward with import maps for JS. Just add support for CSS when it's ready.

On the other hand, if some other data structure is best suited to complement cross-package referencing for CSS, I don't see how JS import maps would interfere with adding that TBD data structure, side-by-side with JS import mapping.

This debate reminds me a bit over the debate about [DRY](https://www.madetech.com/blog/when-to-avoid-the-dry-principle).  Is the possible elimination of a little redundancy between JS and CSS mapping worth the risk of getting locked into an unsustainable abstraction?  I honestly don't know.

</details>

I don't think we should feel that bad if there isn't perfect symmetry between JS and CSS mappings.

1.  The early years of the web demonstrate that HTML can be useful by itself without external CSS files.  And clearly JS by itself can be useful -- web components can be built using JS alone, as can many useful software applications.  But there has yet to be a significant role played by standalone CSS files.  They exist to serve HTML (or JS, depending).  What this means is that while the demand for JS to be able to reference other packages has been proven by the rapid rise of npm, and while the demand for HTML being able to reference third-party HTML demonstrated by the ubiquity of iframes and html include libraries like JQuery's load function, these demands go well beyond any concerns about reducing bandwidth by sharing common code.  The demand for sharing css files across packages has certainly proven itself -- take Bootstrap or web fonts, that can be shared via a CDN, for example.  But one doesn't find many such packages which have the kind of dependency tree we expect all the time with JS.
2.  node.css only has a fraction of the download rate as node.js. 
3.  CSS has had a syntax for importing other css files for years.  Perhaps it could be improved, but the case for reinventing the wheel, in order to match what is done for JS, is quite weak.


**NB:** There is an [interesting proposal](https://discourse.wicg.io/t/proposal-fetch-maps/4259), backed by one of the foremost experts in the area (imports of various formats / fetch / etc). that might be considered a competing proposal to using link preload/lazyload mappings suggested  here.  What that proposal and this one share is the view that import maps would help the platform, just that it might not be the last step to cross-package dependencies, and other concerns.  Baby steps!




