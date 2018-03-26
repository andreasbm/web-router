export interface IPage {
	parentRouter: Router;
}

export type IGuard = ((router: Router, route: IRoute) => boolean);

export interface IRoute {
	/* The path match */
	path: RegExp;

	/* The component load (should return a module with a default export) */
	loader?: Promise</*tslint:disable:no-any*/any/*tslint:enable:no-any*/>;

	/* If guard returns false, the navigation is not allowed */
	guards?: IGuard[];

	/* Determines whether there should be scrolled to the top on the new page */
	scrollToTop?: boolean;

	/* A redirection route */
	redirectTo?: string;
}

const template = document.createElement("template");
template.innerHTML = `<slot></slot>`;

export class Router extends HTMLElement {

	/**
	 * The parent router.
	 * Is REQUIRED if this router is a child.
	 * When set, the relevant listeners are added or teared down.
	 */
	_parentRouter: Router | null;
	set parentRouter (value: Router | null) {
		this.tearDownListeners();
		this._parentRouter = value;
		this.hookUpListeners();
	}

	get parentRouter () {
		return this._parentRouter;
	}

	/**
	 * Whether the router is a child router.
	 */
	get isChildRouter () {
		return this.parentRouter != null;
	}

	/**
	 * Contains the available routes.
	 */
	private routes: IRoute[] = [];

	/**
	 * The current route.
	 */
	private currentRoute: IRoute | null;

	/**
	 * The current path of the location.
	 */
	static get currentPath () {
		return window.location.pathname;
	}

	/**
	 * Router related events.
	 */
	static get events () {
		return {
			didChangeRoute: "didChangeRoute",
			onPushState: "onPushState"
		};
	}

	constructor () {
		super();

		this.onPathChanged = this.onPathChanged.bind(this);

		// Attach the template
		const shadow = this.attachShadow({mode: "open"});
		shadow.appendChild(template.content.cloneNode(true));
	}

	/**
	 * Remove event listeners and clean up.
	 */
	disconnectedCallback () {
		this.tearDownListeners();
	}

	/**
	 * Sets up the routes.
	 * @param {IRoute[]} routes
	 * @param parentRouter
	 * @param {boolean} navigate
	 * @returns {Promise<void>}
	 */
	async setup (routes: IRoute[], parentRouter?: Router | null, navigate = true) {

		// Add the routes to the array
		await this.clearRoutes();
		for (const route of routes) {
			this.routes.push(route);
		}

		this.parentRouter = parentRouter;

		// Register that the path has changed so the correct route can be loaded.
		if (navigate) {
			await this.onPathChanged();
		}
	}

	/**
	 * Removes all routes.
	 */
	async clearRoutes () {
		this.routes.length = 0;
	}

	/**
	 * Hook up listeners to either the window or the parent router.
	 */
	private hookUpListeners () {
		if (this.isChildRouter) {
			this.parentRouter.addEventListener(Router.events.didChangeRoute, this.onPathChanged);

		} else {
			window.addEventListener("popstate", this.onPathChanged);
			window.addEventListener(Router.events.onPushState, this.onPathChanged);
		}
	}

	/**
	 * Tear down the listeners from either the window or the parent router.
	 */
	private tearDownListeners () {
		if (this.isChildRouter) {
			this.parentRouter.removeEventListener(Router.events.didChangeRoute, this.onPathChanged);
		}

		window.removeEventListener("popstate", this.onPathChanged);
		window.removeEventListener(Router.events.onPushState, this.onPathChanged);
	}

	/**
	 * Each time the path changes, load the new path.
	 * Prevents the event from continuing down the router tree if a navigation was made.
	 * @private
	 */
	private async onPathChanged (e?: CustomEvent) {
		await this.loadPath(Router.currentPath);
	}

	/**
	 * Matches the first route that matches the given path.
	 * @private
	 */
	private matchRoute (path: string): IRoute | null {
		for (const route of this.routes) {
			if (path.match(route.path) != null) return route;
		}

		return null;
	}

	/**
	 * Loads a new path based on the routes.
	 * Returns true if a navigation was made to a new page.
	 * @private
	 */
	private async loadPath (path: string): Promise<boolean> {

		// Find the corresponding route.
		const route = this.matchRoute(path);

		// Ensure that a route was found.
		if (route == null) {
			throw new Error(`No routes matches the path '${path}'.`);
		}

		// Check whether the loader or redirectTo is specified.
		if (route.loader == null && route.redirectTo == null && !(route.loader != null && route.redirectTo != null)) {
			throw new Error(`The route ´${route.path}´ needs to have either a loader or a redirectTo set.`);
		}

		// Check whether the guards allows us to go to the new route.
		if (route.guards != null) {
			for (const guard of route.guards) {
				if (!guard(this, route)) {
					// TODO: Should we remove the current route from the HTML?
					return false;
				}
			}
		}

		// Only change route if its a new route.
		const navigate = (this.currentRoute !== route);
		if (navigate) {

			// Redirect if nessesary
			if (route.redirectTo != null) {
				Router.replaceState(null, null, route.redirectTo);
				return false;
			}

			const module = await route.loader;
			const page = (new module.default());
			page.parentRouter = this;

			// Add the new page to the DOM
			// this.innerHTML = "";
			// this.appendChild(page);

			if (this.childNodes.length > 0) {
				const previousPage = this.childNodes[0];
				this.removeChild(previousPage);
			}

			this.appendChild(page);

			this.currentRoute = route;
		}

		// Scroll to the top of the new page if nessesary.
		// Scrolling to the top is the default behavior.
		if (route.scrollToTop == null || route.scrollToTop) {
			window.scrollTo(0, 0);
		}

		// Always dispatch the did change route event to notify the children.
		this.dispatchDidChangeRouteEvent(route);

		return navigate;
	}

	/**
	 * Dispatches a did change route event.
	 * @param {IRoute} route
	 */
	private dispatchDidChangeRouteEvent (route: IRoute) {
		this.dispatchEvent(new CustomEvent(Router.events.didChangeRoute, {
			detail: {
				route
			}
		}));
	}

	/**
	 * Dispatches a on push state event.
	 */
	private static dispatchOnPushStateEvent () {
		window.dispatchEvent(new CustomEvent(Router.events.onPushState));
	}

	/*******************************************
	 *** Implementation of History interface ***
	 *** We need to wrap the history API in  ***
	 *** to dispatch the "onpushstate" event ***
	 *******************************************/

	/**
	 * The number of pages in the history stack.
	 * @returns {number}
	 */
	static get historyLength (): number {
		return history.length;
	}

	/**
	 * The state of the current history entry.
	 * @returns {{}}
	 */
	static get state (): {} {
		return history.state;
	}

	/**
	 * Set default scroll restoration behavior on history navigation.
	 * This property can be either auto or manual.
	 * @param {ScrollRestoration} value
	 */
	static set scrollRestoration (value: ScrollRestoration) {
		history.scrollRestoration = value;
	}

	/**
	 * The scroll restoration behavior.
	 * @returns {ScrollRestoration}
	 */
	static get scrollRestoration (): ScrollRestoration {
		return history.scrollRestoration;
	}

	/**
	 * Goes to the previous page in session history, the same action as when the user
	 * clicks the browser's Back button. Equivalent to history.go(-1).
	 */
	static back () {
		history.back();
	}

	/**
	 * Goes to the next page in session history, the same action as when the
	 * user clicks the browser's Forward button; this is equivalent to history.go(1).
	 */
	static forward () {
		history.forward();
		this.dispatchOnPushStateEvent();
	}

	/**
	 * Loads a page from the session history, identified by its relative location
	 * to the current page, for example -1 for the previous page or 1  for the next page.
	 * @param {number} delta
	 */
	static go (delta: number) {
		history.go(delta);
		this.dispatchOnPushStateEvent();
	}

	/**
	 * Pushes the given data onto the session history stack with the specified title and, if provided, URL.
	 * @param {{}} data
	 * @param {string} title
	 * @param {string | null} url
	 */
	static pushState (data: {}, title: string, url: string | null) {
		history.pushState(data, title, url);
		this.dispatchOnPushStateEvent();
	}

	/**
	 * Updates the most recent entry on the history stack to have the specified data, title, and, if provided, URL.
	 * @param {{}} data
	 * @param {string} title
	 * @param {string | null} url
	 */
	static replaceState (data: {} | null, title: string | null, url: string | null) {
		history.replaceState(data, title, url);
		this.dispatchOnPushStateEvent();
	}
}

window.customElements.define("router-component", Router);