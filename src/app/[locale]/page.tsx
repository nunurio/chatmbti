import { Chat } from "@/components/chat/Chat";
import { setRequestLocale } from 'next-intl/server';

export default async function Page({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Enable static rendering
  setRequestLocale(locale);

  return <Chat />;
}