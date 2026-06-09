import "@testing-library/jest-dom";

// jsdom does not implement scrollIntoView, which the DebugPanel autoscroll
// effect calls whenever the panel is open and new logs arrive.
Element.prototype.scrollIntoView = () => {};
