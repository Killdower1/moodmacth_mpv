import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import MessagesList from "@/components/MessagesList";
import SendMessageForm from "@/components/SendMessageForm";

export const dynamic = 'force-dynamic';

export default async function ChatPage({ params }: { params: { matchId: string } }) {
    const session = await requireSession();
    const me = await prisma.user.findUnique({ where: { email: session.user!.email! } });
    if (!me) throw new Error('User not found');

    return (
        <div className="card">
            <h2>Chat</h2>
            <MessagesList matchId={params.matchId} meId={me.id} />
            <SendMessageForm matchId={params.matchId} />
        </div>
    );
}