# \<xtal-sip\>

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/xtal-sip)

<a href="https://nodei.co/npm/xtal-sip/"><img src="https://nodei.co/npm/xtal-sip.png"></a>

<img src="https://badgen.net/bundlephobia/minzip/xtal-sip">


Dynamically &#34;water&#34; a custom element tag with the necessary dependencies to sprout the tag from an inert seedling to a thing of beauty.

Backdrop: Dynamic imports are (almost) shipping in every modern browser, and the import maps proposal is gelling and is [well polyfilled](https://github.com/guybedford/es-module-shims). 

Most every web application can be recursivly broken down into logical regions, building blocks which are assembled together to form the whole site.

xtal-sip takes the philosophical stance that at the most micro level, utilizing highly reusable, generic custom elements -- that can extend the HTML vocubulary; candidates to be incorporated into the browser, even -- forms a great fundamental "unit" to build on.

But as one zooms out from the micro to the macro, the nature of the components changes in significant ways.  

At the micro level, components will have few, if any, dependencies, and those dependencies will tend to be quite stable.  The dependencies will skew more towards tightly coupled utility libraries. 

ES6 Modules (and hopefully HTML and CSS Modules in the near future), combined with import maps to (optionally) centralize management of these dependencies without bundling, works great at the micro level.  But does it scale to the big picture?

xtal-sip argues that while it is certainly possible to build large applications with just modules and import maps, there are some pain points which will surface.

"Macro" level components will tend to be heavy on business-domain specific data, heavy on gluing / orchestrating smaller components, light on difficult, esoteric JavaScript.  Web components (especially ES Module based) may or may not be the best fit for these application macro "modules".  A better fit might be a server-centric solution, like  [Rails](https://goiabada.blog/rails-components-faedd412ce19), just to take an example.  

A significant pain point has to do with listing all the dependencies used by these macro components / compositions, and loading them into memory only when needed.  

The goals of xtal-sip are:

1.  Provide a declarative way of progressively, dynamically loading web component dependencies into memory, only when needed.
2.  Do so without introducing another listing of dependencies.

We provide two mechanisms to do this, and the two mechanisms can be used in combination -- Global Lookup, and Local (Shadow DOM realm) Lookup.

## Global Lookup - Sample syntax

Here we use the global importmap script tag.  Either the native browser-based one, or the polyfill linked above, which uses "type=importmap-shim."  (That's why we see the * in the type below, to represent that you can use one or the other):

```html
<html>
  <head>
    ...
    <script type="importmap*">
    {
      "imports": {
        ...
        "xtal-frappe-chart/xtal-frappe-chart.js": 
            "https://cdn.jsdelivr.net/npm/xtal-frappe-chart@0.0.22/xtal-frappe-chart.js#xtal-frappe-chart",
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

Whereas native importmap script tags have to be in the head tag (I think) that is not the case for the polyfill.  In that case, placing the script tag in the header is optional, and xtal-sip should still be able to find it (as long as it is outside any ShadowDOM). 

Note the hashmark in the import map resolution, followed by the custom element tag name.  This "metadata" forms the basis for mapping between the custom element name and the import statement.

## Shortcut

In maybe 90% of the cases, the name of the js file will match the tag name.  So in this case, use #! notation:

```html
<html>
  <head>
    ...
    <script type="importmap*">
    {
      "imports": {
        ...
        "xtal-frappe-chart/xtal-frappe-chart.js": "https://cdn.jsdelivr.net/npm/xtal-frappe-chart@0.0.22/xtal-frappe-chart.js#!",
        ...
      }
    }
    </script>
    ...
  </head>
  <body>
    ...
    <xtal-sip selector="[data-imp]"></xtal-sip>
    ...
    <xtal-frappe-chart data-imp></xtal-frappe-chart> 
  </body>
</html>

```

## I know what you're thinking

The solution above doesn't make sense if it is part of a reusable web component that we might want to use in different applications.  Doing so would require consumers to have to  futz with their import map tag, which they might not even have.

##  Local mapping

For this scenario, you can still benefit from xtal-sip's support for declarative loading-as-needed, by providing the xtal-sip instance with the mapping:

```html
<html>
  <head>

    ...
  </head>
  <body>
    ...
    <xtal-sip selector="[data-imp]" mapping='{"xtal-frappe-chart":"xtal-frappe-chart/xtal-frappe-chart.js"}'>
      ...
    </xtal-sip>

    <xtal-frappe-chart data-imp></xtal-frappe-chart> 
  </body>


```

Here we see the mapping passed in as an attribute, (in JSON-attribute format).  But the array can also be passed in to the element via the mapping property.

The code first checks for mappings in the global mapping import map, and uses the JSON attribute as a fallback (this decision may be become configurable soon).

## Shortcut for local mapping

```html
<html>
  <head>

    ...
  </head>
  <body>
    ...
    <xtal-sip selector="[data-imp]" mapping='{"xtal-frappe-chart":"$0/$0.js"}'></xtal-sip>

    <xtal-frappe-chart data-imp></xtal-frappe-chart> 
  </body>


```

## Extra shortcut for local mapping

If the selector ("[data-imp]" in our example) matches a tag, but an explicit mapping is **not** found in either the global importmap script tag (via custom # notation) nor in the mapping attribute/property of the xtal-sip instance, nor any wildcard match described below, then the shortcut "$0/$0.js" will be assumed, thus reducing boilerplate even more.

## Wildcard shortcut for local mapping for packages.

Another common pattern is that web components with a certain prefix will tend to come from a package:

E.g. p-d => p-d.p-u/p-d.js, p-u => p-d.p-u/p-u.js

To help with this scenario, use 

```html
<xtal-sip selector="[data-imp]" mapping='{"p-":"p-d.p-u/p-$1.js"}'>
```

xtal-sip only affects anything within its shadow DOM realm (or outside any Shadow DOM if the tag is not inside any Shadow DOM).

**NB** If you are a bundle-phile, this component may not be right for you (depending on how the bundler treats dynamic parameters sent into dynamic imports).
