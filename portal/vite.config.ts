import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Developer portal. Port kept distinct from the homeowner app so both run at once.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
  },
});
