import { useEffect, useRef, useState } from "react"

import type { App as McpApp, McpUiHostContext } from "@modelcontextprotocol/ext-apps"
import { useApp } from "@modelcontextprotocol/ext-apps/react"
import type { CallToolResult } from "@modelcontextprotocol/sdk/types"

type OnToolInput = NonNullable<McpApp["ontoolinput"]>
type OnToolResult = NonNullable<McpApp["ontoolresult"]>
type OnToolCancelled = NonNullable<McpApp["ontoolcancelled"]>
type OnHostContextChanged = NonNullable<McpApp["onhostcontextchanged"]>
type OnTeardown = NonNullable<McpApp["onteardown"]>
type OnError = NonNullable<McpApp["onerror"]>

interface UseMcpAppOptions {
  appInfo: {
    name: string
    version: string
  }

  capabilities?: Record<string, unknown>

  onToolInput?: OnToolInput
  onToolResult?: OnToolResult
  onToolCancelled?: OnToolCancelled
  onHostContextChanged?: OnHostContextChanged
  onTeardown?: OnTeardown
  onError?: OnError
}

export function useMcpApp({
  appInfo,
  capabilities = {},
  onToolInput,
  onToolResult,
  onToolCancelled,
  onHostContextChanged,
  onTeardown,
  onError,
}: UseMcpAppOptions) {
  const [toolResult, setToolResult] = useState<CallToolResult | null>(null)
  const [hostContext, setHostContext] = useState<McpUiHostContext>()

  const handlersRef = useRef({
    onToolInput,
    onToolResult,
    onToolCancelled,
    onHostContextChanged,
    onTeardown,
    onError,
  })

  handlersRef.current = {
    onToolInput,
    onToolResult,
    onToolCancelled,
    onHostContextChanged,
    onTeardown,
    onError,
  }

  const { app, error } = useApp({
    appInfo,
    capabilities,

    onAppCreated(app) {
      app.onteardown = async (params, extra) => {
        if (handlersRef.current.onTeardown) {
          return handlersRef.current.onTeardown(params, extra)
        }

        return {}
      }

      app.ontoolinput = async (input) => {
        return handlersRef.current.onToolInput?.(input)
      }

      app.ontoolresult = async (result) => {
        setToolResult(result)
        return handlersRef.current.onToolResult?.(result)
      }

      app.ontoolcancelled = (params) => {
        return handlersRef.current.onToolCancelled?.(params)
      }

      app.onhostcontextchanged = (params) => {
        setHostContext((prev) => ({
          ...prev,
          ...params,
        }))

        return handlersRef.current.onHostContextChanged?.(params)
      }

      app.onerror =
        handlersRef.current.onError ??
        ((error) => {
          console.error(error)
        })
    },
  })

  useEffect(() => {
    if (!app) return

    setHostContext(app.getHostContext())
  }, [app])

  return {
    app,
    error,
    toolResult,
    hostContext,
  }
}
