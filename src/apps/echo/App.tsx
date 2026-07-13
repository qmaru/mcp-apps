import { useState } from "react"

import type { App as McpApp, McpUiHostContext } from "@modelcontextprotocol/ext-apps"
import type { CallToolResult } from "@modelcontextprotocol/sdk/types"

import { useMcpApp } from "@/shared/hooks/useMcpApp"
import { parseToolResult } from "@/shared/utils"
import { AppLayout, InputCard, MessageCard, ResultCard, StateSection } from "@/shared/components"

import "./App.css"

interface EchoCardProps {
  app: McpApp
  toolResult: CallToolResult | null
  hostContext?: McpUiHostContext
}

interface EchoResult {}

const EchoCard = ({ toolResult }: EchoCardProps) => {
  const echoData = parseToolResult<EchoResult>(toolResult)

  if (!echoData) {
    return <div>No data</div>
  }

  return (
    <ResultCard title="Echo Result">
      <pre className="overflow-x-auto text-sm text-slate-600">
        {JSON.stringify(echoData, null, 2)}
      </pre>
    </ResultCard>
  )
}

export default function App() {
  const [result, setResult] = useState<CallToolResult | null>(null)

  const { app, error, hostContext } = useMcpApp({
    appInfo: {
      name: "echo",
      version: "1.0.0",
    },
    onToolResult: async (toolResult) => {
      console.info("Received tool result:", toolResult)
      setResult(toolResult)
    },
    onToolCancelled: (params) => {
      console.info("Tool call cancelled:", params.reason)
    },
    onError: (err) => {
      console.error(err)
    },
  })

  if (error) {
    return (
      <MessageCard>
        <StateSection title="Connection Error" message={error.message} tone="error" />
      </MessageCard>
    )
  }

  if (!app) {
    return (
      <MessageCard>
        <StateSection title="Connecting" message="Establishing connection with the host…" />
      </MessageCard>
    )
  }

  return (
    <AppLayout>
      <InputCard title="Echo" description="Response from the server will be displayed below." />
      {result ? <EchoCard app={app} toolResult={result} hostContext={hostContext} /> : null}
    </AppLayout>
  )
}
