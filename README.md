[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/bahrus/xtal-sip)

# \<xtal-sip\>


NB:  This component suffers currently in terms of IDE and build support, especially compared to the Polymer supported [lazy-imports](https://github.com/Polymer/lazy-imports).

\<xtal-sip\> is a dependency free, 550B minified and gzipped custom element that dynamically "waters" other custom element tags with the necessary dependencies to sprout the tag from an inert seedling to a thing of beauty. 

<a href="https://www.webcomponents.org/element/bahrus/xtal-sip/demo/index.html">Demo</a>

## Long soapboxing diatribe. Skip to "Core Functionality" to see what \<xtal-sip\> actually does.

Importing the files needed for web components seems likely to become a lot more complicated.  Some references will come from bower_components, some from node_modules.  Some will be references to html files, others js files.  And the references are likely to be in a state of flux, as the [whims of elite developers](https://codeburst.io/the-javascript-modules-limbo-585eedbb182e) change.  Components will first migrate to node_modules (how will we explain to our grandkids that [web components are node modules](https://www.polymer-project.org/blog/2017-08-23-hands-on-30-preview.html)?).   As support for HTML Imports wanes, many  *.html files will be converted to *.js files, then to *.mjs files, then back to *.mhtml files, once the W3C Ents show some HTML love.  That will shortly be followed by converting them to *.wasm, followed by the universal binary format that includes HTML, JS, CSS, WASM: *.xap.

This component, \<xtal-sip\>, is intended to "centralize the pain."  Keep the top level mappings between custom element tags and where to load the references for them all in one place.

The \<xtal-sip\> element takes the philosophical stance that web components are more than just some mundane JavaScript libraries.  They enhance the DOM vocabulary.  They create a mapping between a tag and something that, yes, is a JavaScript class, but typically no code needs to interact directly with that class -- only the browser.

The simplest, naive way to centralize that mapping would be to front load all the references in the head tag of index.html (the opening page for the entire application):

```html
<head>
    <link rel="import" href="../bower_components/paper-checkbox/paper-checkbox.html">
    <script type="module" href="https://cdn.jsdelivr.net/npm/xtal-json-merge/build/ES6/json-merge.js"></script>
    <etc/>
    <etc/>
    <etc/>
</head>
```

The problem with this approach is 1)  Without adding the async or defer attribute to these tags, the whole page will be blocked until all these references are a)  downloaded and b)  loaded into memory.  That's a horrible experience for users.  And 2)  Even with those attributes, loading all that content into memory, well before it is needed, will only partially reduce the horribleness of the experience.

The goal of this web component is to allow us to fine tune this naive approach, while still allowing  easier maintenance of references, and reducing redundancy.  For example, this component (combined with some extended features mentioned below) allows the same index.html page to serve both IE11 and modern browsers fairly seamlessly.

The approach will be to build on the \<link rel="preload"\> tag (and prefetch tag, but watch for duplicate requests).

The alternative to maintaining all the top level references centrally, is to break down the entire application into client-side components, either custom elements, or some framework-based component abstraction like that provided by Vue, (P)React, Angular, etc, and making each component handle its own import logic.  While I don't question the desirability of tightly coupled ES6 (or HTML Import) modules, I think as one moves from highly reusable and structured "micro web components" to content heavy, semi-structured, highly dynamic "macro web compositions", the benefits of the decentralized module system begin to diminish, and the benefits of the solution proposed here become more apparent.

## Benefits of centrally managing dependencies

A rule of thumb of current front end development is "properties flow down, events flow up", and for complex applications that require deeply nested components, use a global state management system like Redux.  

Perhaps an equivalent rule of thumb would be "references to web components in your folder, or subfolder are fine.  But if your references are littered with repetitive references to absolute paths, something like: 


```Javascript
import 'http://silkroadonlinepharmacy.com/product/ecstasy-mdma-100mg-pills/my-first-web-component.js';
import('http://silkroadonlinepharmacy.com/product/lsd-lysergic-acid-diethylamide-150mcg-tablets/onngh-yanngh/onngh-yanngh.esm').then((module) =>{
    console.log('No need for this block of code, just saying hi')
})
```

or

```HTML
<script 
    type="module"
    src="//myIoTServerRunningFromMyMicrowaveOven.com/npm/poparazzi-gourmet-popcorn-monitor/poparazzi-gourmet-popcorn-monitor.js">
</script>
<script 
    type="module" 
    src="//myIoTServerRunningFromMyMicrowaveOven.com/github/fire-extinguisher/fire-extinguisher.axd">
</script>
```

perhaps it is time to think about centrally managing those dependencies?

The most common use case for absolute paths like this would be referencing web components from a CDN.

### Why would we want our web components to be hosted by a CDN?

Potentially, widely used web components shared by multiple sites would benefit from the use of the same CDN.  If a user visits one site which uses a Cialis informational web component, other sites could share the same web component from the same CDN, and the consumer could be reminded of his predicament more speedily.

What about when you are developing and publishing web components to npm or bower or gitpubhub?  What if you want the demo folder of the web component to showcase how it can integrate with lots of other web components?  We don't want to mark those components as dependencies, because the web component really doesn't depend on them.  We just want to dynamically reference the other web components for demo purposes.  A CDN fits the bill nicely.  A service worker could be used to "install" these example-based references so the developer can work offline in a bomb shelter.

True, dynamic imports would allow the url's to be built off of some common constants. The problems with that solution are many:

1) It would defeat the purpose of this web component.
2) Kind of boring, don't you think?  You bore me.
3) It's unclear if IDE or build support will be able to work with common constant references (I'm sure with enough grunt work it could (or has already?))
4) It wouldn't start quietly preloading the files ahead of time, unless you utilize ES9's magic preloading constants (Stage 2).

However, there is a way to address point 4 above, seriously.

If you define a tag with an id, it may perhaps be a [surprise](https://dev.to/buntine/dom-elements-with-ids-are-global-variables) to know that DOM ID's become [global variables](http://2ality.com/2012/08/ids-are-global.html).

This would allow us to define a preload tag in the header of the document:

```html
<head>
    <link
     id="tadafil_info"
     as="script"
     rel="preload" 
     href="https://unpkg.com/cialrx/tadafil-info.js">
</head>
```

and then activate the web component thusly:

```JavaScript
import(tadafil_info.href);
```

If this is used for top level web component references, within a non reusable web application, where the developer maintains their own index.html, we can have confidence that the link will be present in the header. This solution, then, would seem sufficient.  It does require "require.js" or some other library that helps polyfill dynamic imports after transpiling to downlevel browsers.  \<xtal-sip\> allows you to circumvent require.js, which is ~7kb gzip, minified.

But what if you want to use this solution for your own reusable components, that you hope will get widespread use?

If you want to extend this solution, then you can hedge your bets by falling back to your local node_modules folder if no preload instructions exist in index.html:

```JavaScript
import(self.tadafil_info ? tadafil_info.href : '../../node_modules/cialrx/tadafil-info.js');
```

In the second, more iffy scenario described above (assuming the presence of a preload link in the document.head even for highly reusable components), the solution would pay more dividends if large numbers of other apps / web components adopted the same naming convention for how they name the id of any link preloading tags.  Being that I'm just a pip squeak github soliloquist, with no ability to sway anyone else to adopt this convention, my hope is that the choice to simply replace dashes with underscores as the convention will match what others adopt, based on similar considerations.  This appears to me to be the simplest solution that satisfies these criteria:

1)  You can reference the DOM element without typing self["..."]
2)  It is easy to switch between the id and the name of the web component:  

```JavaScript
    console.log('my_first_web_component'.split('_').join('-'));
    // my-first-web-component
```

If some other convention arises with wider adoption, xtal-sip will of course switch to it.


### Other Uses for xtal-sip

Consider the case of rendering a forest of  HTML "leaf nodes" including web components, inside a code-centric framework, like (P)react.  Not having a good solution to this scenario, with HTML Imports, may partly explain why so many are "throwing in the towel," pushing web components that might be 99% static markup, 1% JavaScript, to be packaged / coded entirely in JavaScript. (Of course the dithering of the web component working group hasn't helped).  Sad! 

### More kvetching

The annoying thing about HTMLImports (and ES6 Modules for that matter) is that creating references for each referenced web component inside an HTML or JS file feels like tedius busy work -- for HTML files, one must go towards the top of the page (outside any templates) to add the reference, and typically the reference is just a trite formulaic derivative of that globally unique tag name itself.  E.g. \<paper-input\> => \<link rel="import" href="../../../bower_components/paper-input/paper-input.html"\>, \<paper-checkbox\> => \<link rel="import" href="../../../bower_components/paper-checkbox/paper-checkbox.html"\>.   And all these references add to the footprint of the application.

### Severe Server Burn

What if the markup is generated by a server-side framework like asp.mvc or [Java EE MVC](https://youtu.be/xn_aKV36j30?t=1168), or php (or, yes, node, which currently falls in the "other" category of [popular web frameworks](https://trends.builtwith.com/framework))?  And suppose that server-side rendering is using web components to supplement the server-side generated HTML?  Although we are not supposed to use the PWA Hacker News site to ["compare the performance of one PWA to another"](https://hnpwa.com/), one can't help noticing that the fastest performing implementation is the one that uses [no JavaScript, other than the service worker](https://github.com/davideast/hnpwa-firebase). Clearly, this is an architecture we can't dismiss. 

Wouldn't this be loverly to inspect?

```html
    <script>
        import('../../../node_modules/@polymer/lib/dom-repeat/dom-repeat.js')
    </script>
    <template is="dom-repeat" items="[[myTweets]]">
        <script>
            import('../../../node_modules/@polymer/lib/dom-if/dom-if.js')
        </script>
        <template is="dom-if" if="[[item.wasDeletedAfterBeingChastisedByJKRowlingForMansplaining]]">
            <script>
                import('../../../node_modules/@polymer/lib/dom-repeat/dom-repeat.js')
            </script>
            <template is="dom-repeat" range="1..50">
                <script>
                    import('https://SpringfieldServer.com/npm@OpeningSequences/BartUtils/chalk-board-line/chalk-board-line.js')
                </script>               
                <chalk-board-line>
                    I will not start a tweet with the word "actually."
                </chalk-board-line>
            </template>
        </template>
    </template>
```

I'm sure more sophisticated approaches could be found, but this is the most direct one I can think of.

### Pathological Vertiginousness

Suppose you need to reference a path that look like this over and over again:

```JavaScript
import '../../../../../node_modules/my-vague-suite-of-components/foo/bar/baz/qux/quux/corge/grault/garply/waldo/fred/plugh/xyzzy-thud.js'
``` 

Enough said.

No wait, there's more!

The bottom line is that the need for centralizing management of top level references is likely to increase significantly. 

Why not take advantage of the great, simplifying fact that no two web components can have the same name (at least on the same page)?  *That* should be the primary identifier for repeated import statements, not the particular location it came from.

That's where \<xtal-sip\> fits in.

Whether using HTML Imports, or classic JavaScript references, or ES6 Modules, there's a pretty good principle that we can assume regarding web components:  *Each web component will depend on only one top-level reference*.  (One small exception to that rule, at least in spirit, appears to be with components that depend on icon libraries, like paper-icon-button).  Of course, that reference file itself will likely specify multiple other references recursively, following standardized module conventions, which is all fine and good. As I indicated earlier, \<xtal-sip\> is meant for content-heavy, macro, largely non reusable web compositions, as opposed to highly reusable micro web components. 

As mentioned earlier, xtal-sip assumes that web sites will want to take advantage of the recent web standard that allows  [content to be preloaded](https://developer.mozilla.org/en-US/docs/Web/HTML/Preloading_content):  

```html
<link rel="preload" href="..."> 
```

For performance reasons, it is beneficial to use these to pre-download all these references ahead of time, without processing them until needed.  Might as well build on this promising performance booster, support to provide the mappings we need, and not repeat ourselves.

### What about prefetch?

An older alternative to \<link rel="preload"\> is \<link rel="prefetch"\>.  Prefetch would appear to be for use cases where the resources won't be needed until the user chooses to navigate to a different view, so the downloading is done with a lower priority, which sounds good in theory.  However, it appears that this tag suffers from some ambiguity -- if everything has higher priority, should it ever really be downloaded?

In contrast to that concern, I see a different issue. From my experiments, in both Chrome and Firefox, if the script is activated by programmatically adding a real script tag to the header, it results in duplicate downloads of the same script file.  Why?  Just... why?

Anyway, the xtal-sip code treats rel="prefetch" the same as "preload," so web components will load if you use prefetch, while apparently incurring a toll on the network.  Use at your own risk.

If you do stick with the shiny new \<link rel="preload"\>, even for secondary views, Chrome, at least, will issue some warnings in the console ("Hey, you said you would use this really soon, what gives?"), which can be safely ignored.

So what does xtal-sip add to the \<link rel="preload"\> functionality?

# Core functionality

## Location look up based on tag name

Place your link preload tags inside the head tag of your index.html (or equivalent), with the id indicating which tag uses this reference (replace dashes(-) with underscores (_) ):

```html
<link
    id="paper_checkbox"
    rel="preload" 
    as="document" 
    href="//myCDN.com/@bower_components/polymer/paper-checkbox/paper-checkbox.html" 
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

Ideally, [binding frameworks](https://custom-elements-everywhere.com/) such as Vue, Angular and (P)react would be able to distinguish between attributes and properties, and bind properly with custom elements even before they have loaded all their dependencies.  Alas, (p)react is [not](https://github.com/developit/preact/issues/678) such a [framework](https://github.com/facebook/react/issues/11347). In the case of preact, the simple solution is to wait for the custom elements to load before employing binding.

To help in this effort, xtal-sip events a custom event when it has finished loading:  'loaded-changed'.  \

This would allow Preact users to activate a component after all the web components have loaded:

```JSX
    <MyPreactChildComponent onLoaded-changed={this.activateMe} />
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

## HTML based custom element importers

[The carbon copy element](https://www.webcomponents.org/element/bahrus/carbon-copy), c-c for short, provides a 1.9 kb alternative to HTML Imports, that can also be used to define HTML-based custom elements.  Unlike HTML Imports, it also supports direct client-side include functionality, including dynamic url references, similar to Polymer's iron-pages.

[xtal-pattern](https://www.webcomponents.org/element/bahrus/xtal-pattern)  is a lighter-weight (~920B) alternative  to c-c, specializing in providing an HTML-based web component definition without HTML Imports. 

What these two "web component creator" components have in common is that they use "href" to specify the location of the file containing the web component.

Xtal-sip also provides support for lazily loading custom elements defined and imported via such importing custom elements. Note the "data-importer" attribute, and the value of the "as" attribute.  It can be "c-c" or "xtal-pattern" or any other name of a web component that takes href as its resource locator.

You will need to also create the reference to the importer web component itself, either via xtal-sip, or via more traditional ways. 

```html
<link id="my_component"
    rel="preload" 
    as="fetch" 
    type="text/html" 
    data-importer="xtal-pattern" 
    href="include.html#myTemplate">
    ...
```

The correct attritube for "as," as shown above, ought to be, in my opinion, "fetch." But
**here again we see yet another bug in Chrome, which Firefox doesn't share**.  Even though the two importing  elements mentioned above fetch include.html via the fetch api, Chrome ends up downloading the file twice.  Firefox does this correctly.

Until Chrome fixes this bug, you can use as="document", which is buggy in the opposite direction, and which won't be quite as performant, but at least the person's bandwidth won't be wasted.

# Extended Functionality

Xtal-sip also supports two files for additional functionality, that might be useful for larger projects, or projects that must target a wider variety of browser types, with more distributed dependencies.

One of those files, where the exciting stuff happens, is the 600B gzipped and minified file xtal-sip-plus.js. As will become clear, much (but not quite all) of this additional functionality could instead be done by a server-side filter, or during the build, in the interest of eliminating that 600B overhead.  Writing such a filter or build step would be fairly straightforward due to xtal-sip-plus all being based on declarative HTML tags.  In some cases, though, the benefits of performing the processing during the build or on the server could be outweighed by the cost of a larger download size.

To reference xtal-sip-plus, replace the script tag reference mentioned above with this one in document.head:

```html
<script id="xtal_sip" src="path/to/xtal-sip-loader.js"></script>
```

xtal-sip-loader first loads the core file, xtal-sip, described above, which can immediately take action on the preload/prefetch tags.  Then xtal-sip-plus is loaded, whose functionaltiy is described below:

## Compact dependency preloading

It was mentioned many paragraphs ago that listing all the elements with the same prefix can be boring and add to the footprint.

The markup below allows for more compact dependency mappings.

```html
<link 
    rel-ish="preload"  
    as="document" 
    href="//myCDN.com/@bower_components/polymer/paper-{1}/paper-{1}.html" 
    data-tags="paper-checkbox,paper-input,paper-button"
>
```

This is a "fake" preload tag, that is used as the foundation for dynamically generating multiple valid preload tags.

For each tag name found in the data-tags attribute, that name is split using the dash "-" delimiter.  {1} refers to the split array, index = 1.

xtal-sip-plus "autoexpands" this, by cloning the tag, and dynamically creating multiple genuine preload tags in the header where each file is listed explictly. The autogenerated preload tags have ids corresponding to the custom element tag name (replacing dashes with underscores). 

One could always use these fake "rel-ish" preload tags, even for single mappings, to be consistent.  But using the non standard preload tag causes a delay, because the xtal-sip web component, and the xtal-sip-plus extension need to load first before generating the real preload tags, meaning the preloading download will start a little later.

If this is a concern, the expansion could be done by a service worker instead of by xtal-sip-plus, with no sacrifice to the bandwidth footprint (and likely gaining back the performance degration discussed in the previous paragraph).

Here's an even more aggressive example, that uses {0} and {1}:

```html
<link 
    rel-ish="preload" 
    as="document" 
    href="//myIoTServerRunningFromMyMicrowaveOven.com/npm/@polymer/{0}-{1}/{0}-{1}.html" 
    data-tags="paper-checkbox,paper-input,paper-button,iron-input">
>
```

### Common base href

It's likely that numerous link tags will want to share the same base url. 

Here we build on another link rel value -- [preconnect](https://css-tricks.com/prefetching-preloading-prebrowsing/#article-header-id-1). 


```html

<link id="baseCdnUrl" 
    rel="preconnect" 
    href="https://cdn.jsdelivr.net/npm/">
<link id="json_merge" rel-ish="preload" async as="script" data-base="baseCdnUrl"
    href="xtal-json-merge/build/ES6/json-merge.js">

<link id="xtal_json_editor" rel-ish="preload" async as="script" data-base="baseCdnUrl"
    href="xtal-json-editor/build/ES6/xtal-json-editor.js">    
```

## Preemptive loading [TODO]

By default, xtal-sip doesn't add the live script or link import tag to the header until it is explicitly told to do so. Until then, we are preparing for the moment it is, by adding such references to the link rel="preload".  This allows us to stay on the conservative side and only load into memory what's really needed.

However, if preemptive loading is desired, add the data-preemptive attribute:

```html
<link 
    rel-ish="preload" 
    id="paper_checkbox"
    as="document" 
    href="../bower_components/paper-checkbox/paper-checkbox.html" 
    data-preemptive
>
```

This preemptive loading could also be (temporarily?) useful to use for the common (for now?) scenario that 1)  The component follows the Polymer <3 approach of importing via HTML Imports, and 2)  Chrome (and possibly other browsers using polyfills) doesn't recognize as="document" or the polyfill for HTML Imports isn't recognized by the browser as type "document".

## JIT preloading [TODO]

On the other side of the spectrum, perhaps there are certain locales one is targeting, where we know they pay a high price for downloading unnecessary stuff.

The only benefit we want from \<xtal-sip\>, in this case, is to perform concise lookups between tag names and the dependency.  So in this scenario, you must use the "fake" preload tag to avoid premature downloading:

```html
<link 
    rel-ish="preload" ...>
```

Now add the following code in the original critical path (i.e. top of the header in index.html):

```html
<script>
    document.head.addEventListener('xtal-sip-init', e =>{
        // Look at the browser's geolocation, ip address, do a look up to their mobile data provider,
        // then evaluate the pricing mechanism in place depending on the time of day.
        // Utilize the recently standardized mobileAccountInfo api, to check if they 
        // are getting close to hitting their monthly data limit
        const isPayingThroughTheNose = ... ;
        //Now let XtalSip know the answer
        e.detail.useJITLoading = isPayingThroughTheNose;
    })
</script>
```

This will circumvent the generation of individual real rel="preload" tags.  Instead, it will create multiple rel-ish tags with individual id attributes, allowing for fast lookup between tagname and the url.

## Bundling

Some CDN's, [like jsdelivr](https://www.jsdelivr.com/features) allow you to combine multiple assets together with one http request.

> https://cdn.jsdelivr.net/combine/gh/jquery/jquery@3.2/dist/jquery.min.js,gh/twbs/bootstrap@3.3/dist/js/bootstrap.min.js

[Support](https://www.nginx.com/resources/wiki/modules/concat/) [is](https://code.google.com/archive/p/modconcat/) also available on some web servers.

One can also utilize build processes that generate bundled resources that contain definitions for multiple custom element tag names.

While xtal-sip doesn't do anything to help create these bundled resources, or build the url's needed for concatenated resource requests, it does check if it has already requested a url before for other tag names, and if so, doesn't reload that url.

## ES5 / HTTP/1 alternative references

One of the more complex pieces to consider is the issue of browsers that don't support ES6 classes, a cornerstone of web components.  And also, browsers / servers (or proxies) that don't support HTTP/2.  These should all be temporary problems, but unfortunately "temporary" could be several years.

I'm sure anyone reading this has thought about the "Give me a one-handed economist" conundrum of how best to package and serve all users optimally.  On the one hand, the simplest thing to do is assume that the browsers that support ES6 will also suppport HTTP/2, and just build a giant bundle for ES5, and treat those users separately.  On the other hand, even HTTP/1 users would benefit from some code splitting / progressive enhancement caching.  On the third hand, even HTTP/2 benefits from some bundling, depending perhaps on the server, etc.

The following features assist in our goal of supporting all browser types without having separate build folders for the entire application.

### Bootstrapping: Referencing xtal-sip

In the build folder of xtal-sip is an ES6 and an ES5 version.

To decide which to use, I recommend loading the xtal-sip-loader.js file in the root folder.  This will load the correct version of xtal-sip.  It will also add the boilerplate webpack snippet of code Polymer inserts during the build for ES5 builds.

To reference xtal-sip-loader.js, use a script tag as follows:

```html
<script id="xtal_sip" src="https://cdn.jsdelivr.net/npm/xtal-sip/xtal-sip-loader.js"></script>
```

Note the id attribute.  This helps overcome a limitation IE11 has with the document.currentScript object.  document.currentScript is well supported in modern browsers.  But in IE11, its support is kind of there, but it doesn't work reliably.  This is a recipe for disaster.  Thus xtal-sip-loader searches for the matching id, to determine for certain where the reference for the xtal-sip-loader came from. This allows xtal-sip-loader to dynamically load the appropriate xtal-sip.js (and ES5Compat.js) with confidence regarding the location.

### Tie breaking

The goal of xtal-sip is to be flexible enough that developers can find a way to apply the best strategy for their use case.  Hopefully, the need for this kind of trade-off guesswork will diminish over time.  But xtal-sip provides no ready-made solutions for this dilemma. 

Instead, what it provides is this:  Define multiple fake "rel-ish" preload link tags, that match the same custom element name.  The developer can define a static "tie breaker" function used by all instances of the xtal-sip element, that may take into account numerous factors in their environment to determine which one to use from the matching set.

```html
<script>
    document.head.addEventListener('xtal-sip-init', e =>{
      e.detail.tieBreaker = (tagName, candidates) =>{
         //put your complex trade-off logic here, that picks from the candidates array.
         //This can also be used to discover accidental duplicate references.
         var thisIsTheBestCandidate = candidates[1]; //just as an example
         return thisIsTheBestCandidate;
      }
    })

</script>

```

The argument "candidates" in the above  is an array of different link "rel-ish" preload tags.  The developer could add their own custom attributes to these link tags, which, combined with the browser type in play and other factors, could choose which of the overlapping references to use.

### Suggestion on how to resolve the location of a script based web component

If 1) you are creating a custom element wrapper around a third-party api, which has dependencies (like d3.js or css files), and 2)  you want to avoid adding a require.js dependency, and 3) you are trying to avoid the (deprecated?) HTMLImport, you might be faced with the dilemma of how to find the location of the dependencies.

As mentioned above, document.currentScript is extremely buggy in IE11.  I suggest using the following approach to find the location of the script associated with the custom element tag name you are working with:

```JavaScript
    const jsFilePath = self.my_tag_name ? my_tag_name.href : document.currentScript.src;
```


### Substitution

Using the tie breaking approach described above to differentiate between ES5 and ES6 references can get redundant, particularly if there's symmetry between how bundling is done for ES5 vs ES6.  For example, suppose we do no bundling.  We would be apt to end up with lots of "double references":

```html
  <link rel-ish="preload" async as="script" data-es="6" data-base="cdnBaseUrl"
    href="xtal-json-editor/build/ES6/xtal-json-editor.js" data-tags="xtal-json-editor">

    <link rel-ish="preload" async as="script" data-es="5" data-base="cdnBaseUrl"
    href="xtal-json-editor/build/ES5/xtal-json-editor.js" data-tags="xtal-json-editor">
```

That's a nuisance to maintain, and won't help reducing the bandwidth of the application.

One can provide xtal-sip a preprocessing function that will subsitute (say) ES6 with ES5:

```html
<script>
    document.head.addEventListener('xtal-sip-init', e =>{
      e.detail.tieBreaker = ...;
      e.detail.substitutor = (relishLink =>{
          switch(navigator.userAgent){
              case 'Lynx/2.8.7rel.2 libwww-FM/2.14 SSL-MM/1.4.1 OpenSSL/1.0.0a':
                relishLink.href = relishLink.href.replace('MyWebGLPanorama.js','console.asciiArt.dots.js');
                break;
              case 'Mozilla/5.0 (compatible; bingbot/2.0 +http://www.bing.com/bingbot.htm)':
                relishLink.href = relishLink.href.replace('/ES6/BoringBundleOfBlah.js', '/ES3/ClickBait.js');
                break;
          }
      });
    })

</script>

```

## List of features:

- [x] Auto triggering based on tag name.
- [x] Compact dependency loading.
- [ ] Optional preemptive loading.
- [x] Common base href's
- [x] Tie breaking
- [x] Substitution
- [ ] Just-in-time loading static property
- [x] Autogenerate .html references.
- [x] Autogenerate .js classic script references.
- [x] Autogenerate c-c references.
- [x] Configure static class properties of custom elements from link data- attributes.
- [ ] Autogenerate ES6 module script references.
- [ ] Add some sort of TBD mechanism to help with builds / push strategies (suggestions welcome).
  


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
