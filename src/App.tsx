import { useState } from "react"

import { Button, Field, Input } from "@headlessui/react"
import type { App as McpApp, McpUiHostContext } from "@modelcontextprotocol/ext-apps"
import type { CallToolResult } from "@modelcontextprotocol/sdk/types"

import { useMcpApp } from "@/hooks"

import "@/App.css"

interface WeatherCardProps {
  app: McpApp
  toolResult: CallToolResult | null
  hostContext?: McpUiHostContext
}

interface WeatherDailyData {
  time: string[]
  temperature_2m_min: number[]
  temperature_2m_max: number[]
  weather_code: number[]
  precipitation_probability_max: number[]
  rain_sum: number[]
  precipitation_hours: number[]
  wind_speed_10m_max: number[]
  wind_gusts_10m_max: number[]
}

interface WeatherData {
  daily: WeatherDailyData
}

function parseWeatherData(result: CallToolResult | null): WeatherData | null {
  if (!result) {
    return null
  }

  const structuredContent = (result as CallToolResult & { structuredContent?: WeatherData })
    .structuredContent

  if (structuredContent && typeof structuredContent === "object") {
    return structuredContent
  }

  const textPayload = result.content.find((item) => item.type === "text")?.text

  if (!textPayload) {
    return null
  }

  try {
    return JSON.parse(textPayload) as WeatherData
  } catch {
    return null
  }
}

const WeatherCard = ({ toolResult }: WeatherCardProps) => {
  const weatherData = parseWeatherData(toolResult)
  const daily = weatherData?.daily
  const hasForecast = Boolean(daily?.time?.length)

  if (!daily || !hasForecast) {
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
            Next 7 Days
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">Weather Forecast</h2>
        </div>
        <div className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600">
          Live
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {daily.time.slice(0, 7).map((date, index) => (
          <article className="rounded-xl border border-slate-200 bg-slate-50 p-4" key={date}>
            <div className="text-sm font-semibold text-slate-900">{date}</div>
            <div className="mt-2 text-lg font-semibold text-slate-900">
              {daily.temperature_2m_min[index]}°C ~ {daily.temperature_2m_max[index]}°C
            </div>
            <div className="mt-3 space-y-1 text-sm text-slate-600">
              <div className="flex items-center justify-between gap-3">
                <span>Weather Code</span>
                <strong className="font-medium text-slate-900">{daily.weather_code[index]}</strong>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Rain Probability</span>
                <strong className="font-medium text-slate-900">
                  {daily.precipitation_probability_max[index]}%
                </strong>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Rainfall</span>
                <strong className="font-medium text-slate-900">{daily.rain_sum[index]} mm</strong>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Rain Duration</span>
                <strong className="font-medium text-slate-900">{daily.precipitation_hours[index]} h</strong>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Max Wind Speed</span>
                <strong className="font-medium text-slate-900">
                  {daily.wind_speed_10m_max[index]} km/h
                </strong>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Max Gusts</span>
                <strong className="font-medium text-slate-900">
                  {daily.wind_gusts_10m_max[index]} km/h
                </strong>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function App() {
  const [locationInput, setLocationInput] = useState("")
  const [requestedLocation, setRequestedLocation] = useState<string | null>(null)
  const [weatherResult, setWeatherResult] = useState<CallToolResult | null>(null)
  const [requestError, setRequestError] = useState<string | null>(null)
  const [isQuerying, setIsQuerying] = useState(false)

  const { app, error, hostContext } = useMcpApp({
    appInfo: {
      name: "get-weather",
      version: "1.0.0",
    },
    onTeardown: async () => {
      console.info("App is being torn down")
      return {}
    },
    onToolInput: async (input: unknown) => {
      const nextLocation = (() => {
        if (typeof input === "string") {
          return input.trim()
        }

        if (typeof input === "object" && input !== null) {
          const maybeInput = input as {
            location?: unknown
            arguments?: { location?: unknown }
          }

          if (typeof maybeInput.location === "string") {
            return maybeInput.location.trim()
          }

          if (typeof maybeInput.arguments?.location === "string") {
            return maybeInput.arguments.location.trim()
          }
        }

        return null
      })()

      if (nextLocation) {
        void searchWeather(nextLocation)
      }
    },
    onToolResult: async (result) => {
      console.info("Received tool call result:", result)
      setWeatherResult(result)
      setIsQuerying(false)
    },
    onToolCancelled: (params) => {
      console.info("Tool call cancelled:", params.reason)
    },
    onError: (err) => {
      console.error(err)
    },
  })

  const searchWeather = async (nextLocation: string) => {
    if (!app) {
      return
    }

    const trimmedLocation = nextLocation.trim()

    if (!trimmedLocation) {
      setRequestError("Please enter a location")
      return
    }

    setLocationInput(trimmedLocation)
    setRequestedLocation(trimmedLocation)
    setWeatherResult(null)
    setRequestError(null)
    setIsQuerying(true)

    try {
      const result = await app.callServerTool({
        name: "weather",
        arguments: {
          location: trimmedLocation,
        },
      })

      setWeatherResult(result)
      setIsQuerying(false)
    } catch (err) {
      setRequestError(err instanceof Error ? err.message : "Failed to fetch weather information")
      setIsQuerying(false)
    }
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void searchWeather(locationInput)
  }

  const renderState = (title: string, message: string, tone: "default" | "error" = "default") => (
    <section
      className={`rounded-2xl border p-6 shadow-sm ${
        tone === "error" ? "border-rose-200 bg-rose-50" : "border-slate-200 bg-white"
      }`}
    >
      <div className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600">
        {tone === "error" ? "Error" : "Waiting for Input"}
      </div>
      <h2 className="mt-3 text-xl font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm text-slate-600">{message}</p>
    </section>
  )

  if (error) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-6">
        <main className="flex flex-1 items-center justify-center">
          {renderState("Connection Failed", error.message, "error")}
        </main>
      </div>
    )
  }

  if (!app) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-6">
        <main className="flex flex-1 items-center justify-center">
          {renderState("Connecting", "Establishing connection with the host…")}
        </main>
      </div>
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

          <form className="mt-5 flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
            <Field className="flex-1">
              <Input
                value={locationInput}
                onChange={(event) => setLocationInput(event.target.value)}
                placeholder="e.g. Beijing, Shanghai, Tokyo"
                aria-label="Enter a location"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-400"
              />
            </Field>
            <Button
              type="submit"
              disabled={isQuerying}
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isQuerying ? "Searching..." : "Search Weather"}
            </Button>
          </form>
        </section>

        {isQuerying && !weatherResult
          ? renderState(
              "Searching",
              requestedLocation
                ? `Searching the weather for ${requestedLocation}…`
                : "Enter a location to get started",
            )
          : null}

        {requestError ? renderState("Request Failed", requestError, "error") : null}

        {weatherResult ? (
          <WeatherCard app={app} toolResult={weatherResult} hostContext={hostContext} />
        ) : null}
      </main>
    </div>
  )
}

export default App
