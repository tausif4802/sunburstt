import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conversations",
  description: "Chat interface for managing conversations",
};

export default function ConversationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
