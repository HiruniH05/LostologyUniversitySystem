// src/components/ChatInbox.tsx
import { useInbox } from "../hooks/useInbox";
import { useAuth } from "../AuthContext";

export default function ChatInbox({ onSelectConversation }: { onSelectConversation: (c: any) => void }) {
  const conversations = useInbox();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="flex flex-col space-y-2">
      {conversations.length === 0 ? (
        <p className="text-gray-500">No conversations yet</p>
      ) : (
        conversations.map((c) => {
          const unreadCount = c.unread?.[user.uid] || 0;
          return (
            <div
              key={c.id}
              className="p-3 border rounded-lg cursor-pointer hover:bg-gray-100 flex justify-between items-center"
              onClick={() => onSelectConversation(c)}
            >
              <div>
                <p className="font-semibold text-gray-800 truncate">
                  {c.lastMessage || "New conversation"}
                </p>
                <div className="text-sm text-gray-600">
                  {c.lastMessageAt?.seconds &&
                    new Date(c.lastMessageAt.seconds * 1000).toLocaleString()}
                </div>
              </div>

              {unreadCount > 0 && (
                <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs">
                  {unreadCount}
                </span>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
