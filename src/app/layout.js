import localFont from "next/font/local";
import "./globals.css";
import Auth from "@/auth/Auth";
import { AppLayout } from "@/layout/MainApp";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Payroll Protocol",
  description: "Hackathon",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
       <Auth>
          <AppLayout>{children}</AppLayout>
        </Auth>
      </body>
    </html>
  );
}
