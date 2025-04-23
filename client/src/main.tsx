import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./i18n"; // Importar configuración i18n

createRoot(document.getElementById("root")!).render(<App />);
