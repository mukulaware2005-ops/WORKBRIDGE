
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Send,
  Paperclip,
  Phone,
  Video,
  MoreVertical,
  Image as ImageIcon,
  ClipboardList,
  XCircle,
} from 'lucide-react';

import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import * as messageService from '../../services/messageService';
import { EmptyState, ListSkeleton } from '../../components/common/States';
import { cn } from '../../utils/cn';

export default function Messages() {
  useDocumentTitle('Messages');

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState('');
  const [ending, setEnding] = useState(false);

  const scrollRef = useRef(null);

  // Get current logged-in user ID
  const getCurrentUserId = () => {
    const token = localStorage.getItem('workbridge_access_token');

    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Number(payload.user_id);
    } catch {
      return null;
    }
  };

  // Get the other person in the conversation
  const getOtherUserName = (conversation) => {
    if (!conversation) return '';

    const currentUserId = getCurrentUserId();

    if (Number(conversation.customer) === currentUserId) {
      return conversation.worker_name;
    }

    return conversation.customer_name;
  };

  // Load conversations
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const data = await messageService.listConversations();

        setConversations(
          data.map((conversation) => ({
            ...conversation,
            thread: [],
          }))
        );

        if (data.length > 0) {
          setActiveId(data[0].id);
        }
      } catch (error) {
        console.error('Failed to load conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, []);

  // Load messages when conversation changes
  useEffect(() => {
    if (!activeId) return;

    const loadMessages = async () => {
      setMessagesLoading(true);

      try {
        const data = await messageService.listMessages(activeId);

        setConversations((prev) =>
          prev.map((conversation) =>
            conversation.id === activeId
              ? {
                  ...conversation,
                  thread: data,
                }
              : conversation
          )
        );
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        setMessagesLoading(false);
      }
    };

    loadMessages();
  }, [activeId]);

  // Scroll to bottom
  useEffect(() => {
    if (!messagesLoading && scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [activeId, conversations, messagesLoading]);

  const active = conversations.find((c) => c.id === activeId);

  const filtered = conversations.filter((c) =>
    getOtherUserName(c)
      ?.toLowerCase()
      .includes(query.toLowerCase())
  );

  // End conversation
  const endConversation = async () => {
    if (!active || ending) return;

    const confirmed = window.confirm(
      'Are you sure you want to end this conversation? You will not be able to send new messages afterward.'
    );

    if (!confirmed) return;

    try {
      setEnding(true);

      await messageService.endConversation(active.id);

      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === active.id
            ? {
                ...conversation,
                status: 'ended',
              }
            : conversation
        )
      );
    } catch (error) {
      console.error('Failed to end conversation:', error);
      alert('Failed to end conversation. Please try again.');
    } finally {
      setEnding(false);
    }
  };

  // Send message
  const send = async () => {
    if (
      !draft.trim() ||
      !active ||
      active.status !== 'active'
    ) {
      return;
    }

    try {
      const message = await messageService.sendMessage(
        active.id,
        draft.trim()
      );

      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === active.id
            ? {
                ...conversation,
                thread: [
                  ...(conversation.thread || []),
                  message,
                ],
                last_message: {
                  id: message.id,
                  text: message.text,
                  sender: message.sender,
                  created_at: message.created_at,
                },
              }
            : conversation
        )
      );

      setDraft('');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert(error.message || 'Failed to send message.');
    }
  };

  const getMessageTime = (message) => {
    if (!message?.created_at) return '';

    return new Date(message.created_at).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="section py-10">
        <ListSkeleton count={4} />
      </div>
    );
  }

  return (
    <div className="section py-8">
      <h1 className="text-2xl font-extrabold text-navy-900 dark:text-white mb-6">
        Messages
      </h1>

      <div className="card grid md:grid-cols-[300px_1fr] h-[70vh] overflow-hidden">

        {/* Conversation List */}
        <div className="border-r border-navy-100 dark:border-navy-800 flex flex-col">

          <div className="p-3 border-b border-navy-100 dark:border-navy-800">
            <div className="flex items-center gap-2 bg-navy-50 dark:bg-navy-800 rounded-xl px-3 py-2">
              <Search className="h-4 w-4 text-navy-400" />

              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search conversations"
                className="bg-transparent outline-none text-sm w-full placeholder:text-navy-400"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">

            {filtered.length === 0 ? (
              <EmptyState title="No conversations found" />
            ) : (
              filtered.map((conversation) => {
                const otherUser =
                  getOtherUserName(conversation);

                const lastMessage =
                  conversation.thread?.length > 0
                    ? conversation.thread[
                        conversation.thread.length - 1
                      ]
                    : conversation.last_message;

                return (
                  <button
                    key={conversation.id}
                    onClick={() =>
                      setActiveId(conversation.id)
                    }
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 text-left border-b border-navy-50 dark:border-navy-800/50 transition-colors',
                      activeId === conversation.id
                        ? 'bg-primary-50 dark:bg-primary-900/20'
                        : 'hover:bg-navy-50 dark:hover:bg-navy-800/50'
                    )}
                  >

                    <div className="relative shrink-0">
                      <div className="h-11 w-11 rounded-full bg-navy-100 dark:bg-navy-800 flex items-center justify-center text-sm font-bold text-navy-600 dark:text-navy-200">
                        {(otherUser || '')
                          .split(' ')
                          .map((s) => s[0])
                          .slice(0, 2)
                          .join('')}
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">

                      <div className="flex items-center justify-between">

                        <p className="text-sm font-semibold text-navy-900 dark:text-white truncate">
                          {otherUser}
                        </p>

                        <span className="text-[11px] text-navy-400 shrink-0">
                          {lastMessage
                            ? getMessageTime(lastMessage)
                            : ''}
                        </span>

                      </div>

                      <p className="text-xs text-navy-400 truncate">
                        {lastMessage
                          ? lastMessage.text
                          : 'No messages yet'}
                      </p>

                    </div>

                  </button>
                );
              })
            )}

          </div>
        </div>

        {/* Chat Area */}
        <div className="flex flex-col">

          {active ? (
            <>

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-navy-100 dark:border-navy-800">

                <div className="flex items-center gap-3">

                  <div className="h-9 w-9 rounded-full bg-navy-100 dark:bg-navy-800 flex items-center justify-center text-xs font-bold text-navy-600 dark:text-navy-200">
                    {(getOtherUserName(active) || '')
                      .split(' ')
                      .map((s) => s[0])
                      .slice(0, 2)
                      .join('')}
                  </div>

                  <div>

                    <p className="text-sm font-semibold text-navy-900 dark:text-white">
                      {getOtherUserName(active)}
                    </p>

                    <p className="text-xs text-navy-400">
                      {active.status === 'active'
                        ? 'Active'
                        : 'Conversation ended'}
                    </p>

                  </div>

                </div>

                <div className="flex items-center gap-1">

                  <button
                    className="btn-ghost h-9 w-9 p-0"
                    aria-label="Call"
                  >
                    <Phone className="h-4 w-4" />
                  </button>

                  <button
                    className="btn-ghost h-9 w-9 p-0"
                    aria-label="Video call"
                  >
                    <Video className="h-4 w-4" />
                  </button>

                  {active.status === 'active' && (
                    <button
                      onClick={endConversation}
                      disabled={ending}
                      className="btn-ghost h-9 w-9 p-0"
                      aria-label="End conversation"
                      title="End conversation"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  )}

                  <button
                    className="btn-ghost h-9 w-9 p-0"
                    aria-label="More options"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>

                </div>

              </div>

              {/* Messages */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-5 space-y-3 bg-navy-50/40 dark:bg-navy-950/40"
              >

                <div className="flex justify-center">
                  <Link
                    to={`/workers/${active.worker}`}
                    className="btn-outline px-3 py-1.5 text-xs bg-white dark:bg-navy-900"
                  >
                    <ClipboardList className="h-3.5 w-3.5" />
                    Request Service
                  </Link>
                </div>

                {messagesLoading ? (
                  <div className="text-center text-sm text-navy-400 py-10">
                    Loading messages...
                  </div>
                ) : active.thread?.length === 0 ? (
                  <div className="text-center text-sm text-navy-400 py-10">
                    No messages yet. Start the conversation.
                  </div>
                ) : (
                  active.thread.map((message, index) => {

                    const currentUserId =
                      getCurrentUserId();

                    const isMine =
                      Number(message.sender) ===
                      currentUserId;

                    return (
                      <div
                        key={message.id || index}
                        className={cn(
                          'flex',
                          isMine
                            ? 'justify-end'
                            : 'justify-start'
                        )}
                      >

                        <div
                          className={cn(
                            'max-w-[70%] rounded-2xl px-4 py-2.5 text-sm',
                            isMine
                              ? 'bg-primary-600 text-white rounded-br-sm'
                              : 'bg-white dark:bg-navy-800 text-navy-700 dark:text-navy-100 rounded-bl-sm shadow-soft'
                          )}
                        >

                          {message.text}

                          <div
                            className={cn(
                              'text-[10px] mt-1',
                              isMine
                                ? 'text-primary-100'
                                : 'text-navy-400'
                            )}
                          >
                            {getMessageTime(message)}
                          </div>

                        </div>

                      </div>
                    );
                  })
                )}

              </div>

              {/* Message Input */}
              <div className="p-3 border-t border-navy-100 dark:border-navy-800 flex items-center gap-2">

                <button
                  className="btn-ghost h-9 w-9 p-0"
                  aria-label="Attach file"
                >
                  <Paperclip className="h-4 w-4" />
                </button>

                <button
                  className="btn-ghost h-9 w-9 p-0"
                  aria-label="Attach image"
                >
                  <ImageIcon className="h-4 w-4" />
                </button>

                <input
                  value={draft}
                  onChange={(e) =>
                    setDraft(e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (
                      e.key === 'Enter' &&
                      !e.shiftKey
                    ) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  disabled={active.status !== 'active'}
                  placeholder={
                    active.status === 'active'
                      ? 'Type a message…'
                      : 'Conversation ended'
                  }
                  className="input flex-1"
                />

                <button
                  onClick={send}
                  disabled={
                    active.status !== 'active' ||
                    !draft.trim()
                  }
                  className="btn-primary h-9 w-9 p-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>

              </div>

            </>
          ) : (
            <EmptyState title="Select a conversation" />
          )}

        </div>
      </div>
    </div>
  );
}
