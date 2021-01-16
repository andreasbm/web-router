import { GLOBAL_ROUTER_EVENTS_TARGET } from "./config";
import { EventListenerSubscription, GlobalRouterEvent, IRouterSlot, PathFragment } from "./model";
import { addListener, isPathActive, queryParentRouterSlot, queryString, removeListeners, slashify } from "./util";

const template = document.createElement("template");
template.innerHTML = `<slot></slot>`;

/**
 * Router link.
 * @slot - Default content.
 */
export class RouterLink extends HTMLElement {

	private listeners: EventListenerSubscription[] = [];
	private _context: IRouterSlot | null = null;

	static get observedAttributes () {
		return [
			"disabled"
		];
	}

	/**
	 * The path of the navigation.
	 * @attr
	 */
	set path (value: string | PathFragment) {
		this.setAttribute("path", value);
	}

	get path (): string | PathFragment {
		return this.getAttribute("path") || "/";
	}

	/**
	 * The link target, equivalent of <a target>.
	 * @attr
	 */
	get target(): string | null {
		return this.getAttribute("target");
	}

	/**
	 * Whether the element is disabled or not.
	 * @attr
	 */
	get disabled (): boolean {
		return this.hasAttribute("disabled");
	}

	set disabled (value: boolean) {
		value ? this.setAttribute("disabled", "") : this.removeAttribute("disabled");
	}

	/**
	 * Whether the element is active or not.
	 * @attr
	 */
	get active (): boolean {
		return this.hasAttribute("active");
	}

	set active (value: boolean) {
		value ? this.setAttribute("active", "") : this.removeAttribute("active");
	}

	/**
	 * Whether the focus should be delegated.
	 * @attr
	 */
	get delegateFocus (): boolean {
		return this.hasAttribute("delegateFocus");
	}

	set delegateFocus (value: boolean) {
		value ? this.setAttribute("delegateFocus", "") : this.removeAttribute("delegateFocus");
	}

	/**
	 * Whether the query should be preserved or not.
	 * @attr
	 */
	get preserveQuery (): boolean {
		return this.hasAttribute("preservequery");
	}

	set preserveQuery (value: boolean) {
		value ? this.setAttribute("preservequery", "") : this.removeAttribute("preservequery");
	}

	/**
	 * The current router slot context.
	 */
	get context (): IRouterSlot | null {
		return this._context;
	}

	set context (value: IRouterSlot | null) {
		this._context = value;
	}

	/**
	 * Returns the absolute path.
	 */
	get absolutePath (): string {
		return this.constructAbsolutePath(this.path);
	}

	constructor () {
		super();

		this.navigate = this.navigate.bind(this);
		this.updateActive = this.updateActive.bind(this);

		// Attach the template
		const shadow = this.attachShadow({mode: "open", delegatesFocus: this.delegateFocus});
		shadow.appendChild(template.content.cloneNode(true));
	}

	/**
	 * Hooks up the element.
	 */
	connectedCallback () {
		this.listeners.push(
			addListener(this, "click", e => this.navigate(this.path, e)),
			addListener(this, "keydown", (e: KeyboardEvent) => e.code === "Enter" || e.code === "Space" ? this.navigate(this.path, e) : undefined),
			addListener<Event, GlobalRouterEvent>(GLOBAL_ROUTER_EVENTS_TARGET, "navigationend", this.updateActive),
			addListener<Event, GlobalRouterEvent>(GLOBAL_ROUTER_EVENTS_TARGET, "changestate", this.updateActive)
		);

		// Query the nearest router
		this.context = queryParentRouterSlot(this);

		// Set the role to tell the rest of the world that this is a link
		this.setAttribute("role", "link");

		// Updates the tab index if none has been set by the library user
		if (!this.hasAttribute("tabindex")) {
			this.updateTabIndex();
		}
	}

	/**
	 * Tear down listeners.
	 */
	disconnectedCallback () {
		removeListeners(this.listeners);
	}

	/**
	 * Reacts to attribute changed callback.
	 * @param name
	 * @param oldValue
	 * @param newValue
	 */
	attributeChangedCallback (name: string, oldValue: unknown, newValue: unknown) {

		// Updates the tab index when disabled changes
		if (name === "disabled") {
			this.updateTabIndex();
		}
	}

	private updateTabIndex () {
		this.tabIndex = this.disabled ? -1 : 0;
	}

	/**
	 * Returns the absolute path constructed relative to the context.
	 * If no router parent was found the path property is the absolute one.
	 */
	constructAbsolutePath (path: string) {

		// If a router context is present, navigate relative to that one
		if (this.context != null) {
			return this.context.constructAbsolutePath(path);
		}

		return slashify(path, {end: false});
	}


	/**
	 * Updates whether the route is active or not.
	 */
	protected updateActive () {
		const active = isPathActive(this.absolutePath);
		if (active !== this.active) {
			this.active = active;
		}
	}

	/**
	 * Navigates to the specified path.
	 */
	navigate (path: string, e?: Event) {

		// If disabled, we just prevent the navigation already now.
		if (e != null && this.disabled) {
			e.preventDefault();
			e.stopPropagation();
			return;
		}

		const query = this.preserveQuery ? queryString() : "";
		const destination = `${this.absolutePath}${query}`;

		if (this.target) {
			window.open(destination, this.target);
			return;
		}

		// If user is holding down metaKey when clicking, open in new tab
		if (e instanceof MouseEvent && (e as MouseEvent).metaKey) {
			window.open(destination, '_blank');
			return;
		}

		history.pushState(null, "", destination);
	}
}

window.customElements.define("router-link", RouterLink);

declare global {
	interface HTMLElementTagNameMap {
		"router-link": RouterLink;
	}
}