# \<xtal-sip\>

Dynamically &#34;water&#34; a custom element tag with the necessary dependencies to sprout the tag from an inert seedling to a thing of beauty.

This custom element was introduced prior to learning about the [bare import specifier / package name maps proposal](https://github.com/domenic/package-name-maps).  Assuming that proposal is ratified by all the browser vendors, the usefulness of this component will signifanctly diminish, as that proposal allows for central management of references, something this component also supports.  The usefulness will also diminish once dynamic imports are shipping in all browsers, other than those with insignificant marketshare.

But that day is not here.  In the meantime, \<xtal-sip\>takes the philosophical stance that web components are more than just some mundane JavaScript libraries.  They enhance the DOM vocabulary.  They create a mapping between a tag and something that, yes, today must be a JavaScript class, but typically no code needs to interact directly with that class -- only the browser. The way this component loads web component definitions uses syntax that is not tied to JavaScript. The usefulness of this web component, then, would increase if browsers supported any way other than JS imports / classes as a way of importing a web component definition.  E.g. defining a custom element with WASM, or as part of an HTML import document.  xtal-sip assumes that whatever the file type used to generate a custom element, browsers will ship with a link preload/prefetch/other tag/attribute that allows retrieving the web component definition ahead of time.

One of the drivers behind this component is the desire to avoid repeating ourselves.  It seems even with the bare import specifier proposal, some degree of repeating will still be needed.  There is a clear pattern with web components, that the prefix of the name tends to come from the same vendor.  Predicting the path to the JavaScript based only the name of the custom element, therefore, becomes almost formulaic.  This provides opportunites to look for ways of eliminating redundancies and download footprint (at the risk of increasing client-side processing).

\<xtal-sip\> also caters to developers who dream of day when it is at least *possible* to develop applications with no build step.  Saving the file should allow the browser to refresh with a minimum of fuss.

To accomplish this, we will dust off an old, but never fully appreciated technology -- xslt.  The idea between xslt is not that dissimilar to functional renderers like react.  The same transform can be performed on the server or on the client.



## Install the Polymer-CLI

First, make sure you have the [Polymer CLI](https://www.npmjs.com/package/polymer-cli) and npm (packaged with [Node.js](https://nodejs.org)) installed. Run `npm install` to install your element's dependencies, then run `polymer serve` to serve your element locally.

## Viewing Your Element

```
$ polymer serve
```

## Running Tests

```
$ polymer test
```

Your application is already set up to be tested via [web-component-tester](https://github.com/Polymer/web-component-tester). Run `polymer test` to run your application's test suite locally.
