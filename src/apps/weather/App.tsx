import { useState } from "react"

import { Button, Input } from "@headlessui/react"

import type { App as McpApp, McpUiHostContext } from "@modelcontextprotocol/ext-apps"
import type { CallToolResult } from "@modelcontextprotocol/sdk/types"

import { useMcpApp } from "@/shared/hooks/useMcpApp"
import { parseToolResult } from "@/shared/utils"
import { MessageCard, StateSection } from "@/shared/components"

import "./App.css"

interface WeatherCardProps {
  app: McpApp
  toolResult: CallToolResult | null
  hostContext?: McpUiHostContext
}

interface WeatherInfo {
  code: number
  text: string
  text_zh: string
  icon: string
}

interface TemperatureInfo {
  min: number
  max: number
  unit: string
}

interface RainInfo {
  probability: number
  hours: number
  sum: number
  unit: string
}

interface WindInfo {
  speed: number
  gust: number
  unit: string
}

interface ForecastDay {
  date: string
  weather: WeatherInfo
  temperature: TemperatureInfo
  rain: RainInfo
  wind: WindInfo
}

interface WeatherResult {
  timezone: string
  elevation: number
  forecast: ForecastDay[]
}

const WeatherCard = ({ toolResult }: WeatherCardProps) => {
  const weatherData = parseToolResult<WeatherResult>(toolResult)
  const forecast = weatherData?.forecast
  const hasForecast = Boolean(forecast?.length)

  if (!forecast || !hasForecast) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600">
          Loading
        </div>
        <h2 className="mt-3 text-xl font-semibold text-slate-900">Weather Forecast</h2>
        <p className="mt-2 text-sm text-slate-600">
          Fetching the latest weather information from the server…
        </p>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            {weatherData?.timezone ?? "Local"} · {weatherData?.elevation ?? 0} m
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">Weather Forecast</h2>
        </div>
        <div className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600">
          Live
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {forecast.slice(0, 7).map((day) => (
          <article className="rounded-xl border border-slate-200 bg-slate-50 p-4" key={day.date}>
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-slate-900">{day.date}</div>
              <div className="text-2xl leading-none">{day.weather.icon}</div>
            </div>
            <div className="mt-2 text-lg font-semibold text-slate-900">
              {day.temperature.min}°C ~ {day.temperature.max}°C
            </div>
            <div className="mt-1 text-sm text-slate-600">{day.weather.text_zh}</div>
            <div className="mt-3 space-y-1 text-sm text-slate-600">
              <div className="flex items-center justify-between gap-3">
                <span>Rain Probability</span>
                <strong className="font-medium text-slate-900">{day.rain.probability}%</strong>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Rainfall</span>
                <strong className="font-medium text-slate-900">
                  {day.rain.sum} {day.rain.unit}
                </strong>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Rain Duration</span>
                <strong className="font-medium text-slate-900">{day.rain.hours} h</strong>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Max Wind Speed</span>
                <strong className="font-medium text-slate-900">
                  {day.wind.speed} {day.wind.unit}
                </strong>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Max Gusts</span>
                <strong className="font-medium text-slate-900">
                  {day.wind.gust} {day.wind.unit}
                </strong>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default function App() {
  const [location, setLocation] = useState("")
  const [result, setResult] = useState<CallToolResult | null>(null)
  const [requestError, setRequestError] = useState<string | null>(null)
  const [isQuerying, setIsQuerying] = useState(false)

  const { app, error, hostContext } = useMcpApp({
    appInfo: {
      name: "weather",
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
      console.info("Received tool call result:", result)
      setResult(result)
      setIsQuerying(false)
    },
    onToolCancelled: (params) => {
      console.info("Tool call cancelled:", params.reason)
    },
    onError: (err) => {
      console.error(err)
    },
  })

  const searchWeather = async () => {
    if (!app) return

    setResult(null)
    setRequestError(null)
    setIsQuerying(true)

    try {
      const result = await app.callServerTool({
        name: "weather",
        arguments: {
          location: location.trim(),
        },
      })

      setResult(result)
      setIsQuerying(false)
    } catch (err) {
      setRequestError(err instanceof Error ? err.message : "Failed to fetch weather information")
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
          <h2 className="mt-3 text-xl font-semibold text-slate-900">Weather Lookup</h2>
          <p className="mt-2 text-sm text-slate-600">
            Enter a location and I will look up the weather forecast for you.
          </p>

          <form
            className="mt-5 flex flex-col gap-3 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault()
              void searchWeather()
            }}
          >
            <Input
              required
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="e.g. Beijing, Shanghai, Tokyo"
              aria-label="Enter a location"
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-400"
            />
            <Button
              type="submit"
              disabled={isQuerying}
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isQuerying ? "Searching..." : "Search Weather"}
            </Button>
          </form>
        </section>

        {isQuerying && !result ? (
          <StateSection title="Searching" message="Fetching the weather forecast…" />
        ) : null}

        {requestError ? (
          <StateSection title="Request Failed" message={requestError} tone="error" />
        ) : null}

        {result ? <WeatherCard app={app} toolResult={result} hostContext={hostContext} /> : null}
      </main>
    </div>
  )
}
