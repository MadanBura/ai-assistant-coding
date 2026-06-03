# Feature Specification: One-Click Clipboard Copying (Feature-05)
**Status:** Ready for Development  
**Target Release:** v1.0.0  
**Author:** Frontend Team  

---

## 1. Feature Summary & Value Proposition
The primary goal of discovery on PromptForge is to utilize the prompt. If users have to manually select, drag, highlight, and copy text, formatting can easily get ruined, and the experience feels clunky.

The **One-Click Clipboard Copying** feature provides a seamless, robust action to copy compiled prompts instantly. With clear visual confirmation (toast notifications, changing button states) and fallback mechanisms for older browsers or restricted mobile settings, this feature ensures that the core user action is fast and error-free.

---

## 2. Feature Scope
*   **Clipboard API:** Utilizing browser APIs to copy target compiled text strings to the device clipboard.
*   **Copy Button:** A primary interactive action button attached to prompt output boxes.
*   **Success Toast:** Non-intrusive alert showing copy completion.
*   **Error Handling:** Gracious fallbacks for environments blockading clipboard access.
*   **Mobile Support:** Optimizing copy-paste interaction rules for mobile safari, chrome, and native WebView settings.

---

## 3. Functional Requirements

### FR-5.1: Copy Action & Clipboard API
*   **API Usage:** Use `navigator.clipboard.writeText()` for asynchronous write.
*   **Fallback:** If the API is unsupported, fall back to a hidden textarea element selection and `document.execCommand('copy')`.

### FR-5.2: Visual Confirmation (Micro-interactions)
*   **Button State Change:** The copy button icon (e.g., standard double-document copy icon) must transition to a checkmark icon for 1,500ms post-click, and the button text must change from "Copy Prompt" to "Copied!".
*   **Success Toast:** A lightweight toast alert must float into the bottom-right corner reading: *"Prompt copied to clipboard successfully!"*. The toast must self-dismiss after 2.5 seconds.

### FR-5.3: Error Handling & Fallback
*   If clipboard write permissions are denied, the system must trigger a modal popup containing the full text inside an auto-selected textarea, instructing the user: *"Press Ctrl+C or Cmd+C to copy manually"*.

---

## 4. Technical Implementation Design

```javascript
async function copyTextToClipboard(text) {
  if (!navigator.clipboard) {
    return fallbackCopyTextToClipboard(text);
  }
  try {
    await navigator.clipboard.writeText(text);
    triggerSuccessFeedback();
  } catch (err) {
    console.error('Failed to copy using navigator.clipboard: ', err);
    fallbackCopyTextToClipboard(text);
  }
}

function fallbackCopyTextToClipboard(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  
  // Avoid scrolling to bottom
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand('copy');
    if (successful) {
      triggerSuccessFeedback();
    } else {
      triggerManualCopyModal(text);
    }
  } catch (err) {
    triggerManualCopyModal(text);
  }

  document.body.removeChild(textArea);
}
```

---

## 5. Test Scenarios

| Test ID | Input Case | Expected Behavior / Output |
|---------|------------|----------------------------|
| **TS-01** | Click copy button under normal conditions | Clipboard updated, button shows "Copied!", toast alerts user. |
| **TS-02** | Secure context (HTTPS) missing | Falls back to selection wrapper. Copies successfully. |
| **TS-03** | Clipboard access blocked by browser policy | Triggers instructions modal showing selected text block. |
