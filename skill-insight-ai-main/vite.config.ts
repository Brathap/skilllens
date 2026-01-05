import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",  // You can use "localhost" instead of "::" if you don't need IPv6 support
    port: 5173,  // Changed to default Vite port
  },
  plugins: [
    react(),  // React plugin for Vite
    mode === "development" && componentTagger()  // Add componentTagger only in development
  ].filter(Boolean),  // Filters out any falsy values (like `undefined` in production)
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),  // Alias for easier imports from the src folder
    },
  },
}));
