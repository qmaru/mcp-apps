import type { CallToolResult } from "@modelcontextprotocol/sdk/types"

export const parseToolResult = <T>(result: CallToolResult | null): T | null => {
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

  const textContent = result.content.find((item) => item.type === "text")

  if (textContent?.type === "text") {
    return textContent.text as T
  }

  return null
}
