# \<xtal-sip\>

Dynamically &#34;water&#34; a custom element tag with the necessary dependencies to sprout the tag from an inert seedling to a thing of beauty.

To skip this long-winded prelude, and see what xtal-sip does, jump to the [core functionality section](#core-functionality).

## Reasons for not using this web component

If you are perfectly content just bundling all your web component resources into bundle.js, this component is not for you.  If you think performing some view-based bundle splitting is sufficient / appealing, this component is also not for you.  This component is for developers who want to hydrate web components asynchronously, in parallel, and limit bundling to tightly coupled resources (though this component is certainly compatible with more aggressive bundling).

This custom element was conceived prior to learning about the [bare import specifier / package name maps proposal](https://github.com/domenic/package-name-maps).  Assuming that proposal is ratified by all the browser vendors, the usefulness of this component will significanctly diminish, as that proposal allows for central management of JS references, something this component also supports (at least for top level references).  The usefulness will also diminish once dynamic imports are shipping in all browsers, other than those with insignificant marketshare.

But that day is not here.  And as we will see, this component still does arguably make managing large numbers of web components easier, even when that day arrives.

## xtal-sip's mission 

\<xtal-sip\> takes the philosophical stance that web components are more than just some mundane JavaScript libraries.  They enhance the DOM vocabulary.  They create a mapping between a tag and something that, yes, today must be a JavaScript class, but typically no code needs to interact directly with that class -- only the browser. The way this component loads web component definitions uses syntax that is not tied to JavaScript. The usefulness of this web component, then, would increase if browsers supported any way other than JS imports / classes as a way of importing a web component definition.  E.g. defining a custom element with WASM, or as part of an HTML imported document.  xtal-sip assumes that whatever the file type used to generate a custom element, browsers will (eventually) ship with a link preload/prefetch/other tag/attribute that allows retrieving the web component definition ahead of time.

\<xtal-sip\> is also betting long on the usefulness of asynchronously hydrating web components, with bundling limited to tightly coupled resources.  xtal-sip's spirits wilted a bit when confronted with this [wailing tweet](https://twitter.com/paul_irish/status/979867890080915456?lang=en):

>Some of the brightest performance minds I know have tried to make loading unbundled ES modules fast. They have not yet succeeded. 
Perhaps in two years, it'll be competitive—but until then keep on bundling y'all.

Out sprang the dental hygienist from Abu Ghraib, triumphantly telling us we must brush ten times a day with sandpaper and bundle and split.

But xtal-sip sees the benefits of loading content progressively, and the benefits of sharing common components via a shared CDN.

\<xtal-sip\> also caters to developers who dream of the day when it is at least *possible* to develop applications with no build step, and no specialized web server.  Saving a file should allow the browser to refresh with a minimum of fuss and no complex abstraction layers.  Being able to use the browser's editor's capabilities would also be a benefit of keeping things as simple as possible during development.

Another driver behind this component is the desire to avoid repeating ourselves.  It seems even with the bare import specifier proposal, some degree of repeating will still be needed, if we want to not only specify import specifiers but also preload/prefetch/preconnect tags. 

There is a clear pattern with web components, that the prefix of the name tends to come from the same vendor / author.  Predicting the path to the JavaScript based only the name of the custom element, therefore, becomes almost formulaic.  This provides opportunites to look for additional ways of eliminating redundancies and reducing the size of the download (at the risk of increasing client-side processing).

This package contains a core web component, xtal-sip, that simply loads link preload / prefetch / * tags on demand.  

But it also has a supplementary file, xtal-sip-plus, that programatically (via JavaScript) auto generates multiple link preload tags based on wildcard rules, and that can also cater those link refererences based on the device type (ES6 supporting browser vs IE11, for example.)  

## Reasons not to use xtal-sip-plus

But is this really the best approach, especially outside of development?  Dynamically generating the list of preload tags with client-side JavaScript will of course delay the browser's ability to begin downloading the resources right away.  

That auto generation of preload tags could instead be done by the server, or during the build, but that would hurt the bandwidth savings achieved by pgorammatically generating references from a compact representation of the references.  In the abstract, maybe a service worker could do the trick, but the problem is the service worker can only be invoked *after* index.html (say) has loaded. 

After contemplating this dilemma, I remembered about an old, but never fully appreciated technology -- xslt.  The idea behind xslt is not that dissimilar to functional renderers like react or litHTML (the only difference being that xslt is xml based, react is JavaScript based).  The same transform can be performed on the server or on the client.  Yes, concepts of isomorphism were around back in 2000!

So let's use the **whole** platform, not just the fashionable recent bits.

If we define index.xml as follows:

```xml
<?xml version="1.0"?>
<?xml-stylesheet type="text/xsl" href="input.xsl"?>
<refs>   
    <wc_patterns>
        <pattern prefix="paper-" context="@polymer" as="script" ext="js" root="https://unpkg.com/" version="3.0.0-pre.19">
            <input />
            <button/>
        </pattern>
    </wc_patterns>
</refs>
```

and index.xsl as follows:

```xml
<?xml version="1.0"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
<xsl:output method="html" encoding="utf-8" indent="yes" />
<xsl:include href="include.xsl"/>
  <xsl:template match="/refs">
    <xsl:text disable-output-escaping='yes'>&lt;!DOCTYPE html&gt;</xsl:text>
    <html>
      <head>
        <title>xtal-sip demo</title>
        <xsl:apply-templates select="*"/>
      </head>
      <body>
        <h1>
          Hello
        </h1>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
```

Note the file include.xsl.  This can be a shared file (across multiple applications, but you can't use an externally hosted CDN for this), full of esoteric (to millennials) xslt.  The file is shown below:

```xml
<?xml version="1.0"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
  <xsl:template match="wc_patterns">
   <xsl:for-each select="pattern">
      <xsl:variable name="prefix" select="@prefix"/>
      <xsl:variable name="context" select="@context"/>
      <xsl:variable name="ext" select="@ext"/>
      <xsl:variable name="root" select="@root"/>
      <xsl:variable name="version" select="@version"/>
      <xsl:if test="system-property('xsl:vendor') = 'Microsoft'">
        <script src="../node_modules/@webcomponents/webcomponentsjs/webcomponents-bundle.js"></script>
      </xsl:if>
      <xsl:for-each select="*">
        <link rel="preload" as="script">
          <xsl:attribute name="href">
            <xsl:value-of select="$root"/><xsl:value-of select="$context"/>/<xsl:value-of select="$prefix"/><xsl:value-of select="name(.)"/>@<xsl:value-of select="$version"/>/<xsl:value-of select="$prefix"/><xsl:value-of select="name(.)"/>.<xsl:value-of select="$ext"/>
          </xsl:attribute>
        </link>
      </xsl:for-each>
    </xsl:for-each>
  </xsl:template>
  </xsl:stylesheet>
```

This will generate link tags in the head tag:

```html
<link rel="preload" as="script" href="https://unpkg.com/@polymer/paper-input@3.0.0-pre.19/paper-input.js">
<link rel="preload" as="script" href="https://unpkg.com/@polymer/paper-button@3.0.0-pre.19/paper-button.js">
```

Note that now we can synchronously load the web component polyfills with zero impact on browsers which support web components.

The same xml tags could also be used to define part of the bare import specifier configuration, as well as link preconnect tags.

We may want the xml file defining the blueprint of where all the references should come from, to depend on the browser type.  For this, one must rely on the servers capabilities.  For example nginx supports a module that can cause ["ancient browsers" to come from a different from than modern browsers](http://nginx.org/en/docs/http/ngx_http_browser_module.html).

# Core functionality

## Location look up based on tag name

Place your link preload tags inside the head tag of your index.html (or equivalent), with the id indicating which tag uses this reference (replace dashes(-) with underscores (_) ):

```html
<link
    id="paper_checkbox"
    rel="preload" 
    as="script" 
    href="https://unpkg.com/@polymer/paper-checkbox@3.0.0-pre.19/paper-checkbox.js" 
>
```

When \<xtal-sip\> is told to load the \<paper-checkbox\> tag, it looks for the global constant paper_checkbox, and reads the href property.  It then formally loads the reference into memory and executes the code. It does this by programmatically generating a script tag or HTML import tag (depending on the value of "as", and adding the tag to the header. 

NB:  Currently, Chrome does not preload assets when as="document" as shown in the example above.  This seems like another bug to me, but [what do I know](https://bugs.chromium.org/p/chromium/issues/detail?id=593267)?  Attempting to work around this unexpected behavior by setting as="script" causes duplicate requests, which is probably worse. The story is much better for actual script referencing, using as="script" (of course!).

## Declaring custom elements that need watering

Simply add the \<xtal-sip\> tag in the markup, specifying the tag names that need watering:

```html
<xtal-sip load="paper-input,iron-ajax"></xtal-sip>
```

Generally you will not want to list all tags in a single \<xtal-sip\> tag.  Rather, the intention is that as views are loaded, you explicitly list the tags needed for that view.

### Programmatic import

If the sight of \<xtal-sip\>'s is unpleasant to see in the markup, or is an inconvenient way to resolve dependencies, an alternative way of explicitly declaring which tags should become active is to call the static method:

```JavaScript
customElements.get('xtal-sip').load('paper-input,iron-ajax');
```

### Notification when loading is complete

Ideally, [binding frameworks](https://custom-elements-everywhere.com/) such as Vue, Angular and (P)react would be able to distinguish between attributes and properties, and bind properly with custom elements even before they have loaded all their dependencies.  Alas, (p)react is [not](https://github.com/developit/preact/issues/678) such a [framework](https://github.com/facebook/react/issues/11347) (yet). In the case of preact, the simple solution is to wait for the custom elements to load before employing binding.

To help in this effort, xtal-sip emits a custom event when it has finished loading:  'loaded-changed'.

This would allow Preact users to activate a component after all the web components have loaded:

```JSX
    <xtal-sip load="paper-input,iron-ajax" onLoaded-changed={this.activateMe} />
```

## Installing xtal-sip

If you wish to install xtal-sip locally, you can use:

>bower install --save bahrus/xtal-sip

or

> npm install xtal-sip

or

> yarn add xtal-sip

Or you can install it via the Google Play store

Or nuget

Or iTunes

Or as a vs code extension, transmitted via Alexa in Morse code encrypted via enigma.

Or you can use a cdn that proxies npm or github.  For example:

https://cdn.jsdelivr.net/npm/xtal-sip/build/ES6/xtal-sip.js

Or

https://cdn.jsdelivr.net/gh/bahrus/xtal-sip/build/ES6/xtal-sip.js

Or 

https://unpkg.com/xtal-sip/build/ES6/xtal-sip.js



## Referencing xtal-sip

Simply add the following markup inside the head tag of the opening web page (like index.html or index.ejs):

```html
<script async src="path/To/xtal-sip.js"></script>
```

## Script references

Classic script references are handled much the same way as HTML Imports shown in the example above.  The biggest difference is now the "as" attribute should be set to "script":

```html
<link id="xtal_json_editor"
    rel="preload" 
    async as="script" 
    href="xtal-json-editor/build/ES6/xtal-json-editor.js" 
>
```



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
