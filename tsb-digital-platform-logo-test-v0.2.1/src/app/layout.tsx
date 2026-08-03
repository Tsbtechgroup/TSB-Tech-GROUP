import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TSB Tech Group",
  description: "Une seule vision, des solutions illimitées.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><body>{children}</body></html>;
}
