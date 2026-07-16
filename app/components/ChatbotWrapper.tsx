"use client";

import dynamic from "next/dynamic";
const DynamicChatbot = dynamic(() => import("./Chatbot"), { ssr: false });

export function ChatbotWrapper() {
    return <DynamicChatbot />;
}
