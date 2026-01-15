import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  plugins: [react()],
  optimizeDeps: {
    include: ["@emotion/styled"],
  },
  server: {
    // proxy: {
    //   "/data": {
    //     target: "http://localhost:5001",
    //     changeOrigin: true,
    //     secure: false,
    //   },
    // },
    proxy: {
      "/api": "https://lv6.rhinogfx.com:5001",
    },
  },
});
