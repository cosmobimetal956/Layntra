import AppKit
import ApplicationServices
import Foundation

guard let figma = NSRunningApplication.runningApplications(
  withBundleIdentifier: "com.figma.Desktop"
).first else {
  fputs("Figma is not running.\n", stderr)
  exit(1)
}

figma.activate(options: [.activateAllWindows, .activateIgnoringOtherApps])
usleep(600_000)

guard
  let source = CGEventSource(stateID: .combinedSessionState),
  let keyDown = CGEvent(keyboardEventSource: source, virtualKey: 35, keyDown: true),
  let keyUp = CGEvent(keyboardEventSource: source, virtualKey: 35, keyDown: false)
else {
  fputs("Unable to create keyboard events.\n", stderr)
  exit(1)
}

let modifiers: CGEventFlags = [.maskCommand, .maskAlternate]
keyDown.flags = modifiers
keyUp.flags = modifiers

// Posting directly to the app avoids relying on the Terminal process to own
// the foreground window. The key code is P (35): Option-Command-P runs the
// most recently used Figma plugin.
keyDown.postToPid(figma.processIdentifier)
usleep(120_000)
keyUp.postToPid(figma.processIdentifier)

// Some Electron builds route shortcuts only through the session event tap.
// Send one global copy as well after Figma has been activated.
usleep(200_000)
keyDown.post(tap: .cghidEventTap)
usleep(120_000)
keyUp.post(tap: .cghidEventTap)

print(
  "Sent Option-Command-P to Figma PID \(figma.processIdentifier). " +
  "Accessibility trusted: \(AXIsProcessTrusted())."
)
