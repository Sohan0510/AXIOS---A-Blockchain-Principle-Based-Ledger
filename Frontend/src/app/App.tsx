import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "./lib/auth";
import { ThemeProvider } from "./lib/theme";
import { Toaster } from "sonner";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "var(--card)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
              fontSize: "13px",
            },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}
