import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Homeowner PWA. Dev server port kept distinct from the portal so both can run at once.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
