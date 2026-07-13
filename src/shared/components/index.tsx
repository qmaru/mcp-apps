import { Button } from "@headlessui/react"

type StateSectionProps = {
  title: string
  message: string
  tone?: "default" | "error"
}

type MessageCardProps = {
  children: React.ReactNode
}

type AppLayoutProps = {
  children: React.ReactNode
}

type CardProps = {
  children: React.ReactNode
  className?: string
}

type InputCardProps = {
  title: string
  description: string
  children?: React.ReactNode
}

type ResultCardProps = {
  title: string
  children: React.ReactNode
  meta?: React.ReactNode
  status?: string
}

type ActionButtonProps = {
  children: React.ReactNode
  onClick: () => void
  isLoading?: boolean
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-6">
      <main className="flex flex-col gap-4">{children}</main>
    </div>
  )
}

export const Card = ({ children, className = "" }: CardProps) => {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>
      {children}
    </section>
  )
}

export const InputCard = ({ title, description, children }: InputCardProps) => {
  return (
    <Card>
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
      {children}
    </Card>
  )
}

export const ResultCard = ({ title, children, meta, status }: ResultCardProps) => {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          {meta ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              {meta}
            </p>
          ) : null}
          <h2 className={`${meta ? "mt-1" : ""} text-xl font-semibold text-slate-900`}>{title}</h2>
        </div>
        {status ? (
          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600">
            {status}
          </span>
        ) : null}
      </div>
      <div className="mt-5">{children}</div>
    </Card>
  )
}

export const ActionButton = ({ children, onClick, isLoading = false }: ActionButtonProps) => {
  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
    >
      {children}
    </Button>
  )
}

export const MessageCard = ({ children }: MessageCardProps) => {
  return <AppLayout>{children}</AppLayout>
}

export const StateSection = ({ title, message, tone = "default" }: StateSectionProps) => {
  return (
    <Card className={tone === "error" ? "border-rose-200 bg-rose-50" : ""}>
      <div className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600">
        {tone === "error" ? "Error" : "Waiting for Input"}
      </div>

      <h2 className="mt-3 text-xl font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm text-slate-600">{message}</p>
    </Card>
  )
}
