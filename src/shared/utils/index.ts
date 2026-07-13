import type { CallToolResult } from "@modelcontextprotocol/sdk/types"

export const parseToolResult = <T extends object>(result: CallToolResult | null): T | null => {
  if (!result) {
    return null
  }

  const structuredContent = (
    result as CallToolResult & {
      structuredContent?: unknown
    }
  ).structuredContent

  if (structuredContent && typeof structuredContent === "object") {
    return structuredContent as T
  }

  return null
}
