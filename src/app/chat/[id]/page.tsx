
import dynamic from "next/dynamic";

const ChatClient = dynamic(() => import("./room-client"), { ssr: false });

export default function ChatPage({ params }: { params: { id: string } }) {
  return (
    <main className="min-h-screen bg-[#0b0f14]">
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-10">
        <ChatClient idParam={params.id} />
      </div>
    </main>
  );
}
