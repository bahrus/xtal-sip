# \<xtal-sip\>

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/xtal-sip)

<a href="https://nodei.co/npm/xtal-sip/"><img src="https://nodei.co/npm/xtal-sip.png"></a>

<img src="https://badgen.net/bundlephobia/minzip/xtal-sip">


Dynamically &#34;water&#34; a custom element tag with the necessary dependencies to sprout the tag from an inert seedling to a thing of beauty.

**Backdrop**: Dynamic imports are (almost) shipping in every modern browser, and the import maps proposal is gelling and is [well polyfilled](https://github.com/guybedford/es-module-shims). 

Most every web application can be recursivly broken down into logical regions, building blocks which are assembled together to form the whole site.

xtal-sip takes the philosophical stance that at the most micro level, utilizing highly reusable, generic custom elements -- elements that can extend the HTML vocubulary, elements that could be incorporated into the browser, even -- forms a great fundamental "unit" to build on.

But as one zooms out from the micro to the macro, the nature of the components changes in significant ways.  

At the micro level, components will have few, if any, dependencies, and those dependencies will tend to be quite stable, and likely all be used.  The dependencies will skew more towards tightly coupled utility libraries. 

ES6 Modules (and hopefully HTML and CSS Modules in the near future), combined with import maps to (optionally) centralize management of these dependencies without bundling, works great at the micro level.  But does it scale to the big picture?

xtal-sip argues that while it is certainly possible to build large applications with just modules and import maps, there are some pain points which will surface.

"Macro" level components will tend to be heavy on business-domain specific data, heavy on gluing / orchestrating smaller components, light on difficult, esoteric JavaScript.  They will also be heavy on conditional sections of the application only loading if requested by the user.

Web components (especially ES Module based) may or may not be the best fit for these application macro "modules".  A better fit might be a server-centric solution, like  [Rails](https://goiabada.blog/rails-components-faedd412ce19), just to take an example.  

A significant pain point has to do with listing all the dependencies used by these macro components / compositions, and loading them into memory only when needed.  

The goals of xtal-sip are:

1.  Provide a declarative way of progressively, dynamically loading web component dependencies into memory, only when needed.
2.  Do so without introducing another additional listing of dependencies.


## Convention over Configuration

xtal-sip takes a cue from Ruby on Rails and adopts the Convention over Configuration philosophy.  Import maps are flexible enough that they should be able to map [name-of-element]/[name-of-element].js to whatever you need it to.  So xtal-sip always assumes that we can list all web components we want to dynamically load with key [name-of-element]/[name-of-element].js in the import map.  

To customize what key to look for in the importmap JSON, you can subclass xtal-sip and override:

```JavaScript
  getImportKey(tagName: string) {
    //Override this if you want
    return `${tagName}/${tagName}.js`;
  }
```

xtal-sip checks if that key can be found in the global importmap.

If it finds it, it tries to do a dynamic import of that key, and if that succeeds, and the tagName gets successfully registered, a custom event is fired: "load-success", which includes the tag name that was successfully loaded in the custom event detail.

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
        "xtal-frappe-chart/xtal-frappe-chart.js": 
            "https://cdn.jsdelivr.net/npm/xtal-frappe-chart@0.0.22/xtal-frappe-chart.js",
        ...
      }
    }
    </script>
    ...
    
  </head>
  <body>
    <xtal-sip selector="[data-imp]"></xtal-sip>
    ... 

    <xtal-frappe-chart data-imp></xtal-frappe-chart> 
  </body>
</html>

```

## I know what you're thinking

While this solution works fine for your Ruby on Rails application, what if you are building a reusable web component?

The solution above is a bit dicey, if you are not on good terms with the people who configure the web sites usuing your web component.  You will need to convince them (via documentation or some other way) to a)  Add an importmap in index.html, and b)  add a bunch of entries for all your dynamically loaded web components.

There is no procedure that I'm aware of currently to manage the import map based off of package.json's.  

So what's the fallback if you want your web component to be reusable, until the ecosystem behind importmap's is more solid?

The only current failback xtal-sip provides is as follows:

1)  You should stll npm install all your dependencies.
2)  You could create a separate js file that is simply a list of static imports of all your web-component dependencies that you want to lazy-load.
3)  Subscribe to the event "load-failure" mentioned above, and the first time receiving such an event, dynamically load your separate file mentioned in step 2 using dynamic import().

This is the simplest fallback.  It means that all your web component dependencies will load into memory in one step, even if it isn't needed (iif websites don't cooperate with your suggestion).  More sophisticated fallbacks could be developed, but this is probably a good starting point.  It's clearly not ideal.  Ideally, the person consuming your web component would have the patience to add what's needed to the importmap tag in index.html.

Even though loading things into memory only when needed is nice, you might want to pair that with prefetching resources via [preload](https://developer.mozilla.org/en-US/docs/Web/HTML/Preloading_content) and/or [prefetch](https://3perf.com/blog/link-rels/).

xtal-sip only affects anything within its shadow DOM realm (or outside any Shadow DOM if the tag is not inside any Shadow DOM).  

## To run locally

npm run serve
