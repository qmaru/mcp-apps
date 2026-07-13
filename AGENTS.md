# Project Guidelines

This project is a multi-single-page application. Each app lives in its own directory and has an independent `index.html` entry point.

When creating or updating an app:

- Design the UI based on the user-provided input and expected output.
- Reuse existing styles and components from `src/shared` whenever possible.
- Use the `echo` app as the primary implementation template.
- Add the interaction UI required for the app's intended workflow.

For MCP tool results:

- Keep the `echo` app flow unless the app explicitly requires an interaction UI: receive results through `onToolResult`, retain the card props (`app`, `toolResult`, and `hostContext`), and use the same connection and error states.
- Do not infer a schema for `content` with `type: "text"`. Extract it with `parseToolResult<string>` from `src/shared/utils` and render it as plain Markdown with `react-markdown` when formatted display is needed.
