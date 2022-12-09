//
// Makes non-link elements clickable and behave like an A tag.
// This is useful for elements that cannot be wrapped into an A tag,
// such as table rows.
//
// This controller is Turbo-aware and will respect Turbo Frames, by
// opening links in the correct frame. It also supports Turbo Streams.
//
// To fetch a Turbo Stream response, set `data-turbo-stream="true"` on
// the target. You may also set the `data-turbo-action` attribute.
//
//
// Usage:
//
// <turbo-frame id="frame">
//   <table data-controller="link-element">
//     <tr data-href="/path/to/resource" data-turbo-action="advance">
//       <td>...</td>
//     </tr>
//     <tr data-href="/foo/bar" data-turbo-stream="true">
//       <td>Load More</td>
//     </tr>
//   </table>
// </turbo-frame>
//
import { Controller } from "@hotwired/stimulus"
import { get } from "@rails/request.js"

export default class extends Controller {
  static targets = ["link"]

  linkTargetConnected(el) {
    if (!el.dataset["href"]) return

    const _this = this;

    el.addEventListener('click', (event) => {
      if (event.target.tagName === "A") return

      _this.visitUrl(el, event)
      e.stopPropagation();
      e.preventDefault();
    })

    el.addEventListener('mouseenter', (event) => {
      if (event.target.tagName === "A") return
      el.style.cursor = 'pointer';
    })

    el.addEventListener('mouseleave', (event) => {
      if (event.target.tagName === "A") return
      el.style.cursor = 'normal';
    })
  }

  visitUrl(el, event) {
    const url = el.dataset.href;
    let frameId = el.dataset.turboFrame;

    if (event.metaKey) {
      window.open(url, "_blank");
    } else if (el.dataset.turboStream == "true") {
      get(url, { responseKind: "turbo-stream" });
    }
    else {
      if (!frameId)
        frameId = this.element.closest('turbo-frame')?.id;

      Turbo.visit(url, { frame: frameId })

      let topLevelFrameId = frameId.startsWith("_")
      let frame = (topLevelFrameId ? null : document.getElementById(frameId));
      let turboAction = el?.dataset.turboAction || frame?.dataset.turboAction;

      if (!topLevelFrameId) {
        if (turboAction == "advance") history.pushState({}, null, url);
        if (turboAction == "replace") history.replaceState({}, null, url);
      }
    }
  }
}
