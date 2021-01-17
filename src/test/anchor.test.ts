import { RouterSlot } from "../lib";
import { ensureHistoryEvents } from "../lib/util/history";
import { path } from "../lib/util/url";
import { addBaseTag, clearHistory } from "./test-helpers";

const testPath = `/about`;

describe("AnchorHandler", () => {
	const {expect} = chai;
	let $anchor!: HTMLAnchorElement;
	let $slot = new RouterSlot();
	let $windowPushstateHandler: () => void;

	const addTestRoute = () => {
		$slot.add([
			{
				path: testPath,
				component: () => document.createElement("div")
			}
		])
	}

	before(() => {
		ensureHistoryEvents();
		addBaseTag();
		// we instantiate the AnchorHandler when the router-slot is connected
		document.body.appendChild($slot);
	});
	beforeEach(() => {
		const anchor = document.createElement('a');
		anchor.id = "anchor";
		anchor.href = testPath;
		anchor.innerHTML = "Anchor";
		document.body.appendChild(anchor);
		$anchor = document.body.querySelector<HTMLAnchorElement>("#anchor")!;
	});
	afterEach(() => {
		$anchor.remove();
		$slot.clear();
		window.removeEventListener('pushstate', $windowPushstateHandler);
	});
	after(() => {
		clearHistory();
		$slot.remove();
	});

	it("[AnchorHandler] should change anchors to use history API", done => {
		addTestRoute();

		$windowPushstateHandler = () => {
			expect(path({end: false})).to.equal(testPath);
			done();
		};

		window.addEventListener("pushstate", $windowPushstateHandler);

		$anchor.click();
	});

	it("[AnchorHandler] should not change anchors with target _blank", done => {
		addTestRoute();

		$windowPushstateHandler = () => {
			expect(true).to.equal(false);
		}

		window.addEventListener("pushstate", $windowPushstateHandler);

		$anchor.target = "_blank";
		$anchor.click();
		done();
	});

	it("[AnchorHandler] should not change anchors with [data-router-slot]='disabled'", done => {
		addTestRoute();

		$windowPushstateHandler = () => {
			expect(true).to.equal(false);
		}

		window.addEventListener("pushstate", $windowPushstateHandler);

		$anchor.setAttribute("data-router-slot", "disabled");
		$anchor.click();
		done();
	});

	it("[AnchorHandler] should not change anchors that are not supported by the router", done => {
		// there are no routes added to the $slot in this test
		// so the router will not attempt to handle it

		$windowPushstateHandler = () => {
			expect(true).to.equal(false);
		}

		window.addEventListener("pushstate", $windowPushstateHandler);

		$anchor.click();
		done();
	});

	it("[AnchorHandler] should change anchors if there is a catch-all route", done => {
		$slot.add([
			{
				path: '**',
				component: () => document.createElement("div")
			}
		]);

		$windowPushstateHandler = () => {
			expect(path({ end: false })).to.equal(testPath);
			done();
		}
		window.addEventListener("pushstate", $windowPushstateHandler);

		$anchor.click();
	});

	it("[AnchorHandler] removes the listener when `teardown()` called", done => {
		// the router should be handling this because we have a catch-all, but
		// we're tearing down the anchorHandler before the click so it shouldn't handle
		$slot.add([
			{
				path: '**',
				component: () => document.createElement("div")
			}
		]);

		// remove the slot, which should tear down the handler
		$slot.remove();

		$windowPushstateHandler = () => {
			// should never reach here
			expect(true).to.equal(false);
		}
		window.addEventListener("pushstate", $windowPushstateHandler);

		$anchor.click();
		done();
		// set back up for future tests
		document.body.appendChild($slot);
	});
});
