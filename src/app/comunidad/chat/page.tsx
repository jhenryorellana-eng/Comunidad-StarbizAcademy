import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isMember } from "@/lib/auth";
import { getDict } from "@/lib/i18n/server";
import { SpaceHeader } from "@/components/community/SpaceHeader";
import { ChatRoom } from "@/components/community/ChatRoom";
import { LinkButton } from "@/components/ui";
import { Icon } from "@/components/icons";

export default async function ChatPage() {
  const { dict } = await getDict();
  const user = await getCurrentUser();

  if (!isMember(user?.role)) {
    return (
      <div>
        <SpaceHeader icon="chat" title={dict.community.chat.title} />
        <div className="flex flex-col items-center rounded-2xl border border-surface-line bg-paper px-6 py-20 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cream-200 text-navy">
            <Icon name="lock" size={30} />
          </span>
          <h2 className="mt-5 text-xl font-bold text-navy">
            {dict.community.gatedTitle}
          </h2>
          <p className="mt-2 max-w-sm text-sm text-muted">{dict.community.gatedBody}</p>
          <div className="mt-6 flex gap-3">
            <LinkButton href="/signup">{dict.community.becomeMember}</LinkButton>
            <LinkButton href="/login" variant="outline">
              {dict.common.login}
            </LinkButton>
          </div>
        </div>
      </div>
    );
  }

  const channels = await prisma.channel.findMany({ orderBy: { position: "asc" } });

  return (
    <div>
      <SpaceHeader icon="chat" title={dict.community.chat.title} />
      <ChatRoom
        channels={channels.map((c) => ({
          id: c.id,
          slug: c.slug,
          name: c.name,
          description: c.description,
        }))}
        currentUser={{ id: user!.id, name: user!.name }}
      />
    </div>
  );
}
