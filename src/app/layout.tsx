import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MBTI Chat App",
  description: "AI-powered MBTI personality chatbot application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body>
        {children}
      </body>
    </html>
  );
}
