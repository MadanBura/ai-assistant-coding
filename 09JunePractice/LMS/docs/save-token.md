# Token Optimization Guide

This guide defines strict communication patterns for the AI assistant to minimize token usage (both input and output) while maintaining high-quality code delivery and precision.

## Principles

1.  **Clarify Before Coding:** Never guess or assume implementation details. If a requirement is ambiguous, stop and ask clarifying questions first. Prevent writing code that will be discarded.
2.  **Focus on Deltas:** Do not rewrite or output entire files. Provide only the specific changes (diffs, replacement blocks, or line-level adjustments).
3.  **Zero Redundancy:** Do not repeat the user's task, instructions, or constraints back to them in your response.
4.  **Conciseness:** Avoid conversational preambles (e.g., "Certainly! I'd be happy to help with that..."), filler text, and redundant post-implementation explanations.
5.  **State-Minimized Context:** Only read files that are directly relevant to the current step. Do not re-read files that are already in the conversational context.

## Prompt Patterns

### Prompting for Code Modifications
When modifying existing files, use targeted replacement chunks rather than complete rewrites.
*   **Format:** Specify starting/ending lines and the exact string to replace.
*   **Example Response:**
    ```markdown
    Update in `server.js` at L12-15:
    ```javascript
    // Replace:
    const app = express();
    // With:
    const app = express();
    app.use(express.json());
    ```

### Requesting Clarification
Keep questions direct and multiple-choice where possible to save interaction loops.
*   **Format:** "Regarding [Feature X], should the default behavior be A or B?"

## What to Avoid

*   **Avoid Boilerplate Output:** Do not output boilerplate code (e.g., full standard express servers, basic HTML headers) unless specifically requested.
*   **Avoid Over-Logging/Over-Commenting:** Do not add verbose console logs, debugging statements, or paragraphs of comments within the code unless debugging is the active task.
*   **Avoid Unnecessary Re-reading:** Do not run file-read commands on files whose contents have already been loaded earlier in the chat history.
*   **Avoid Repetitive Summaries:** Do not write long summaries explaining what a code change does if the code or diff itself is self-explanatory.

## File Reference Strategy

*   **Reference, Don't Paste:** Never paste the contents of local files into the prompt if the file can be referenced. Use `@filename` or standard markdown links like `[filename](file:///path/to/file)`.
*   **Line-Range Targeting:** When reading or discussing a file, specify the exact line range needed (e.g., `@server.js#L20-45`) to prevent loading the entire file into the active LLM context.
*   **Logical Chunking:** Split massive files into modular components to keep the referenced files small and context windows clean.

## Quick Checklist

- [ ] **Clarified?** Are all requirements 100% clear? If not, ask the user before writing code.
- [ ] **Delta Only?** Am I outputting only the modified code lines rather than the full file?
- [ ] **No Repetition?** Did I remove any restatement of the user's instructions?
- [ ] **No Filler?** Have I deleted conversational intros, greetings, and lengthy summaries?
- [ ] **Referenced?** Did I reference files using markdown links rather than pasting full contents?
