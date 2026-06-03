# Feature Specification: Secret Detection & Input Sanitization (Feature-10)
**Status:** Ready for Development  
**Target Release:** v1.0.0  
**Author:** Security Engineering Team  

---

## 1. Feature Summary & Value Proposition
Developers often include sample configurations, environment variables, or private API credentials when testing prompts. If they upload these prompts publicly without sanitization, API keys, credentials, and confidential codes can leak to the internet, exposing systems to attacks.

The **Secret Detection & Input Sanitizer** is an automated client-side and server-side security scanning layer. It detects standard credential formats (OpenAI API keys, AWS tokens, database connection strings, generic passwords) and alerts the user *before* the prompt can be saved or published. It also sanitizes output blocks to ensure zero code-injection attacks succeed.

---

## 2. Feature Scope
*   **API Key Detection:** Scanning for specific key patterns (e.g., `sk-...` for OpenAI, AWS access keys, SSH key headers).
*   **Password Detection:** Scanning for plain text credentials inside sample database configurations.
*   **Secret Scanning Engine:** Using regex signatures to analyze prompt title, description, and body fields.
*   **Input Sanitization:** Purging HTML syntax from prompt text fields to neutralize XSS vectors.
*   **Security Warnings:** Displaying warning indicators in the editor, requiring explicit confirmation before publishing flagged content.

---

## 3. Functional Requirements

### FR-10.1: Signature Detection Patterns
The scanner checks inputs against database patterns, including:
*   *OpenAI API Key:* `/sk-[a-zA-Z0-9]{48}/`
*   *AWS Access Key ID:* `/(A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ASCA|ASIA)[A-Z0-9]{16}/`
*   *Generic Private SSH Key:* `/-----BEGIN [A-Z]+ PRIVATE KEY-----/`
*   *Database URI Credentials:* `/postgres(ql)?:\/\/([^:]+):([^@]+)@/`

### FR-10.2: Editor Warning Alert
*   **Real-time Scan:** As the user writes, the editor runs regex checks in the background (debounced).
*   **Visual Warning Box:** If a pattern matches, a warning banner floats above the prompt save section:
    > ⚠️ **Security Alert:** We detected what looks like an API key or password on line 4. Please remove this before publishing.
*   **Submission Gate:** If the prompt is marked `Public` or `Unlisted` and contains a secret, the "Save" action is disabled until the secret is removed or the visibility is changed to `Private`.

### FR-10.3: Output HTML Sanitization
*   All user inputs compiled by the Markdown compiler must pass through `DOMPurify` to strip `<script>` tags, custom handler events (e.g. `onload=`, `onerror=`), and other XSS injection vectors.

---

## 4. Technical Design (Javascript Scanner Implementation)

```javascript
class SecretScanner {
  static RULES = [
    {
      name: "OpenAI API Key",
      regex: /sk-[a-zA-Z0-9]{48}/g
    },
    {
      name: "AWS Access Key",
      regex: /(AKIA|ASCA|ASIA)[A-Z0-9]{16}/g
    },
    {
      name: "Private SSH Key",
      regex: /-----BEGIN [A-Z]+ PRIVATE KEY-----/g
    },
    {
      name: "Database Credentials",
      regex: /mongodb\+srv:\/\/([^:]+):([^@]+)@|postgres(ql)?:\/\/([^:]+):([^@]+)@/g
    }
  ];

  /**
   * Scans text and returns list of matched rule violations.
   * @param {string} text 
   * @returns {{ruleName: string, index: number}[]}
   */
  static scan(text) {
    const violations = [];
    this.RULES.forEach(rule => {
      rule.regex.lastIndex = 0;
      let match;
      while ((match = rule.regex.exec(text)) !== null) {
        violations.push({
          ruleName: rule.name,
          index: match.index
        });
      }
    });
    return violations;
  }
}
```

---

## 5. Test Scenarios

| Test ID | Input Case | Expected Behavior / Output |
|---------|------------|----------------------------|
| **TS-01** | User enters `"My openai key is sk-123456789012345678901234567890123456789012345678"` | Scanner registers OpenAI API Key violation; "Publish" button disabled. |
| **TS-02** | User enters standard markdown text with variables | Scanner returns 0 violations; publishing proceeds normally. |
| **TS-03** | Malicious user writes `<script>alert('xss')</script>` in comment | Compiler sanitizes code. Script tag rendered as plain text or deleted, preventing injection. |
