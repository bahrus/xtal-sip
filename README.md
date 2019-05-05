# \<xtal-sip\>

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/xtal-sip)

<a href="https://nodei.co/npm/xtal-sip/"><img src="https://nodei.co/npm/xtal-sip.png"></a>

<img src="https://badgen.net/bundlephobia/minzip/xtal-sip">


Dynamically &#34;water&#34; a custom element tag with the necessary dependencies to sprout the tag from an inert seedling to a thing of beauty.

**Backdrop**: Dynamic imports are (almost) shipping in every modern browser, and the import maps proposal is gelling and is [well polyfilled](https://github.com/guybedford/es-module-shims). 

Most every web application can be recursively broken down into logical regions, building blocks which are assembled together to form the whole site.

xtal-sip takes the philosophical stance that at the most micro level, utilizing highly reusable, generic custom elements -- elements that can extend the HTML vocubulary, elements that could be incorporated into the browser, even -- forms a great fundamental "unit" to build on.

But as one zooms out from the micro to the macro, the nature of the components changes in significant ways.  

At the micro level, components will have few, if any, dependencies, and those dependencies will tend to be quite stable, and likely all be used.  The dependencies will skew more towards tightly coupled utility libraries. 

ES6 Modules (and hopefully HTML and CSS Modules in the near future), combined with import maps to (optionally) centralize management of these dependencies without bundling, works great at the micro level.  But does it scale to the big picture?

xtal-sip argues that while it is certainly possible to build large applications with just modules and import maps, there are some pain points which will surface.

"Macro" level components will tend to be heavy on business-domain specific data, heavy on gluing / orchestrating smaller components, light on difficult, esoteric JavaScript.  They will also be heavy on conditional sections of the application only loading if requested by the user.

Web components (especially ES Module based) may or may not be the best fit for these application macro "modules".  A better fit might be a server-centric solution, like  [Rails](https://goiabada.blog/rails-components-faedd412ce19), just to take an example.  

A significant pain point has to do with loading all the third-party web components these macro components / compositions, and loading them into memory only when needed.  

The goals of xtal-sip are:

1.  Provide a declarative way of progressively, dynamically loading web component dependencies into memory, only when needed.
2.  Do so without introducing another additional listing of dependencies.


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

Note that we are allowing a tag name to invoke a dynamic import, passing in the name of the tag, which [now I'm thinking may raise security concerns](https://github.com/w3c/webappsec-csp/issues/243). Some additional functionality listed below has been removed, in order to guarantee better security.

By default, the component will confirm that the tag name is a valid custom element name.

If you feel the need to add additional checks, you can override the validator "validateTagName(tagName: string)" and add more stringent checks.

If the code finds the validated tag name as an import map key, it tries to do a dynamic import of that key, and if that succeeds, and the tagName gets successfully registered, a custom event is fired: "load-success", which includes the tag name that was successfully loaded in the custom event detail.

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

xtal-sip only affects anything within its shadow DOM realm (or outside any Shadow DOM if the tag is not inside any Shadow DOM).


## I know what you're thinking

While this solution works fine for your Ruby on Rails application, what if you are building a reusable web component?

The solution above is a bit dicey, if you are not on good terms with the people who configure the web sites using your web component.  You will need to convince them (via documentation or some other way) to a)  Add an importmap in index.html, and b)  add a bunch of entries for all your dynamically loaded web components.

There is no procedure that I'm aware of currently to manage the import map based off of package.json's. 

## Fallback Plan 

So what's the fallback if you want your web component to be reusable, until the ecosystem behind importmaps is more solid?

One approach to providing a fallback is as follows:

1)  You should still npm install all your dependencies.
2)  You could create a separate js file that is simply a list of static imports of all your web-component dependencies that you want to lazy-load.
3)  Subscribe to the event "load-failure" mentioned above, and the first time receiving such an event, dynamically load your separate file mentioned in step 2 using dynamic import().  Here you are implicitly relying on applicaions using some bundler (or some other mechanism) that can handle bare import specifiers, including those using dynamic imports with a hardcoded string (inside a condition).

This is the simplest fallback.  It means that all your web component dependencies will load into memory in one step, even if they aren't needed (e.g. if websites don't cooperate with your suggestion).  More sophisticated fallbacks could be developed, but this is probably a good starting point.  It's clearly not ideal.  Ideally, the person consuming your web component would have the patience to add what's needed to the importmap tag in index.html.~~

Even though loading things into memory only when needed is nice, you might want to pair that with prefetching resources via [preload](https://developer.mozilla.org/en-US/docs/Web/HTML/Preloading_content) and/or [prefetch](https://3perf.com/blog/link-rels/).


<!--
```html
<xtal-frappe-chart data-imp="web_modules/xtal-frappe-chart.js"></xtal-frappe-chart>
```




## The most long-winded explanation for a simple attribute since the invention of README 

Suppose you have 100 web components, all of which depend on a subset of the same 10 mixins.  This poses a few difficult dilemmas.  Let me walk through my current thinking on this.

1.  If http were frictionless, i.e. there was no gain from bundling, even for first time loading, keeping the files separate would be a slam dunk, due to the improved ability to employ fine-grained caching (not to mention less objective benefits like fewer opportunities for abstraction leaks -- and a few additional benefits we will uncover below).  But http/2 isn't there yet.  

2.  PikaWeb takes a pragmatic approach to this.  It assumes that the initial view will rarely, if ever, require loading more than ~100 separately packaged components, which is a good rule of thumb for the upper limit where http2's benefits (caching, etc.) outweigh the costs (the friction mentioned above).  So PikaWeb bundles each distinct package individually, which sounds quite appealing.

3.  But where the PikaWeb approach feels most painful is when thinking about those common mixins or base classes that keep getting downloaded and  loaded into memory multiple times.  If a severe security bug is found in one of the mixins / base classes, this would effectively render the entire cache toxic.

4.  There's something else to consider regarding mixins, that argues strongly for the importance of downloading only one mixin.  A serious problem with downloading multiple copies of the mixins is if the mixins make use of ES6 Symbols.  Symbols seem like the perfect solution to one of the more compelling [arguments against the use of mixins](https://reactjs.org/blog/2016/07/13/mixins-considered-harmful.html?utm_source=javascriptweekly&utm_medium=email#mixins-cause-name-clashes).  But unless I'm missing something, the symbol solution falls apart if you are counting on multiple components downloading their own copy of the mixin, but having the expectation to be able to access some global, namespace protected variable using a symbol as a key.  (By the way, string based guids would solve this problem, but who wants to memorize what the guids mean?  I guess the guid could be prefixed by a helpful string, but that means it's quite long)

5.  Import maps can solve issue 4, only if bundling isn't used.  So this would appear to make the approach of pikaweb not valid, if cross-component symbols are required.  In addition, at such an early stage of import maps, having web components *require* the use of importmaps would seriously diminish the audience willing to use the component.

So what to do?

If downloading of files were sequential and predictable, the solution would be simple -- the first file would contain all the mixins that are needed more than once.  But this is of course unrealistic, but it kind of suggests two possible pathways.

### Approach I

1.  Each component in the family sharing mixins should provide two distributions -- unbundled, and bundled, that includes all the mixins that that particular component requires.  Each commonly shared mixin is given a never changing string guid.
2.  Being that JavaScript is currently single threaded, this step is thankfully easy -- each component only uses its own copy of the mixin if it isn't yet registered using the string based guid as the key identifier.  Otherwise, it uses the already registered one (there goes Typescript support?)
3.  The "quarterback" (which I'm thinking xtal-sip would be) would choose which version of the component to retrieve, based on what mixins have been registered.  For this to work, the quarterback would need to have a lookup for each component (including components that haven't loaded), with the needed mixins.  Now we are veering into a "separate dependency" registry, which it was one my goals to avoid. I guess package maps, here we come!

### Aproach II

1.  A web component is created that just has all the mixins packaged together.  Call it the Mixin Buffet web component.  It exposes each mixin as a static property.
2.  Web components that use the mixins first check if the Mixin Buffet web component is registered.  If not, dynamically load the mixin's 
à la carte style.  This fallback again rests on either import maps or some bundling process being able to work with node-like bare specifier imports. 


xtal-sip considers Approach II to be more promising, especially as it suggests an additional feature that seems like it would be useful anyway:

## Preemptive Imports (untested)

```html
<xtal-sip prereqs="my-mixin-buffet-web-component;some-other-preemptive-web-component"></xtal-sip>
```
--

## To run locally:

npm run serve
