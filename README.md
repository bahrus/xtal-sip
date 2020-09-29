# \<xtal-sip\>

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/xtal-sip)

<a href="https://nodei.co/npm/xtal-sip/"><img src="https://nodei.co/npm/xtal-sip.png"></a>

<img src="https://badgen.net/bundlephobia/minzip/xtal-sip">


Dynamically &#34;water&#34; a custom element tag with the necessary dependencies to sprout the tag from an inert seedling to a thing of beauty.

**Backdrop**: Dynamic imports are shipping in every modern browser, and the import maps proposal is gelling and is [well polyfilled](https://github.com/guybedford/es-module-shims). 

Most every web application can be recursively broken down into logical regions, building blocks which are assembled together to form the whole site.

xtal-sip takes the philosophical stance that at the most micro level, utilizing highly reusable, generic custom elements -- elements that can extend the HTML vocabulary, elements that could be incorporated into the browser, even -- forms a great fundamental "unit" to build on.

But as one zooms out from the micro to the macro, the nature of the components changes in significant ways.  

At the micro level, components will have few, if any, dependencies, and those dependencies will tend to be quite stable, and likely all be used.  The dependencies will skew more towards tightly coupled utility libraries. 

ES6 Modules (and hopefully HTML and Stylesheet Modules in the near future), combined with import maps to (optionally) centralize management of these dependencies without bundling, works great at the micro level.  But does it scale to the big picture?

xtal-sip argues that while it is certainly possible to build large applications with just modules and import maps, there are some pain points which will surface.

"Macro" level components will tend to be heavy on business-domain specific data, heavy on gluing / orchestrating smaller components, light on difficult, esoteric JavaScript.  They will also be heavy on conditional sections of the application only loading if requested by the user.

Web components (especially ES Module based) may or may not be the best fit for these application macro "modules".  A better fit might be a server-centric solution, like  [Rails](https://goiabada.blog/rails-components-faedd412ce19), just to take an example.  

A significant pain point has to do with loading all the third-party web components these macro components / compositions require, and loading them into memory only when needed.  

The goals of xtal-sip are:

1.  Provide a declarative way of progressively, dynamically loading web component dependencies into memory, only when needed.
2.  Do so without introducing another additional listing of dependencies.
3.  Help reduce boilerplate import map configuration

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

xtal-sip just emits events when encounters first instance of tag, if tag not already registered.

xtal-sip provides api ("tryImport") where can pass in preferred sequence of imports, including some "collapsing" logic so multiple tag names map to same resource, as an option.

So:

```JavaScript
const myCDN1 = 'https://unpkg.com/';
const myCDN2 = 'https://cdn.pika.dev/';
const mod = '?module';
const opt = true; //short for optimize
const imports = [

]
tryImport(() => import('@myScope/my-element.js'), opt ? [myCDN2,] : [myCDN,,mod]]]);
```

It first tries to do import('@myScope/my-element.js') by evaluating the first element of the array.
If that fails, extract out the path from the import, and join the array with no delimiter, after replacing the empty element of erray with extracted path 


