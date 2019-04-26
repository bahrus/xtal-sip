# \<xtal-sip\>

Dynamically &#34;water&#34; a custom element tag with the necessary dependencies to sprout the tag from an inert seedling to a thing of beauty.

Most every web application can be recursivly broken down into logical regions, building blocks which are assembled together to form the whole site.

xtal-sip takes the philosophical stance that at the most micro level,utilizing highly reusable, generic custom elements -- that can extend the HTML vocubulary; candidates to be incorporated into the browser, even -- forms a great fundamental "unit" to build on.

But as one zooms out from the micro to the macro, the nature of the components changes in signicant ways.  

At the micro level, components will have few, if any, dependencies, and those dependencies will tend to be quite stable.  The dependencies will skew more towards tightly coupled utility libraries. 

ES6 Modules (and hopefully HTML and CSS Modules in the near future), combined with import maps to (optionally) centralize management of these dependencies without bundling, works great at the micro level.  But does it scale to the big picture?

xtal-sip argues that while it is certainly possible to build large applications with just modules and import maps, there are some pain points which will surface.

"Macro" level components will tend to be heavy on business-domain specific data, heavy on gluing / orchestrating smaller components, light on difficult, esoteric JavaScript.  Web components (especially ES Module based) may or may not be the best fit for these components.  They may be  [Rails](https://goiabada.blog/rails-components-faedd412ce19) just to take an example.  

A significant pain point has to do with  listing all the dependencies used by thees macro components.  The goals of xtal-sip are:

1.  
