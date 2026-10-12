import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messagingService } from '@/services/messagingService';
import { authService } from '@/services/authService';
import { useAuth } from '@/context/AuthContext';
import { Message, User } from '@/types';
import { formatRelativeTime, formatZAR } from '@/utils/formatters';
import { getUserAvatar } from '@/utils/avatar';
import {
  Send,
  MessageSquare,
  ShieldCheck,
  Building2,
  ArrowLeft,
  Loader2,
  Tag,
  CheckCheck,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeUserIdParam = searchParams.get('with');
  const activeUserId = activeUserIdParam ? Number(activeUserIdParam) : null;

  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch conversation threads summary
  const { data: threads = [], isLoading: isLoadingThreads } = useQuery({
    queryKey: ['message-threads'],
    queryFn: messagingService.getThreads,
    refetchInterval: 10000,
  });

  // 2. Fetch partner details if active
  const { data: activePartner } = useQuery<User>({
    queryKey: ['user-detail', activeUserId],
    queryFn: () => authService.getUserDetail(activeUserId!),
    enabled: !!activeUserId,
  });

  // 3. Fetch conversation messages with active user
  const { data: messages = [], isLoading: isLoadingMessages } = useQuery({
    queryKey: ['messages-with', activeUserId],
    queryFn: () => messagingService.getMessagesWithUser(activeUserId!),
    enabled: !!activeUserId,
    refetchInterval: 4000, // Near-realtime polling mandated by prompt
  });

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (text: string) => {
      // Find listing id if available from previous messages
      const relatedListingId = messages.find((m) => m.listing)?.listing || null;
      return messagingService.sendMessage({
        receiver: activeUserId!,
        listing: relatedListingId,
        message_text: text,
      });
    },
    onSuccess: () => {
      setMessageInput('');
      queryClient.invalidateQueries({ queryKey: ['messages-with', activeUserId] });
      queryClient.invalidateQueries({ queryKey: ['message-threads'] });
    },
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeUserId) return;
    sendMessageMutation.mutate(messageInput.trim());
  };

  const selectConversation = (partnerId: number) => {
    setSearchParams({ with: String(partnerId) });
  };

  // Find listing context from thread messages
  const currentListingContext = messages.find((m) => m.listing_title);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 h-[calc(100vh-8rem)]">
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-card h-full grid grid-cols-1 md:grid-cols-12">
        {/* Left Column: Conversation Threads (5 Cols) */}
        <div
          className={`md:col-span-5 lg:col-span-4 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full ${
            activeUserId ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Threads Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-campus-secondary" />
              Campus Messages
            </h2>
            <span className="text-[11px] font-semibold text-slate-500">
              {threads.length} threads
            </span>
          </div>

          {/* Threads List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {isLoadingThreads ? (
              <div className="p-8 text-center text-xs text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-campus-secondary" />
                Loading conversations...
              </div>
            ) : threads.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                <MessageSquare className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
                <p>No active message threads.</p>
                <p className="text-[11px]">Message a seller from the marketplace to begin an exchange.</p>
              </div>
            ) : (
              threads.map((thread) => {
                const partnerId =
                  thread.sender === user?.user_id ? thread.receiver : thread.sender;
                const partnerName =
                  thread.sender === user?.user_id ? thread.receiver_name : thread.sender_name;
                const partnerAvatar =
                  thread.sender === user?.user_id ? thread.receiver_avatar : thread.sender_avatar;
                const isSelected = activeUserId === partnerId;
                const isUnread = !thread.is_read && thread.receiver === user?.user_id;

                return (
                  <button
                    key={thread.message_id}
                    onClick={() => selectConversation(partnerId)}
                    className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors ${
                      isSelected
                        ? 'bg-blue-50/80 dark:bg-blue-950/40'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <img
                      src={getUserAvatar({ avatar_url: partnerAvatar, full_name: partnerName })}
                      alt={partnerName}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className={`text-xs truncate ${isUnread ? 'font-extrabold text-slate-900 dark:text-white' : 'font-semibold text-slate-800 dark:text-slate-200'}`}>
                          {partnerName || 'SPU Student'}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {formatRelativeTime(thread.date_sent)}
                        </span>
                      </div>

                      {thread.listing_title && (
                        <p className="text-[11px] font-bold text-campus-secondary truncate mb-0.5">
                          {thread.listing_title}
                        </p>
                      )}

                      <p className={`text-xs truncate ${isUnread ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                        {thread.sender === user?.user_id ? 'You: ' : ''}
                        {thread.message_text}
                      </p>
                    </div>

                    {isUnread && (
                      <span className="w-2 h-2 rounded-full bg-campus-secondary shrink-0 mt-2" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Conversation (7 Cols) */}
        <div
          className={`md:col-span-7 lg:col-span-8 flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/50 ${
            !activeUserId ? 'hidden md:flex items-center justify-center' : 'flex'
          }`}
        >
          {activeUserId ? (
            <>
              {/* Conversation Header */}
              <div className="p-3.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSearchParams({})}
                    className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  <img
                    src={getUserAvatar({
                      avatar_url: activePartner?.avatar_url,
                      full_name: activePartner?.full_name,
                    })}
                    alt="Active partner"
                    className="w-9 h-9 rounded-full object-cover"
                  />

                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      {activePartner?.full_name || 'SPU Peer'}
                      <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.2 rounded">
                        SPU Student
                      </span>
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      {activePartner?.campus_residence || 'Sol Plaatje University'}
                    </p>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-500">
                  <Building2 className="w-3.5 h-3.5 text-campus-secondary" />
                  <span>Meetup Zone Active</span>
                </div>
              </div>

              {/* Tagged Listing Banner (If Discussion Relates to Item) */}
              {currentListingContext && (
                <div className="bg-blue-50/90 dark:bg-blue-950/60 border-b border-blue-200/60 dark:border-blue-900/60 px-4 py-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <Tag className="w-3.5 h-3.5 text-campus-secondary shrink-0" />
                    <span className="truncate font-medium text-slate-700 dark:text-slate-300">
                      Discussing: <strong>{currentListingContext.listing_title}</strong>
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      (Campus Exchange)
                    </span>
                  </div>
                  {currentListingContext.listing && (
                    <Link
                      to={`/listings/${currentListingContext.listing}`}
                      className="text-[11px] font-bold text-campus-secondary hover:underline shrink-0 ml-2"
                    >
                      View Item
                    </Link>
                  )}
                </div>
              )}

              {/* Messages History List */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {isLoadingMessages ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-campus-secondary" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 text-xs">
                    <p className="font-semibold text-slate-700 dark:text-slate-300">
                      Start your trade proposal
                    </p>
                    <p className="text-[11px] max-w-xs mt-1">
                      Agree on meeting times and specify an SPU Safe Meetup Zone (Central Library, Luka Jantjie, Moroka Res).
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender === user?.user_id;
                    return (
                      <div
                        key={msg.message_id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-sm ${
                            isMe
                              ? 'bg-campus-primary text-white rounded-br-xs'
                              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 rounded-bl-xs'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.message_text}</p>
                        </div>
                        <span className="text-[9px] text-slate-400 mt-1 px-1">
                          {formatRelativeTime(msg.date_sent)}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Message Form */}
              <form
                onSubmit={handleSend}
                className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type a message or propose a swap time..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-campus-secondary"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={!messageInput.trim()}
                  isLoading={sendMessageMutation.isPending}
                  className="rounded-xl px-4 py-2.5 bg-campus-primary"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center p-8 text-slate-400 space-y-2">
              <MessageSquare className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
                Select a Conversation
              </h3>
              <p className="text-xs text-slate-500 max-w-xs">
                Pick a thread on the left or reach out to any seller from their listing card.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
