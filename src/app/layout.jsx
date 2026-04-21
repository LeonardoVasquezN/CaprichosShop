import "./globals.css";
import { Providers } from "./providers";
import { GlobalDataProvider } from "@/components/GlobalDataContext";
import ClientLayout from "./ClientLayout";
import '@/styles/print.css';

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <Providers>
          <GlobalDataProvider>
            <ClientLayout>{children}</ClientLayout>
          </GlobalDataProvider>
        </Providers>
      </body>
    </html>
  );
}