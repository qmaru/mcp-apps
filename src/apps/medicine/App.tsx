import { useState } from "react"

import { Button, Input } from "@headlessui/react"

import type { App as McpApp, McpUiHostContext } from "@modelcontextprotocol/ext-apps"
import type { CallToolResult } from "@modelcontextprotocol/sdk/types"
import ReactMarkdown from "react-markdown"

import { MessageCard, StateSection } from "@/shared/components"
import { useMcpApp } from "@/shared/hooks/useMcpApp"
import { parseToolResult } from "@/shared/utils"

import "./App.css"

interface MedicineCardProps {
  app: McpApp
  toolResult: CallToolResult | null
  hostContext?: McpUiHostContext
}

const MedicineCard = ({ toolResult }: MedicineCardProps) => {
  const medicineText = parseToolResult<string>(toolResult)

  if (!medicineText) {
    return <div>No data</div>
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mt-3 text-xl font-semibold text-slate-900">Medicine Result</h2>
      <div className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">
        <ReactMarkdown>{medicineText}</ReactMarkdown>
      </div>
    </section>
  )
}

export default function App() {
  const [keyword, setKeyword] = useState("")
  const [result, setResult] = useState<CallToolResult | null>(null)
  const [requestError, setRequestError] = useState<string | null>(null)
  const [isQuerying, setIsQuerying] = useState(false)

  const { app, error, hostContext } = useMcpApp({
    appInfo: {
      name: "medicine",
      version: "1.0.0",
    },
    onToolResult: async (toolResult) => {
      console.info("Received tool result:", toolResult)
      setResult(toolResult)
      setIsQuerying(false)
    },
    onToolCancelled: (params) => {
      console.info("Tool call cancelled:", params.reason)
    },
    onError: (err) => {
      console.error(err)
    },
  })

  const searchMedicine = async () => {
    if (!app) return

    setResult(null)
    setRequestError(null)
    setIsQuerying(true)

    try {
      const result = await app.callServerTool({
        name: "medicine",
        arguments: {
          keyword: keyword.trim(),
        },
      })

      setResult(result)
      setIsQuerying(false)
    } catch (err) {
      setRequestError(err instanceof Error ? err.message : "Failed to fetch medicine information")
      setIsQuerying(false)
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
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-6">
      <main className="flex flex-col gap-4">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600">
            Waiting for Input
          </div>
          <h2 className="mt-3 text-xl font-semibold text-slate-900">Medicine</h2>
          <p className="mt-2 text-sm text-slate-600">Enter a medicine name to look up its information.</p>

          <form
            className="mt-5 flex flex-col gap-3 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault()
              void searchMedicine()
            }}
          >
            <Input
              required
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="e.g. Aspirin, Paracetamol, Ibuprofen"
              aria-label="Enter a medicine name"
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-400"
            />
            <Button
              type="submit"
              disabled={isQuerying}
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isQuerying ? "Searching..." : "Search Medicine"}
            </Button>
          </form>
        </section>

        {isQuerying && !result ? (
          <StateSection title="Searching" message="Fetching medicine information…" />
        ) : null}

        {requestError ? (
          <StateSection title="Request Failed" message={requestError} tone="error" />
        ) : null}

        {result ? <MedicineCard app={app} toolResult={result} hostContext={hostContext} /> : null}
      </main>
    </div>
  )
}
