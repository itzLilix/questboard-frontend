import React from "react";
import type { IUserBrief } from "../../../../../../types/userCard";
import type { ChatMessage, ReplySnippet } from "../../../../../../types/chat";

function displayNameOf(users: Record<string, IUserBrief>, id: string): string {
    return users[id]?.displayName ?? "неизвестный";
}

export default function ReplyPreview({
    replyTo,
    replyToMessage,
    onJump,
    users,
    deleted,
}: {
    replyTo?: ReplySnippet | undefined;
    replyToMessage?: ChatMessage | undefined;
    onJump?: (id: string) => void;
    users: Record<string, IUserBrief>;
    deleted?: boolean;
}) {
    if (deleted) {
        return (
            <div className="text-left text-base text-(--text-secondary) w-full border-l-2 border-(--border) hover:border-(--accent) pl-3 truncate cursor-pointer transition-colors hover:text-(--accent)">
                <span className="text-(--text-secondary)">Сообщение удалено</span>
            </div>
        );
    }

    if (!replyTo) return null;

    return (
        <button
            type="button"
            onClick={() => onJump?.(replyTo.messageId)}
            className="text-left text-base text-(--text-secondary) w-full border-l-2 border-(--border) hover:border-(--accent) pl-3 truncate cursor-pointer transition-colors hover:text-(--accent)"
        >
            <span className="font-bold flex flex-col gap-1">
                {displayNameOf(users, replyTo.senderId)}
            </span>
            <span className="text-(--text-secondary)">
                {replyToMessage?.body.slice(0, 200) ?? replyTo.contentPreview}
            </span>
        </button>
    );
}
