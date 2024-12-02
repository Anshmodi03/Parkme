import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 2000, // Set the chunk size warning limit to 2000 KB (2 MB)
    rollupOptions: {
      // Optimize dependencies (you can customize this if needed)
      external: [], // List external dependencies if necessary
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules")) {
            // Break apart large libraries if needed
            return "vendor";
          }
        },
      },
    },
  },
  optimizeDeps: {
    // Pre-bundle dependencies if needed
    include: ["react", "react-dom"], // Add any other dependencies you want to include
  },
});
