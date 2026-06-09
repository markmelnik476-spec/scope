import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import {
  DebugPanel,
  debugLog,
  formatTime,
  formatRelative,
  formatBytes,
} from "./DebugPanel";

const TOGGLE_TITLE = "Debug Panel (Ctrl+Shift+D)";

function openPanel() {
  fireEvent.click(screen.getByTitle(TOGGLE_TITLE));
}

describe("formatTime", () => {
  it("zero-pads hours, minutes, seconds and milliseconds", () => {
    const d = new Date(2024, 0, 1, 9, 5, 3, 7);
    expect(formatTime(d)).toBe("09:05:03.007");
  });

  it("formats a time with all double/triple digit components", () => {
    const d = new Date(2024, 0, 1, 23, 59, 58, 123);
    expect(formatTime(d)).toBe("23:59:58.123");
  });

  it("formats midnight as all zeros", () => {
    const d = new Date(2024, 0, 1, 0, 0, 0, 0);
    expect(formatTime(d)).toBe("00:00:00.000");
  });
});

describe("formatRelative", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 0, 1, 12, 0, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 'just now' for sub-second differences", () => {
    expect(formatRelative(Date.now())).toBe("just now");
    expect(formatRelative(Date.now() - 999)).toBe("just now");
  });

  it("returns seconds for differences under a minute", () => {
    expect(formatRelative(Date.now() - 1000)).toBe("1s ago");
    expect(formatRelative(Date.now() - 5000)).toBe("5s ago");
    expect(formatRelative(Date.now() - 59000)).toBe("59s ago");
  });

  it("returns minutes for differences under an hour", () => {
    expect(formatRelative(Date.now() - 60000)).toBe("1m ago");
    expect(formatRelative(Date.now() - 120000)).toBe("2m ago");
    expect(formatRelative(Date.now() - 3599000)).toBe("59m ago");
  });

  it("returns hours for differences of an hour or more", () => {
    expect(formatRelative(Date.now() - 3600000)).toBe("1h ago");
    expect(formatRelative(Date.now() - 7200000)).toBe("2h ago");
  });
});

describe("formatBytes", () => {
  it("formats bytes below 1 KB without a decimal", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(1023)).toBe("1023 B");
  });

  it("formats kilobytes with one decimal", () => {
    expect(formatBytes(1024)).toBe("1.0 KB");
    expect(formatBytes(1536)).toBe("1.5 KB");
    expect(formatBytes(1048575)).toBe("1024.0 KB");
  });

  it("formats megabytes with one decimal", () => {
    expect(formatBytes(1048576)).toBe("1.0 MB");
    expect(formatBytes(1572864)).toBe("1.5 MB");
    expect(formatBytes(5242880)).toBe("5.0 MB");
  });
});

describe("DebugPanel component", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the toggle button but keeps the panel closed initially", () => {
    render(<DebugPanel />);
    expect(screen.getByTitle(TOGGLE_TITLE)).toBeInTheDocument();
    expect(screen.queryByText("DEBUG")).not.toBeInTheDocument();
  });

  it("opens and closes the panel when the toggle button is clicked", () => {
    render(<DebugPanel />);
    openPanel();
    expect(screen.getByText("DEBUG")).toBeInTheDocument();
    openPanel();
    expect(screen.queryByText("DEBUG")).not.toBeInTheDocument();
  });

  it("toggles the panel via the Ctrl+Shift+D keyboard shortcut", () => {
    render(<DebugPanel />);
    act(() => {
      fireEvent.keyDown(window, { key: "D", ctrlKey: true, shiftKey: true });
    });
    expect(screen.getByText("DEBUG")).toBeInTheDocument();
  });

  it("shows an empty state when there are no logs", () => {
    render(<DebugPanel />);
    openPanel();
    expect(screen.getByText("No log entries yet")).toBeInTheDocument();
  });

  it("renders a log entry pushed via the debugLog global hook", () => {
    render(<DebugPanel />);
    act(() => {
      debugLog({ type: "info", message: "hello from debugLog" });
    });
    openPanel();
    expect(screen.getByText("hello from debugLog")).toBeInTheDocument();
  });

  it("captures console.log calls as console log entries", () => {
    render(<DebugPanel />);
    act(() => {
      console.log("intercepted log line");
    });
    openPanel();
    expect(screen.getByText("intercepted log line")).toBeInTheDocument();
  });

  it("captures console.error calls and surfaces an error indicator", () => {
    render(<DebugPanel />);
    act(() => {
      console.error("boom an error happened");
    });
    expect(screen.getByTitle(TOGGLE_TITLE)).toHaveTextContent("!");
    openPanel();
    expect(screen.getByText("boom an error happened")).toBeInTheDocument();
  });

  it("filters logs by search query", () => {
    render(<DebugPanel />);
    act(() => {
      debugLog({ type: "info", message: "alpha entry" });
      debugLog({ type: "info", message: "beta entry" });
    });
    openPanel();
    expect(screen.getByText("alpha entry")).toBeInTheDocument();
    expect(screen.getByText("beta entry")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Search logs..."), {
      target: { value: "alpha" },
    });
    expect(screen.getByText("alpha entry")).toBeInTheDocument();
    expect(screen.queryByText("beta entry")).not.toBeInTheDocument();
  });

  it("shows a no-results message when the search matches nothing", () => {
    render(<DebugPanel />);
    act(() => {
      debugLog({ type: "info", message: "only entry" });
    });
    openPanel();
    fireEvent.change(screen.getByPlaceholderText("Search logs..."), {
      target: { value: "zzz-nomatch" },
    });
    expect(screen.getByText("No matching entries")).toBeInTheDocument();
  });

  it("filters logs by type via the filter buttons", () => {
    render(<DebugPanel />);
    act(() => {
      debugLog({ type: "info", message: "an info log" });
      debugLog({ type: "error", message: "an error log" });
    });
    openPanel();

    const errorFilter = screen
      .getAllByRole("button")
      .find((b) => /^error/.test(b.textContent ?? ""));
    expect(errorFilter).toBeDefined();
    fireEvent.click(errorFilter!);

    expect(screen.queryByText("an info log")).not.toBeInTheDocument();
    expect(screen.getByText("an error log")).toBeInTheDocument();
  });

  it("clears all logs when the CLR button is clicked", () => {
    render(<DebugPanel />);
    act(() => {
      debugLog({ type: "info", message: "to be cleared" });
    });
    openPanel();
    expect(screen.getByText("to be cleared")).toBeInTheDocument();

    fireEvent.click(screen.getByText("CLR"));
    expect(screen.queryByText("to be cleared")).not.toBeInTheDocument();
    expect(screen.getByText("No log entries yet")).toBeInTheDocument();
  });

  it("does not throw when debugLog is called after the panel unmounts", () => {
    const { unmount } = render(<DebugPanel />);
    unmount();
    expect(() => debugLog({ type: "info", message: "after unmount" })).not.toThrow();
  });
});
