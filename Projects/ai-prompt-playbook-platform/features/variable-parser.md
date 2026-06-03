# Feature Specification: Dynamic Variable Parser & Compiler (Feature-02)
**Status:** Ready for Development  
**Target Release:** v1.0.0  
**Author:** Core Engine Team  

---

## 1. Feature Summary & Value Proposition
Static prompts are limited in utility. To make prompts reusable, developers parameterize them by declaring placeholders. 

The **Dynamic Variable Parser & Compiler** is a core background processing feature. It scans the raw prompt template text, automatically detects all instances of double-brace placeholders (e.g., `{{variable_name}}`), extracts them into a clean parameters list, and compiles user-supplied inputs back into the template. By verifying syntax, handling duplicates, and alerting users to malformed braces, it guarantees reliable dynamic prompt construction.

---

## 2. Feature Scope

*   **Variable Detection:** Identifying template placeholders using double curly brace delimiters `{{variable_name}}`.
*   **Parameter Extraction:** Parsing variable names and outputting a unique list of parameters to drive form generation.
*   **Validation Rules:** Enforcing structural rules on variable names (e.g., character set limits).
*   **Duplicate Handling:** Consolidating duplicate variable declarations so a variable is prompt-inputted once but replaced globally.
*   **Error Reporting:** Scanning for malformed braces and providing detailed syntactical error diagnostics to the editor.

---

## 3. Technical Requirements & Behavior

### 3.1 Variable Detection & Regular Expression
*   **Delimiter Format:** `{{variable_name}}`
*   **Allowed Characters:** Variable names must be alphanumeric and can contain underscores (regex representation: `[a-zA-Z0-9_]+`). No spaces, hyphens, or special symbols.
*   **Regex Pattern:**
    ```javascript
    const VARIABLE_REGEX = /\{\{([a-zA-Z0-9_]+)\}\}/g;
    ```

### 3.2 Parameter Extraction Logic
*   The parser must scan the entire prompt body.
*   It must extract the contents inside the braces (the variable name).
*   **Output Format:** An array of metadata objects representing the unique variables found:
    ```json
    [
      { "name": "language", "occurrences": 2 },
      { "name": "code_block", "occurrences": 1 }
    ]
    ```

### 3.3 Duplicate Handling
*   If `{{language}}` is used three times in a prompt, the UI must render only **one** input field for `language`.
*   During compilation, the compiler must perform a global replacement, swapping **all** occurrences of `{{language}}` with the user-provided text.

### 3.4 Validation Rules
1.  **Empty Variable Names:** `{{}}` or `{{   }}` must be rejected as invalid.
2.  **Invalid Characters:** Placeholders like `{{my-variable}}` or `{{my variable}}` must trigger validation notices.
3.  **Length Limit:** Variable names must be between 1 and 32 characters in length.

### 3.5 Error Reporting (Syntax Inspection)
To help developers edit complex prompts, a pre-compilation scanner must inspect the template text for malformed brackets:
*   **Unclosed Braces:** Single opening or closing syntax like `{{variable_name` or `variable_name}}`.
*   **Nested Braces:** Braces inside braces like `{{variable_{{nested}}}}` or `{{var{sub}}}`.
*   **Diagnostic Logs:** Return the character index or line number of the malformed brackets to the UI, highlighting the issue for the developer.

---

## 4. Parser & Compiler Implementation Draft

Here is a conceptual implementation of the Javascript parser and compiler class:

```javascript
class PromptParser {
  /**
   * Scans prompt text for variables, validates names, and handles duplicates.
   * @param {string} promptText 
   * @returns {{variables: string[], errors: {line: number, message: string}[]}}
   */
  static parse(promptText) {
    const variables = new Set();
    const errors = [];
    const VARIABLE_REGEX = /\{\{([a-zA-Z0-9_]+)\}\}/g;
    
    // 1. Basic syntax scanner for brackets integrity
    const lines = promptText.split('\n');
    lines.forEach((line, index) => {
      const openCount = (line.match(/\{\{/g) || []).length;
      const closeCount = (line.match(/\}\}/g) || []).length;
      
      if (openCount !== closeCount) {
        errors.push({
          line: index + 1,
          message: `Unmatched brackets detected on line ${index + 1}: ${openCount} open vs ${closeCount} close.`
        });
      }
    });

    // 2. Identify variables
    let match;
    // Reset regex index
    VARIABLE_REGEX.lastIndex = 0;
    while ((match = VARIABLE_REGEX.exec(promptText)) !== null) {
      const varName = match[1];
      variables.add(varName);
    }

    return {
      variables: Array.from(variables),
      errors
    };
  }

  /**
   * Compiles template prompt text by replacing placeholders with user values.
   * @param {string} templateText 
   * @param {Record<string, string>} values 
   * @returns {string} Compiled prompt text
   */
  static compile(templateText, values) {
    let compiled = templateText;
    for (const [key, value] of Object.entries(values)) {
      const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
      compiled = compiled.replace(regex, value);
    }
    return compiled;
  }
}
```

---

## 5. Test Scenarios (Verification Plan)

| Test ID | Input Case | Expected Behavior / Output |
|---------|------------|----------------------------|
| **TS-01** | `"Translate to {{LANGUAGE}}: {{TEXT}}"` | Extract variables `['LANGUAGE', 'TEXT']`. Zero errors. |
| **TS-02** | `"Optimize {{CODE}} under {{LANGUAGE}} with {{CODE}}"` | Extract `['CODE', 'LANGUAGE']` (duplicate handled). |
| **TS-03** | `"Fix this {{code-snippet}}"` | Fail validation: Hyphen is not allowed. |
| **TS-04** | `"Fix this {{CODE"` | Trigger error: Unclosed opening brace. |
| **TS-05** | `"Fix this {{CODE_{{NESTED}}}}"` | Trigger error: Nested braces. |
| **TS-06** | Compile template with missing value for `{{LANGUAGE}}` | Keep placeholder unchanged or render blank space (configurable safety default). |
