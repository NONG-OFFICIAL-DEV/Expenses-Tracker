// Dropping a dragged card can leave the pointer over a DIFFERENT card once
// the list re-renders in its new order, so the click that follows the drop
// can land on - and navigate - a sibling's own link instead of the one being
// dragged. dnd-kit suppresses the click on the dragged element itself, but
// not this "landed on a neighbor" case, so this swallows exactly the next
// click anywhere on the document once a drag ends, regardless of what it
// targets, via a capturing listener that runs before any element's own
// click handler.
export function markDragEnded() {
  if (typeof document === "undefined") return;

  function swallow(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    cleanup();
  }

  function cleanup() {
    document.removeEventListener("click", swallow, true);
    clearTimeout(safetyTimer);
  }

  document.addEventListener("click", swallow, true);
  // In case no click ever follows (e.g. the drag was cancelled), don't leave
  // the next unrelated click swallowed indefinitely.
  const safetyTimer = setTimeout(cleanup, 500);
}
