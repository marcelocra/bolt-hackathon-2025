import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
  server: {
    proxy: {
      "/api/elevenlabs": {
        target: "https://api.elevenlabs.io",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/elevenlabs/, ""),
        headers: {
          Origin: "https://api.elevenlabs.io",
        },
      },
    },
  },
});
