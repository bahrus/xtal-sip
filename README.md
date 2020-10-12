# \<xtal-sip\>

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/xtal-sip)

<a href="https://nodei.co/npm/xtal-sip/"><img src="https://nodei.co/npm/xtal-sip.png"></a>

<img src="https://badgen.net/bundlephobia/minzip/xtal-sip">


Dynamically &#34;water&#34; a custom element tag with the necessary dependencies to sprout the tag from an inert seedling to a thing of beauty.

<details>
<summary>
**Backdrop, the good and the bad.**
</summary>

The good:

Browsers now support modules, including relative references between files.  Hip hip hooray!

Dynamic imports are shipping in every modern browser, which also support relative references.  Hip hip hooray!

The bad:

When it comes to cross package resolution, on the other hand, the only proposal on the table is import maps, but whether import maps are going to be there for the long haul remains an open question, in my mind.  It has been [sitting behind a flag since version 74 in Chrome, and no release date has been announced](https://www.chromestatus.com/feature/5315286962012160).  Part of the reason for it's languishing behind the flag, I think, is the response from other vendor browsers.  It is [well polyfilled](https://github.com/guybedford/es-module-shims), at least. 

Firefox is being quite unhelpful [https://github.com/mozilla/standards-positions/issues/146] in the most fundamental task of clearing the way for supporting node resolution across packages -- neither approving nor providing any good reasons why not to approve.  And even that is probably more than can be said for Safari.  Until at least one of those vendors either goes out of business, or gives a whiff of a nod of approval, at least, relying on bare import resolution still feels much more tenuous than I'd like.  The strongest case for relying on bare import resolution is there is no competing alternative, for now.  I think, though, without some assurance of the longevity of specification, it will be an uphill battle building the infrastructure around import maps that it so sorely needs.

Back to the good:

1.  It seems that the strict rules that govern bare import specifiers are largely compatible with the considerably more lenient rules that bundling tools like webpack and parcel support, and which developers have grown used to using, even during development. 
2.  For those of us who enjoy the lightweight, instantaneous feedback of build-less development, the es-dev-server does a great job of server-side "polyfilling" import maps.  

Back to the bad:

However, even in the sphere of web component development, not all web component libraries are making themselves compatible with the es-dev-server.  Some of that is due to legacy / backwards compatibility needs, which hopefully will fade with time.  But another looming cause is that a sizable portion of web component libraries are built on stencil (and perhaps other JSX libraries), which tends to work best with a bundling step, even during development.  The fact that the library uses JSX means that some compiling will be necessary anyway, so from that point of view, they may not care much.  But it does mean that there's a bit of a rift there.  I've tried, unsuccessfully, to use Ionic components, and Shoelace components, using bare import specifiers and the es-dev-server.  On the other hand Ionic and shoelace oth provide easy CDN url's.  But pointing a library to CDN url doesn't seem like the right solution.

Back to the good:

Unlike other types of library references, web components have one nice advantage when it comes to imports:  They registered global tag names, hence the only think that matters is loading the library.  This, combined with the problem statement below is the impetus (currently) for xtal-sip.

Back to the bad:

Without browser support, all of these solutions depend on node.js as the development environment.  That kind of technological exclusivity should give us pause.

</details>

Most every web application can be recursively broken down into logical regions, building blocks which are assembled together to form the whole site.

xtal-sip takes the philosophical stance that at the most micro level, utilizing highly reusable, generic custom elements -- elements that can extend the HTML vocabulary, elements that could be incorporated into the browser, even -- form a great foundation to build on.

But as one zooms out from the micro to the macro, the nature of the components changes in significant ways.  

At the micro level, components will have few, if any, dependencies, and those dependencies will tend to be quite stable, and likely all be used.  The dependencies will skew more towards tightly coupled utility libraries. 

"Macro" level components will tend to be heavy on business-domain specific data, heavy on gluing / orchestrating smaller components, light on difficult, esoteric JavaScript.  They aren't confined to static JS files, but could include dynamic content as well.  They will also be heavy on conditional sections of the application only loading if requested by the user.

ES module based web components may or may not be the best fit for these application macro "modules".  A better fit might be a server-centric solution, like  [Rails](https://goiabada.blog/rails-components-faedd412ce19), just to take an example.  

A significant pain point has to do with loading all the third-party web components these macro components / compositions require, and loading them into memory only when needed.  

The goals of xtal-sip are:

1.  Provide a declarative way of progressively, dynamically loading web component dependencies into memory, only when needed.
2.  Do so without introducing another additional listing of dependencies.
3.  Provide workarounds for referencing libraries where tooling solutions and browser support for bare import specifiers is inconsistent.
4.  Be compatible with technologies outside the node.js monoculture.

## Convention over Configuration

xtal-sip takes a cue from Ruby on Rails and adopts the Convention over Configuration philosophy.  Import maps are flexible enough that they should be able to map "name-of-element" to whatever you need it to.  So xtal-sip assumes, by default, that we can list all web components we want to dynamically load with key "name-of-element" in the import map.  

To customize what key to look for in the importmap JSON, you can subclass xtal-sip and override:

```TypeScript
  getImportKey(tagName: string) {
    //Override this if you want
    return `${tagName}`;
  }
```

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

xtal-sip provides api ("tryImport") where can pass in preferred sequence of imports, including some "collapsing" logic so multiple tag names map to same resource, as an option.

So:

```JavaScript
const unpkg = 'https://unpkg.com/';
const pika = 'https://cdn.pika.dev/';
const mod = '?module';
const version = '@^1.2.3';
const bundled = true; 
const imports = [

]
tryImport(() => import('@myScope/my-element.js'), version, bundled ? pika : [unpkg, mod]]]);
```

1.  It first tries to do import('@myScope/my-element.js') by evaluating the first element of the array.
2.  If import works, skip the rest.
2.  If it fails, extract out the path from the import, insert the version specified in the second parameter.  In this example, we have @myScope@1.2.3/my-element.js
3.  The third parameter is a  base CDN url, or an array consisting of the base CDN url and a suffix string.  
4.  import([fullyQualifiedCNDUrl from step 3]).

