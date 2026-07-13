import { build } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { viteSingleFile } from "vite-plugin-singlefile"
import { readdirSync } from "node:fs"

const apps = readdirSync("src/apps", { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)

for (const app of apps) {
  await build({
    root: `src/apps/${app}`,
    plugins: [react(), tailwindcss(), viteSingleFile()],
    build: {
      outDir: `../../../dist/${app}`,
      emptyOutDir: false,
    },
  })
}
