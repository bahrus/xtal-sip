[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/bahrus/xtal-sip)

# \<xtal-sip\>

<a href="https://www.webcomponents.org/element/bahrus/xtal-sip/demo/index.html">Demo</a>

Dynamically "water" a custom element tag with the necessary dependency to sprout the tag from an inert seedling to a thing of beauty.  Dependency free.

NB:  This component suffers currently in terms of IDE and build support, especially compared to the Polymer supported [lazy-imports](https://github.com/Polymer/lazy-imports).

Importing the files needed for web components seems likely to become a lot more complicated.  Some references will come from bower_components, some from node_modules.  Some will be references to html files, others js files.  And the references are likely to be in a state of flux, as the [whims of elite developers](https://codeburst.io/the-javascript-modules-limbo-585eedbb182e) change.  Components will first migrate to node_modules (how will we explain to our grandkids that web components are node modules?).   As support for HTML Imports wanes, many  *.html files will be converted to *.js files, then to *.mjs files, then back to *.mhtml files, once the W3C Ents show some HTML love.  That will shortly be followed by converting them to *.wasm, followed by the Universal binary format that includes HTML, JS, CSS, WASM: *.xap.

This component, \<xtal-sip\> is intended to "centralize the pain."  Keep the mappings between custom element tags and where to load the references for them all in one place.

The annoying thing about HTMLImports (and ES6 Modules for that matter) is that creating references for each referenced web component inside an HTML or JS file feels like tedius busy work -- for HTML files, one must go towards the top of the page (outside any templates) to add the reference, and typically the reference is just a trite formulaic derivative of the tag name itself.  E.g. \<paper-input\> => \<link rel="import" href="../paper-input/paper-input.html"\>, \<paper-checkbox\> => \<link rel="import" href="../paper-checkbox/paper-checkbox.html"\>.   And all these references add to the footprint of the application.

On top of that, leveraging a CDN when deploying [some of the] files to production could also be simplified by managing dependencies centrally.  Or maybe some components should only be activated in debug mode on the developer's workstation, but not deployed to production.

Another scenario is when raw HTML content containing web components is rendered inside a code-centric framework, like (P)react.  Not having a good solution to this scenario may partly explain why we are "throwing in the towel," pushing web components that might be 99% static markup, 1% JavaScript, to be packaged entirely coded in JavaScript. Sad!  

What if the markup is generated by a server-side framework like asp.mvc or Java EE MVC, which may use web components to supplement the server-side generated HTML?  Although we are not supposed to use the PWA Hacker News site to ["compare the performance of one PWA to another"](https://hnpwa.com/), one can't help noticing that the fastest performing implementation is the one that uses [no JavaScript, other than the service worker](https://github.com/davideast/hnpwa-firebase). Clearly, this is an architecture we can't dismiss.  But creating the web component references in a different location from the custom element tags when using a server-side solution can be quite awkward in these scenarios.   

The bottom line is that the need for centralizing management of references is likely to increase significantly. 

That's where \<xtal-sip\> fits in.

Whether using HTML Imports, or simple JavaScript references, or ES6 Modules, there's a pretty good principle that we can assume regarding web components:  *Each web component will depend on only one top-level reference*.  (One small exception to that rule, at least in spirit, appears to be with components that depend on icon libraries, like paper-icon-button).  Of course, that reference file itself will likely specify multiple other references recursively, following standardized module conventions, which is all fine and good.  \<xtal-sip\> is meant for content-heavy, non reusable web compositions, as opposed to highly reusable web components. 

xtal-sip assumes that web sites will want to take advantage of the recent web standard that allows  [content to be preloaded](https://developer.mozilla.org/en-US/docs/Web/HTML/Preloading_content).  

```html
<link rel="preload" href="..."> 
```

For performance reasons, it is useful to use these to preload all these references ahead of time.  Might as well build on this support to provide the mappings we need, and not repeat ourselves.

So what does xtal-sip add to the \<link rel="preload"\> functionality?

## Auto triggering based on tag name

```html
<link 
    rel="preload" 
    as="document" 
    href="//myCDN.com/@bower_components/paper-checkbox/paper-checkbox.html" 
    data-tag="paper-checkbox"
>
```

NB:  Currently, Chrome does not preload assets when as="document."  This seems like a bug to me, but what do I [know](https://bugs.chromium.org/p/chromium/issues/detail?id=593267)?  Attempting to work around this unexpected behavior by setting as="script" causes duplicate requests, which is probably worse. 

When \<xtal-sip\> encounters a \<paper-checkbox\> tag (how it encounters it will be discussed later), it will perform a hash lookup for link preload tags with attribute 'data-tag="paper-checkbox"', and it will formally load the reference.  

## Compact dependency preloading

It was mentioned above that listing all the elements with the same prefix can be boring and add to the footprint.

The markup below allows for more compact dependency.

```html
<link 
    rel-ish="preload"  
    as="document" 
    href="//myCDN.com/@bower_components/paper-{1}/paper-{1}.html" 
    data-tags="paper-checkbox,paper-input,paper-button"
>
```

This is a "fake" preload tag, that is used as the foundation for dynamically generating multiple valid preload tags.

For each tag name found in the data-tags attribute, that name is split using the dash "-" delimiter.  {1} refers to the split array, index = 1.

xtal-sip will "autoexpand" this, and dynamically create multiple genuine preload tags in the header where each file is listed explictly.

Here's an even more aggressive example, that uses {0} and {1}:

```html
<link 
    rel-ish="preload" 
    as="document" 
    href="//myIoTServerRunningFromMyMicrowaveOven.com/npm/{0}-{1}/{0}-{1}.html" data-tags="paper-checkbox,paper-input,paper-button,iron-input">
>
```


## Preemptive loading

By default, xtal-sip doesn't actually add the live import tag to the header until it actually spots such a tag in the live markup.  This allows us to stay on the conservative side and only load what's really needed.

However, if preemptive loading is desired, add the data-preemptive attribute:

```html
<link 
    rel="preload" 
    as="document" 
    href="../bower_components/paper-checkbox/paper-checkbox.html" 
    data-tag="paper-checkbox" 
    data-preemptive
>
```

## Async loading

If the preload tag has attribute data-async, then live references will use async capabilities (async import, async script reference).

## Script references

```html
<link 
    rel="preload" 
    as="script" 
    type="module" 
    href="node_modules/platinimum-{1}/platinum-{1}.js" 
    platinum-sw
>
```

## ES5 alternative references

## Bundling

### List of features:

- [x] Auto triggering based on tag name.
- [x] Compact dependency loading.
- [x] Optional preemptive loading.
- [x] Support async loading
- [ ] For non async, specify whether to add a setTimeout before adding import tag (defaults to true)
- [ ] Support specific settings of how to import (async, etc)
- [x] Autogenerate .html references.
- [ ] Autogenerate .js script references.
- [ ] Autogenerate .mjs script references.
- [ ] Autogenerate ES6 module script references.
- [ ] Add some sort of TBD mechanism to help with builds / push strategies (suggestions welcome).
  


When \<xtal-sip/> is instantiated, it searches its neighbors (starting from the parent for any such nodes that need "watering".  If it finds some matching nodes, then for each one, it checks if the custom element tag name has already been registered.  If not, it will dynamically load the starting reference fo the custom element.

Note that \<xtal-sip> will *not* monitor for DOM Node changes.  The thinking is once the top level references are added, the (typically reusable) components will manage loading their own dependencies following standard import mechanisms.

NB:  

This component does not yet have a good story in terms of web component IDE support, nor build tooling.  Use with extreme caution.



## Install the Polymer-CLI

First, make sure you have the [Polymer CLI](https://www.npmjs.com/package/polymer-cli) installed. Then run `polymer serve` to serve your element locally.

## Viewing Your Element

```
$ polymer serve
```

## Running Tests

```
$ polymer test
```

Your application is already set up to be tested via [web-component-tester](https://github.com/Polymer/web-component-tester). Run `polymer test` to run your application's test suite locally.
