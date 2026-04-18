import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { AuthModalProvider } from "./features/auth/AuthModalContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./api/queryClient.ts";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<BrowserRouter>
			<QueryClientProvider client={queryClient}>
				<AuthModalProvider>
					<App />
				</AuthModalProvider>
			</QueryClientProvider>
		</BrowserRouter>
	</StrictMode>,
);
