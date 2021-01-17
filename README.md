<!-- ⚠️ This README has been generated from the file(s) "blueprint.md" ⚠️--><h1 align="center">router-slot</h1>

<p align="center">
		<a href="https://npmcharts.com/compare/router-slot?minimal=true"><img alt="Downloads per month" src="https://img.shields.io/npm/dm/router-slot.svg" height="20"/></a>
<a href="https://www.npmjs.com/package/router-slot"><img alt="NPM Version" src="https://img.shields.io/npm/v/router-slot.svg" height="20"/></a>
<a href="https://david-dm.org/andreasbm/router-slot"><img alt="Dependencies" src="https://img.shields.io/david/andreasbm/router-slot.svg" height="20"/></a>
<a href="https://github.com/andreasbm/router-slot/graphs/contributors"><img alt="Contributors" src="https://img.shields.io/github/contributors/andreasbm/router-slot.svg" height="20"/></a>
<a href="https://www.webcomponents.org/element/router-slot"><img alt="Published on webcomponents.org" src="https://img.shields.io/badge/webcomponents.org-published-blue.svg" height="20"/></a>
	</p>


<p align="center">
  <b>A powerful web component router</b></br>
  <sub>A router interprets the browser URL and navigates to a specific views based on the configuration. This router is optimized for routing between web components. If you want to play with it yourself, go to <a href='https://codepen.io/andreasbm/pen/XWWZpvM'>the playground</a>. Go here to see a demo <a href="https://appnest-demo.firebaseapp.com/router-slot">https://appnest-demo.firebaseapp.com/router-slot</a>.<sub>
</p>

<br />


* 😴  Lazy loading of routes
* 🎁  Web component friendly
* 📡  Easy to use API
* 🛣  Specify params in the path
* 👌  Zero dependencies
* 📚  Uses the [history API](https://developer.mozilla.org/en-US/docs/Web/API/History_API)
* 🎉  Supports routes for dialogs
* 🛡  Supports guards for routes
* ⚓️  Allows the anchor element for navigating
* ⚙️  Very customizable
* 🤐  2kb gzipped

<details>
<summary>📖 Table of Contents</summary>
<br />

[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/colored.png)](#table-of-contents)

## ➤ Table of Contents

* [➤ Installation](#-installation)
* [➤ Usage](#-usage)
	* [1. Add `<base href="/">`](#1-add-base-href)
	* [2. Import the router](#2-import-the-router)
	* [3. Add the `<router-slot>` element](#3-add-the-router-slot-element)
	* [4. Configure the router](#4-configure-the-router)
	* [5. Navigate using the history API, anchor tag or the `<router-link>` component](#5-navigate-using-the-history-api-anchor-tag-or-the-router-link-component)
		* [History API](#history-api)
		* [Anchor element](#anchor-element)
		* [`router-link`](#router-link)
	* [6. Putting it all together](#6-putting-it-all-together)
* [➤ `lit-element`](#-lit-element)
* [➤ Advanced](#-advanced)
	* [Guards](#guards)
	* [Dialog routes](#dialog-routes)
	* [Params](#params)
	* [Deep dive into the different route kinds](#deep-dive-into-the-different-route-kinds)
		* [Component routes](#component-routes)
		* [Redirection routes](#redirection-routes)
		* [Resolver routes](#resolver-routes)
	* [Stop the user from navigating away](#stop-the-user-from-navigating-away)
	* [Helper functions](#helper-functions)
	* [Global navigation events](#global-navigation-events)
		* [Scroll to the top](#scroll-to-the-top)
		* [Style the active link](#style-the-active-link)
* [➤ ⚠️ Be careful when navigating to the root!](#--be-careful-when-navigating-to-the-root)
* [➤ Contributors](#-contributors)
* [➤ License](#-license)
</details>


[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/colored.png)](#installation)

## ➤ Installation

```node
npm i router-slot
```


[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/colored.png)](#usage)

## ➤ Usage

This section will introduce how to use the router. If you hate reading and love coding you can go to the [playgroud](https://codepen.io/andreasbm/pen/XWWZpvM) to try it for yourself.

### 1. Add `<base href="/">`

To turn your app into a single-page-application you first need to add a [`<base>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/base) to the `index.html` in the `<head>`. If your file is located in the root of your server, the `href` value should be the following:

```html
<base href="/">
```

### 2. Import the router

To import the library you'll need to import the dependency in your application.

```javascript
import "router-slot";
```

### 3. Add the `<router-slot>` element

The `router-slot` component acts as a placeholder that marks the spot in the template where the router should display the components for that route part.

```html
<router-slot>
  <!-- Routed components will go here -->
</router-slot>
```

### 4. Configure the router

Routes are added to the router through the `add` function on a `router-slot` component. Specify the parts of the path you want it to match with or use the `**` wildcard to catch all paths. The router has no routes until you configure it. The example below creates three routes. The first route path matches urls starting with `login` and will lazy load the login component. Remember to export the login component as default in the `./pages/login` file like this `export default LoginComponent extends HTMLElement { ... }`. The second route matches all urls starting with `home` and will stamp the `HomeComponent` in the `router-slot`. The third route matches all paths that the two routes before didn't catch and redirects to home. This can also be useful for displaying "404 - Not Found" pages.

```javascript
const routerSlot = document.querySelector("router-slot");
await routerSlot.add([
  {
    path: "login",
    component: () => import("./path/to/login/component") // Lazy loaded
  },
  {
    path: "home",
    component: HomeComponent // Not lazy loaded
  },
  {
    path: "**",
    redirectTo: "home"
  }
]);
```

You may want to wrap the above in a `whenDefined` callback to ensure the `router-slot` exists before using its logic.

```javascript
customElements.whenDefined("router-slot").then(async () => {
  ...
});
```

### 5. Navigate using the history API, anchor tag or the `<router-link>` component

In order to change a route you can either use the [`history API`](https://developer.mozilla.org/en-US/docs/Web/API/History), use an anchor element or use the `router-link` component.

#### History API

To push a new state into the history and change the URL you can use the `.pushState(...)` function on the history object.

```javascript
history.pushState(null, "", "/login");
```

If you want to replace the current URL with another one you can use the `.replaceState(...)` function on the history object instead.

```javascript
history.replaceState(null, "", "/login");
```

You can also go back and forth between the states by using the `.back()` and `.forward()` functions.

```javascript
history.back();
history.forward();
```

Go [`here`](https://developer.mozilla.org/en-US/docs/Web/API/History) to read more about the history API.

#### Anchor element

Normally an [`anchor element`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a) reloads the page when clicked. This library however changes the default behavior of all anchor element to use the history API if the router supports the route.

```html
<a href="/home">Go to home!</a>
```

There are many advantages of using an anchor element, the main one being accessibility.

Alternatively, if you would still like to allow relative links to other parts of your site to navigate as normally, you can opt out of this behavior on a link-by-link basis:

```html
<a href="/about" data-router-slot="disabled">Go to about!</a>
```

#### `router-link`

With the `router-link` component you add `<router-link>` to your markup and specify a path. Whenever the component is clicked it will navigate to the specified path. Whenever the path of the router link is active the active attribute is set.

```html
<router-link path="login">
  <button>Go to login page!</button>
</router-link>
```

Paths can be specified either in relative or absolute terms. To specify an absolute path you simply pass `/home/secret`. The slash makes the URL absolute. To specify a relative path you first have to be aware of the `router-slot` context you are navigating within. The `router-link` component will navigate based on the nearest parent `router-slot` element. If you give the component a path (without the slash), the navigation will be done in relation to the parent `router-slot`. You can also specify `../login` to traverse up the router tree.

### 6. Putting it all together

So to recap the above steps, here's how to use the router.

```html
<html>
  <head>
    <base href="/" />
  </head>
  <body>
    <router-slot></router-slot>

    <a href="/home">Go to home</a>
    <a href="/login">Go to login</a>

    <script type="module">
        import "https://unpkg.com/router-slot?module";
        customElements.whenDefined("router-slot").then(async () => {
            const routerSlot = document.querySelector("router-slot");
            await routerSlot.add([
              {
                path: "login",
                component: () => import("./path/to/login-component") 
              },
              {
                path: "home",
                component: () => import("./path/to/home-component") 
              },
              {
                path: "**",
                redirectTo: "home"
              }
            ]);
        });
    </script>
  </body>
</html>
```


[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/colored.png)](#lit-element)

## ➤ `lit-element`

The `router-slot` works very well with `lit-element`. Check out the example below to get an idea on how you could use this router in your own `lit-element` based projects.

```typescript
import { LitElement, html, query, PropertyValues } from "lit-element";
import { RouterSlot } from "router-slot";

const ROUTES = [
 {
   path: "login",
   component: () => import("./pages/login")
 },
 {
   path: "home",
   component: () => import("./pages/home")
 },
 {
   path: "**",
   redirectTo: "home"
 }
];

@customElement("app-component");
export class AppComponent extends LitElement {
  @query("router-slot") $routerSlot!: RouterSlot;

  firstUpdated (props: PropertyValues) {
    super.firstUpdated(props);
    this.$routerSlot.add(ROUTES);
  }

  render () {
    return html`<router-slot></router-slot>`;
  }
}
```


[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/colored.png)](#advanced)

## ➤ Advanced

You can customize a lot in this library. Continue reading to learn how to handle your new superpowers.

### Guards

A guard is a function that determines whether the route can be activated or not. The example below checks whether the user has a session saved in the local storage and redirects the user to the login page if the access is not provided. If a guard returns false the routing is cancelled.

```typescript
function sessionGuard () {

  if (localStorage.getItem("session") == null) {
    history.replaceState(null, "", "/login");
    return false;
  }

  return true;
}
```

Add this guard to the add function in the `guards` array.

```typescript
...
await routerSlot.add([
  ...
  {
    path: "home",
    component: HomeComponent,
    guards: [sessionGuard]
  },
  ...
]);
```

### Dialog routes

Sometimes you wish to change the url without triggering the route change. This could for example be when you want an url for your dialog. To change the route without triggering the route change you can use the functions on the native object on the history object. Below is an example on how to show a dialog without triggering the route change.

```javascript
history.native.pushState(null, "", "dialog");
alert("This is a dialog");
history.native.back();
```

This allow dialogs to have a route which is especially awesome on mobile.

### Params

If you want params in your URL you can do it by using the `:name` syntax. Below is an example on how to specify a path that matches params as well. This route would match urls such as `user/123`, `user/@andreas`, `user/abc` and so on. The preferred way of setting the value of the params is by setting it through the setup function.

```typescript
await routerSlot.add([
  {
    path: "user/:userId",
    component: UserComponent,
    setup: (component: UserComponent, info: RoutingInfo) => {
      component.userId = info.match.params.userId;
    }
  }
]);
```

Alternatively you can get the params in the `UserComponent` by using the `queryParentRouterSlot(...)` function.

```typescript
import { LitElement, html } from "lit-element";
import { Params, queryParentRouterSlot } from "router-slot";

export default class UserComponent extends LitElement {

  get params (): Params {
    return queryParentRouterSlot(this)!.match!.params;
  }

  render () {
    const {userId} = this.params;
    return html`
      <p>:userId = <b>${userId}</b></p>
    `;
  }
}

customElements.define("user-component", UserComponent);
```

### Deep dive into the different route kinds

There exists three different kinds of routes. We are going to take a look at those different kinds in a bit, but first you should be familiar with what all routes have in common.

```typescript
export interface IRouteBase<T = any> {

  // The path for the route fragment
  path: PathFragment;

  // Optional metadata
  data?: T;

  // If guard returns false, the navigation is not allowed
  guards?: Guard[];

  // The type of match.
  // - If "prefix" router-slot will try to match the first part of the path.
  // - If "suffix" router-slot will try to match the last part of the path.
  // - If "full" router-slot will try to match the entire path.
  // - If "fuzzy" router-slot will try to match an arbitrary part of the path.
  pathMatch?: PathMatch;
}
```

#### Component routes

Component routes resolves a specified component. You can provide the `component` property with either a [class that extends HTMLElement](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements), a module that exports the `web component` as default or a DOM element. These three different ways of doing it can be done lazily by returning it a function instead.

```typescript
export interface IComponentRoute extends IRouteBase {

  // The component loader (should return a module with a default export if it is a module)
  component: Class | ModuleResolver | PageComponent | (() => Class) | (() => PageComponent) | (() => ModuleResolver);

  // A custom setup function for the instance of the component.
  setup?: Setup;
}
```

Here's an example on how that could look in practice.

```typescript
routerSlot.add([
  {
    path: "home",
    component: HomeComponent
  },
  {
    path: "terms",
    component: () => import("/path/to/terms-module")
  },
  {
    path: "login",
    component: () => {
      const $div = document.createElement("div");
      $div.innerHTML = `🔑 This is the login page`;
      return $div;
    }
  },
  {
    path: "video",
    component: document.createElement("video")
  }
]);
```

#### Redirection routes

A redirection route is good to use to catch all of the paths that the routes before did not catch. This could for example be used to handle "404 - Page not found" cases.

```typescript
export interface IRedirectRoute extends IRouteBase {

  // The paths the route should redirect to. Can either be relative or absolute.
  redirectTo: string;

  // Whether the query should be preserved when redirecting.
  preserveQuery?: boolean;
}
```

Here's an example on how that could look in practice.

```typescript
routerSlot.add([
  ...
  {
    path: "404",
    component: document.createTextNode(`404 - The page you are looking for wasn't found.`)
  }
  {
    path: "**",
    redirectTo: "404",
    preserveQuery: true
  }
]);
```

#### Resolver routes

Use the resolver routes when you want to customize what should happen when the path matches the route. This is good to use if you for example want to show a dialog instead of navigating to a new component. If the custom resolver returns false the navigation will be cancelled.

```typescript
export interface IResolverRoute extends IRouteBase {

  // A custom resolver that handles the route change
  resolve: CustomResolver;
}
```

Here's an example on how that could look in practice.

```typescript
routerSlot.add([
  {
    path: "home",
    resolve: (info: RoutingInfo) => {
      const $page = document.createElement("div");
      $page.appendChild(document.createTextNode("This is a custom home page!"));

      // You can for example add the page to the body instead of the
      // default behavior where it is added to the router-slot.
      // If you want a router-slot inside the element you are adding here
      // you need to set the parent of that router-slot to info.slot.
      document.body.appendChild($page);
    })
  }
]);
```

### Stop the user from navigating away

Let's say you have a page where the user has to enter some important data and suddenly he/she clicks on the back button! Luckily you can cancel the the navigation before it happens by listening for the `willchangestate` event on the `window` object and calling `preventDefault()` on the event.

```javascript
window.addEventListener("willchangestate", e => {

  // Check if we should navigate away from this page
  if (!confirm("You have unsafed data. Do you wish to discard it?")) {
    e.preventDefault();
    return;
  }

}, {once: true});
```

### Helper functions

The library comes with a set of helper functions. This includes:

* `path()` - The current path of the location.
* `query()` - The current query as an object.
* `queryString()` - The current query as a string.
* `toQuery(queryString)` - Turns a query string into a an object.
* `toQueryString(query)` - Turns a query object into a string.
* `slashify({ startSlash?: boolean, endSlash?: boolean; })` - Makes sure that the start and end slashes are present or not depending on the options.
* `stripSlash()` - Strips the slash from the start and/or end of a path.
* `ensureSlash()` - Ensures the path starts and/or ends with a slash.
* `isPathActive (path: string | PathFragment, fullPath: string = getPath())` - Determines whether the path is active compared to the full path.

### Global navigation events

You are able to listen to the navigation related events that are dispatched every time something important happens. They are dispatched on the `window` object.

```typescript
// An event triggered when a new state is added to the history.
window.addEventListener("pushstate", (e: PushStateEvent) => {
  console.log("On push state", path());
});

// An event triggered when the current state is replaced in the history.
window.addEventListener("replacestate", (e: ReplaceStateEvent) => {
  console.log("On replace state", path());
});

// An event triggered when a state in the history is popped from the history.
window.addEventListener("popstate", (e: PopStateEvent) => {
  console.log("On pop state", path());
});

// An event triggered when the state changes (eg. pop, push and replace)
window.addEventListener("changestate", (e: ChangeStateEvent) => {
  console.log("On change state", path());
});

// A cancellable event triggered before the history state changes.
window.addEventListener("willchangestate", (e: WillChangeStateEvent) => {
  console.log("Before the state changes. Call 'e.preventDefault()' to prevent the state from changing.");
});

// An event triggered when navigation starts.
window.addEventListener("navigationstart", (e: NavigationStartEvent) => {
  console.log("Navigation start", e.detail);
});

// An event triggered when navigation is canceled. This is due to a Route Guard returning false during navigation.
window.addEventListener("navigationcancel", (e: NavigationCancelEvent) => {
  console.log("Navigation cancelled", e.detail);
});

// An event triggered when navigation ends.
window.addEventListener("navigationend", (e: NavigationEndEvent) => {
  console.log("Navigation end", e.detail);
});

// An event triggered when navigation fails due to an unexpected error.
window.addEventListener("navigationerror", (e: NavigationErrorEvent) => {
  console.log("Navigation failed", e.detail);
});

// An event triggered when navigation successfully completes.
window.addEventListener("navigationsuccess", (e: NavigationSuccessEvent) => {
  console.log("Navigation failed", e.detail);
});
```

#### Scroll to the top

If you want to scroll to the top on each page change to could consider doing the following.

```typescript
window.addEventListener("navigationend", () => {
  requestAnimationFrame(() => {
    window.scrollTo(0, 0);
  });
});
```

#### Style the active link

If you want to style the active link you can do it by using the `isPathActive(...)` function along with listning to the `changestate` event.

```javascript
import {isPathActive} from "router-slot";

const $links = Array.from(document.querySelectorAll("a"));
window.addEventListener("changestate", () => {
  for (const $link of $links) {

    // Check whether the path is active
    const isActive = isPathActive($link.getAttribute("href"));

    // Set the data active attribute if the path is active, otherwise remove it.
    if (isActive) {
      $link.setAttribute("data-active", "");

    } else {
      $link.removeAttribute("data-active");
    }
  }
});
```


[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/colored.png)](#-be-careful-when-navigating-to-the-root)

## ➤ ⚠️ Be careful when navigating to the root!

From my testing I found that Chrome and Safari, when navigating, treat an empty string as url differently. As an example `history.pushState(null, null, "")` will navigate to the root of the website in Chrome but in Safari the path won't change. The workaround I found was to simply pass "/" when navigating to the root of the website instead.


[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/colored.png)](#contributors)

## ➤ Contributors
	

| [<img alt="Andreas Mehlsen" src="https://avatars1.githubusercontent.com/u/6267397?s=460&v=4" width="100">](https://twitter.com/andreasmehlsen) | [<img alt="You?" src="https://joeschmoe.io/api/v1/random" width="100">](https://github.com/andreasbm/router-slot/blob/master/CONTRIBUTING.md) |
|:--------------------------------------------------:|:--------------------------------------------------:|
| [Andreas Mehlsen](https://twitter.com/andreasmehlsen) | [You?](https://github.com/andreasbm/router-slot/blob/master/CONTRIBUTING.md) |


[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/colored.png)](#license)

## ➤ License
	
Licensed under [MIT](https://opensource.org/licenses/MIT).
