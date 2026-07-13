import { useState } from "react"

import type { App as McpApp, McpUiHostContext } from "@modelcontextprotocol/ext-apps"
import type { CallToolResult } from "@modelcontextprotocol/sdk/types"

import { useMcpApp } from "@/shared/hooks/useMcpApp"
import { parseToolResult } from "@/shared/utils"
import {
  ActionButton,
  InputCard,
  AppLayout,
  MessageCard,
  ResultCard,
  StateSection,
} from "@/shared/components"

import "./App.css"

interface PingCardProps {
  app: McpApp
  toolResult: CallToolResult | null
  hostContext?: McpUiHostContext
}

interface ElicitedResult {
  action: string
  content: {
    apiKey: string
    provider: string
  }
}

interface PingResult {
  elicitedResult: ElicitedResult
  message: string
  ping: string
}

const PingCard = ({ toolResult }: PingCardProps) => {
  const pingData = parseToolResult<PingResult>(toolResult)

  if (!pingData) {
    return (
      <ResultCard title="Ping Result" status="Loading">
        <p className="text-sm text-slate-600">Waiting for the server to respond…</p>
      </ResultCard>
    )
  }

  return (
    <ResultCard title="Ping Result" meta="Response" status="Live">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-medium text-slate-900">{pingData.message}</p>
        {pingData.ping ? <p className="mt-1 text-sm text-slate-600">{pingData.ping}</p> : null}
        {pingData.elicitedResult ? (
          <div className="mt-3 rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-medium text-slate-900">Elicited Result</p>
            <pre className="mt-1 overflow-x-auto text-sm text-slate-600">
              {JSON.stringify(pingData.elicitedResult, null, 2)}
            </pre>
          </div>
        ) : null}
      </div>
    </ResultCard>
  )
}

export default function App() {
  const [pingResult, setPingResult] = useState<CallToolResult | null>(null)
  const [requestError, setRequestError] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)

  const { app, error, hostContext } = useMcpApp({
    appInfo: {
      name: "ping",
      version: "1.0.0",
    },
    onTeardown: async () => {
      console.info("App is being torn down")
      return {}
    },
    onToolInput: async (input: unknown) => {
      console.info("Received tool input:", input)
    },
    onToolResult: async (result) => {
      setPingResult(result)
      setIsSending(false)
      console.info("Received tool call result:", result)
    },
    onToolCancelled: (params) => {
      console.info("Tool call cancelled:", params.reason)
    },
    onError: (err) => {
      console.error(err)
    },
  })

  const sendPing = async () => {
    if (!app) {
      return
    }

    setPingResult(null)
    setRequestError(null)
    setIsSending(true)

    try {
      const result = await app.callServerTool({
        name: "ping",
        arguments: {},
      })

      setPingResult(result)
    } catch (err) {
      setRequestError(err instanceof Error ? err.message : "Failed to ping the server")
    } finally {
      setIsSending(false)
    }
  }

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
      <InputCard title="Ping" description="Send a ping to the server and wait for its response.">
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <ActionButton onClick={() => void sendPing()} isLoading={isSending}>
            {isSending ? "Sending..." : "Send Ping"}
          </ActionButton>
        </div>
      </InputCard>

      {isSending && !pingResult ? (
        <StateSection title="Pinging" message="Waiting for the server to respond…" />
      ) : null}

      {requestError ? (
        <StateSection title="Request Failed" message={requestError} tone="error" />
      ) : null}

      {pingResult ? <PingCard app={app} toolResult={pingResult} hostContext={hostContext} /> : null}
    </AppLayout>
  )
}
