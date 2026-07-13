type StateSectionProps = {
  title: string
  message: string
  tone?: "default" | "error"
}

type MessageCardProps = {
  children: React.ReactNode
}

export const MessageCard = ({ children }: MessageCardProps) => {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-6">
      <main className="flex flex-col gap-4">{children}</main>
    </div>
  )
}

export const StateSection = ({ title, message, tone = "default" }: StateSectionProps) => {
  return (
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
}
