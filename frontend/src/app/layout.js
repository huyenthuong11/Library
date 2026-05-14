"use client";

import AuthProvider from "../context/AuthContext";
import "../app/globals.css";

export default function RootLayout({children}) {
  return (
    <html lang="vi">
      <body>
          <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}