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

## tryImport

xtal-sip provides a function "tryImport" which can passed in a pair of imports to use.

So:

```html
<html>
  <head>
    <!-- optional, backup if import maps not supported -->
    <!-- Use modulepreload if used during initial presentation, lazyload if not -->
    <link class="@myScope"    rel=modulepreload href="https://cdn.snowpack.dev/@myScope@1.2.3/dist/my-bundled-elements.js">
    <link class="@yourScope"  rel=lazyload      href="https://unpkg.com/@yourScope@3.2.1/your-element-1.js?module">
  </head>
  <body>
  ...
  </body>
</html>

```

Then your library references can look like:




```JavaScript
dynamicImport(shadowDOMPeerElement, {
  'my-element-1':[
    [() => import('@myScope/my-element-1.js'), '.@myScope', 'https://unpkg.com/@myScope/my-element-1.js?module']
  ],
  'my-element-2':[
    [() => import('@myScope/my-element-2.js'), '.@myScope'],
  ],
  'your-element-1':[
    [() => import('@yourScope/your-element-1.js'), '.@yourScope']
  ] 
});
```

1.  When element my-element-1 is encountered in the same ShadowDOM realm as shadowDOMPeerElement, it first tries to do import('@myScope/my-element.js') by evaluating the first element of the array, hoping that import maps is supported by the browser and/or server, and that the import map file is set up properly..
2.  If import works, skip the rest.
3.  If it fails, do a dynamic import(s) of the matching link element(s), based on the css query of the second parameter inside document.head, if at least one node element is found.
4.  If no node elements found in step 3, use the optional third option.  Including a version in the url seems like a maintenance nightmare, but can certainly be done.


Note that the es-dev-server and most bundlers will resolve this just fine (I think).

An extra challenge posed by [shoelace.style](https://shoelace.style/?id=quick-start) and [ionic](https://ionicframework.com/docs/intro/cdn#ionic-framework-cdn) is that their CDN requires not one but two references -- one to a bundled js file, the other to a css file.  I suspect other design libraries built with Stencil will follow suit (and probably has).

It's also been my experience that, with web components, referencing a css file that needs to be made outside the ShadowDOM, [when it comes to fonts](https://github.com/bahrus/scratch-box) is a common need.


How should we modify the dynamicImport function to accommodate both a js reference and a css reference that needs to be added (say) to document.head?

This is subject to change as the CSS/stylesheet module proposal flaps in the wind, but maybe:

```html
<html>
  <head>
    <!-- optional, backup if import maps not supported -->
    <!-- Use modulepreload if used during initial presentation, lazyload if not -->
    <link class="@myScope"  cors=...  rel=modulepreload href="https://cdn.snowpack.dev/@myScope@1.2.3/dist/my-bundled-elements.js" hashintegrity=...>
    <link id="@yourScope/your-element-1"  rel=jsLazyLoad  href="https://unpkg.com/@yourScope@3.2.1/your-element-1.js?module" hashintegrity=...>
    <link rel=preload id="@myScope/my-css" as="style" href="https://cdn.snowpack.dev/@myScope@1.2.3/dist/my-bundled-font-css.js">
  </head>
  <body>
  ...
  </body>
</html>
```

```JavaScript
dynamicImport(shadowDOMPeerElement, {
  'my-element-1':[
    [() => import('@myScope/my-element-1.js'), '.@myScopeJS'],
    [() => import('@myScope/my-font.css', {type: 'css', scope: 'global' /* document.head */}), '.@myScopeCSS']
  ],
  'my-element-2':[
    [() => import('@myScope/my-element-2.js'), '.@myScope'],
    [() => import('#@myScope/my-css', {type: 'css'})]
  ],
  'your-element-1':[
    [() => import('@yourScope/your-element-1.js'), '.@yourScope']
  ] 
});

```

Note that I'm floating something I've not seen proposed anywhere -- that (at least for css references) the dynamic import function be extended to get the mapping look-up via an id to a link element, which contains the fully qualified resource URL, hashintegrities, etc.  Relative references (relative to the JS file location) would still work with no mapping:

```JavaScript
import('./my-css.css', {type: 'css'})
```

The concern raised by Firefox is a good one -- ideally there *would* be one solution for everything.  In other words, the idea that there should be a single mapping that manages all cross-package mappings, for all types of resources, and for all types of attributes, is a good one, but, like other similar attempts, [seems out of reach of mortals for the time being](https://en.wikipedia.org/wiki/Unified_field_theory).  That ship has sailed, essentially, by the existence of preload tags, in my opinion.

Note that the solution above relies on three systems of mapping -- JS mapping between custom element names, and a symbolic reference.  Then the importmaps JSON provides that takes us from a "branding / scope" to a concrete domain/context/generalized resource ID, but an additional mapping that serves the useful purpose of prefetching without parsing.  This last mapping seems like the right place to include things like hashintegrity, specific versions, maybe even media specific mappings, etc.  And storing in this format, it can be naturally streamed, more so than JSON.



1.  The early years of the web demonstrate that HTML can be useful by itself without external CSS files.  And clearly JS by itself can be useful -- web components can be built using JS by itself, as can many useful software applications.  But there has yet to be a significant role played by CSS files by themselves.  They exist to serve HTML.  What this means is that while the demand for JS to be able to reference other packages has been proven by the rapid rise of npm, and while the demand for HTML being able to reference third-party HTML demonstrated by the ubiquity of iframes.  This demand goes well beyond any concerns about reducing bandwidth by sharing common code.
2.  Yes, there can be popular self-contained CSS libraries, like Bootstrap, that could be shared 

https://bugzilla.mozilla.org/show_bug.cgi?id=1520690

https://www.chromestatus.com/features/5394843094220800

https://github.com/WICG/construct-stylesheets/issues/45#issuecomment-577674453

```JavaScript
const bundledPath

xtal-sip checks if that key can be found in the global importmap.


If the code finds the (modified) tag name as an import map key, it tries to do a dynamic import of that key, as soon as it detects that tag name added to the active DOM tree within its shadow DOM realm.  If that succeeds, and the tagName gets successfully registered, a custom event is fired: "load-success", which includes the tag name that was successfully loaded in the custom event detail.

If no such key is found in the importmap JSON, or if the dependency fails to load, or doesn't succeed in registering the custom element, another custom event is fired, "load-failure" with the same detail information.

So here's some sample syntax.


```html
<html>
  <head>
    ...
    <!-- Polyfill: <script type="importmap-shim"> -->
    <script type="importmap"> 
    {
      "imports": {
        ...
        "xtal-frappe-chart": 
            "https://cdn.jsdelivr.net/npm/xtal-frappe-chart@0.0.22/xtal-frappe-chart.js",
        ...
      }
    }
    </script>
    ...
    
  </head>
  <body>
      <xtal-sip>
        <script nomodule>["xtal-frappe-chart"]</script>
      </xtal-sip>
    ... 

    <xtal-frappe-chart></xtal-frappe-chart> 
  </body>
</html>

```


## I know what you're thinking, Part I

Q:  Why not just do this?

```html
<script type="module">import('xtal-frappe-chart');</script>
<xtal-frappe-chart></xtal-frappe-chart>
```

A:  There are so many things wrong with doing that.

1.  It completely invalidates the usefulness of this web component.
2.  Kind of boring, don't you think?
3.  You bore me.
4.  For simple cases, sure.  But if you have lots of conditional loading logic, you have to remember to include the script line alongside the element.  
5.  The script might detract from the beautiful markup.
6.  That's lots of little script lines the browser has to parse.
7.  This actually doesn't work if the html is dynamically generated on the client (for example, comes from a cloned template inside shadowDOM)

## Adding CSS Conditional Matching

You can also do this:

```html
  <body>
      <xtal-sip>
        <script nomodule>["xtal-frappe-chart[load]"]</script>
      </xtal-sip>
    ... 

    <xtal-frappe-chart></xtal-frappe-chart> 
  </body>
```

This will not load the xtal-frappe-chart library until attribute "load" is added to the xtal-frappe-chart tag.

## Collapsing / Key specifying [TODO, experimental syntax]

Because the import map proposal doesn't currently allow any kind of wildcard / collapsing resolutions (apparently to be supported by web packaging), it is quite cumbersome to maintain a one-to-one mapping in some cases.

To support this scenario, the following import map non standard keys are interpreted by xtal-sip in a special way:

```html
<script type="importmap">
{
    "imports": {
      "-md": "https://cdn.pika.dev/myMDThemedComponents",
      "xtal-": "https://cdn.pika.dev/myXtalScopedComponents",
      "xtal-*-md": "https://cdn.pika.dev/myXtalScopedMDThemedComponents"
    }
}
</script>
```

## I know what you're thinking, Part II

While this solution works fine for your Ruby on Rails application, what if you are building a reusable web component?

The solution above is a bit dicey, if you are not on good terms with the people who configure the web sites using your web component.  You will need to convince them (via documentation or some other way) to a)  Add an importmap in index.html, and b)  add a bunch of entries for all your dynamically loaded web components.

We are only [beginning to see automated solutions](https://github.com/open-wc/open-wc/tree/master/packages/import-maps-generate) for generating import mappings inside an html file, so watch this space.

## Fallback Plan 

So what's the fallback if you want your web component to be reusable, until the ecosystem behind importmaps is more solid?

One approach to providing a fallback is as follows:

1)  You should still npm install all your dependencies.
2)  You could create a separate js file that is simply a list of static imports of all your web-component dependencies that you want to lazy-load.
3)  Subscribe to the event "load-failure" mentioned above, and the first time receiving such an event, dynamically load your separate file mentioned in step 2 using dynamic import().  Here you are implicitly relying on applicaions using some bundler (or some other mechanism) that can handle bare import specifiers, including those using dynamic imports with a hardcoded string (inside a condition).

This is the simplest fallback.  It means that all your web component dependencies will load into memory in one step, even if they aren't needed (e.g. if websites don't cooperate with your suggestion).  More sophisticated fallbacks could be developed, but this is probably a good starting point.  It's clearly not ideal.  Ideally, the person consuming your web component would have the patience to add what's needed to the importmap tag in index.html.

Even though loading things into memory only when needed is nice, you might want to pair that with prefetching resources via [preload](https://developer.mozilla.org/en-US/docs/Web/HTML/Preloading_content) and/or [prefetch](https://3perf.com/blog/link-rels/).

## Preemptive Loading 

Just add an exclamation (!) at the end of the tag name:

```html
<html>
  <head>
    ...
    <!-- Polyfill: <script type="importmap-shim"> -->
    <script type="importmap"> 
    {
      "imports": {
        ...
        "xtal-frappe-chart": 
            "https://cdn.jsdelivr.net/npm/xtal-frappe-chart@0.0.22/xtal-frappe-chart.js",
        ...
      }
    }
    </script>
    ...
    
  </head>
  <body>
      <xtal-sip>
        <script nomodule>["xtal-frappe-chart!"]</script>
      </xtal-sip>
    ... 

    <xtal-frappe-chart></xtal-frappe-chart> 
  </body>
</html>

```

## To run locally:

npm run serve


Take three:

xtal-sip just emits events when it encounters first instance of tag, if tag not already registered.



