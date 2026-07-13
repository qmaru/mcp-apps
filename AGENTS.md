# Project Guidelines

This project is a multi-single-page application. Each app lives in its own directory and has an independent `index.html` entry point.

When creating or updating an app:

- Design the UI based on the user-provided input and expected output.
- Reuse existing styles and components from `src/shared` whenever possible.
- Add the interaction UI required for the app's intended workflow.

Use the existing apps as implementation directions, not rigid templates:

- Start from `echo` for the basic MCP app structure: connection state, error state, `onToolResult`, and result-card props.
- For an unstructured `content` item with `type: "text"`, follow `medicine`: use `parseToolResult<string>` and render the text as Markdown when appropriate. Do not infer a schema from the text.
- For structured results, follow `weather`: define the expected result type and render its known fields.
- For tools that send no arguments or do not return a displayable result, follow `ping`: present a direct action and the relevant pending/error states.
- Adapt these directions to the tool's actual workflow. Do not copy an example app wholesale when its input, output, or interaction model does not match.
