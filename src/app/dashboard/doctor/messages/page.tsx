'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Send,
    Search,
    MessageCircle,
    Sparkles,
    User,
    Phone,
    Video,
    MoreVertical,
    Check,
    CheckCheck,
    Clock
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/lib/supabase/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

export default function DoctorMessagesPage() {
    const { user } = useAuth();
    const [conversations, setConversations] = React.useState<any[]>([]);
    const [messages, setMessages] = React.useState<any[]>([]);
    const [selectedConversation, setSelectedConversation] = React.useState<any>(null);
    const [newMessage, setNewMessage] = React.useState('');
    const [loading, setLoading] = React.useState(true);
    const [searchQuery, setSearchQuery] = React.useState('');
    const messagesEndRef = React.useRef<HTMLDivElement>(null);

    // Fetch conversations
    React.useEffect(() => {
        if (!user) return;

        const fetchConversations = async () => {
            const { data, error } = await supabase
                .from('conversations')
                .select(`
                    *,
                    participant1:participant1_id(full_name, id),
                    participant2:participant2_id(full_name, id)
                `)
                .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
                .order('last_message_at', { ascending: false });

            if (error) console.error('Error fetching conversations:', error);
            else setConversations(data || []);
            setLoading(false);
        };

        fetchConversations();

        const channel = supabase
            .channel('conversations_channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, () => {
                fetchConversations();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    // Fetch messages when conversation selected
    React.useEffect(() => {
        if (!selectedConversation) return;

        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', selectedConversation.id)
                .order('created_at', { ascending: true });

            if (error) console.error('Error fetching messages:', error);
            else setMessages(data || []);
        };

        fetchMessages();

        const channel = supabase
            .channel(`messages:${selectedConversation.id}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `conversation_id=eq.${selectedConversation.id}`
            }, (payload) => {
                setMessages(prev => [...prev, payload.new]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [selectedConversation]);

    // Scroll to bottom
    React.useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Handle query params for deep linking
    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const conversationId = params.get('conversationId');
        if (conversationId && conversations.length > 0) {
            const linkedConv = conversations.find(c => c.id === conversationId);
            if (linkedConv) {
                setSelectedConversation(linkedConv);
            }
        }
    }, [conversations]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation || !user) return;

        const messageContent = newMessage.trim();
        const temporaryId = crypto.randomUUID();
        const newMsgObj = {
            id: temporaryId,
            conversation_id: selectedConversation.id,
            sender_id: user.id,
            content: messageContent,
            created_at: new Date().toISOString(),
            is_read: false
        };

        setMessages(prev => [...prev, newMsgObj]);
        setNewMessage('');

        setConversations(prev => {
            const updated = prev.map(c =>
                c.id === selectedConversation.id
                    ? { ...c, last_message: messageContent, last_message_at: new Date().toISOString() }
                    : c
            );
            return updated.sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());
        });

        const { error } = await supabase
            .from('messages')
            .insert({
                conversation_id: selectedConversation.id,
                sender_id: user.id,
                content: messageContent
            });

        if (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message');
        } else {
            await supabase
                .from('conversations')
                .update({
                    last_message: messageContent,
                    last_message_at: new Date().toISOString()
                })
                .eq('id', selectedConversation.id);

            // Send email notification to patient
            const recipientId = selectedConversation.participant1_id === user.id
                ? selectedConversation.participant2_id
                : selectedConversation.participant1_id;

            const { data: doctorProfile } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', user.id)
                .single();

            fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'new_message',
                    data: {
                        senderId: user.id,
                        recipientId: recipientId,
                        senderName: doctorProfile?.full_name || 'Doctor',
                        senderRole: 'doctor',
                        messagePreview: messageContent
                    }
                })
            }).catch(err => console.error('Email notification failed:', err));
        }
    };


    const getOtherParticipantName = (conv: any) => {
        if (!user) return 'Unknown';
        return conv.participant1_id === user.id ? conv.participant2?.full_name : conv.participant1?.full_name;
    };

    const filteredConversations = conversations.filter(conv => {
        const name = getOtherParticipantName(conv)?.toLowerCase() || '';
        return name.includes(searchQuery.toLowerCase());
    });

    const formatMessageTime = (date: string) => {
        const d = new Date(date);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return d.toLocaleDateString([], { weekday: 'short' });
        }
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    return (
        <div className="h-[calc(100vh-100px)] p-4 md:p-6">
            {/* Background Effects */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute top-10 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/15 to-indigo-400/15 rounded-full blur-[100px]" />
                <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-[100px]" />
            </div>

            <div className="h-full flex gap-4 md:gap-6">
                {/* Conversations Sidebar */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-80 md:w-96 flex-shrink-0 flex flex-col rounded-3xl bg-white/60 backdrop-blur-xl border border-white/40 shadow-xl overflow-hidden"
                >
                    {/* Sidebar Header */}
                    <div className="p-5 border-b border-white/30 bg-gradient-to-r from-white/40 to-white/20">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25">
                                    <MessageCircle className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-slate-800">Messages</h2>
                                    <p className="text-xs text-slate-500">{conversations.length} conversations</p>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search patients..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-11 h-11 bg-white/70 border-white/40 rounded-xl focus:border-indigo-400"
                            />
                        </div>
                    </div>

                    {/* Conversations List */}
                    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                        {loading ? (
                            <div className="p-8 text-center">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                                    <p className="text-sm text-slate-500">Loading conversations...</p>
                                </div>
                            </div>
                        ) : filteredConversations.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center">
                                    <MessageCircle className="h-8 w-8 text-slate-300" />
                                </div>
                                <p className="text-sm text-slate-500">No conversations yet</p>
                            </div>
                        ) : (
                            <AnimatePresence initial={false}>
                                {filteredConversations.map((chat, index) => {
                                    const otherName = getOtherParticipantName(chat);
                                    const isSelected = selectedConversation?.id === chat.id;

                                    return (
                                        <motion.div
                                            key={chat.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                            onClick={() => setSelectedConversation(chat)}
                                            className={cn(
                                                "relative p-4 cursor-pointer transition-all duration-200",
                                                "hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/30",
                                                isSelected && "bg-gradient-to-r from-indigo-50/70 to-purple-50/50"
                                            )}
                                        >
                                            {isSelected && (
                                                <motion.div
                                                    layoutId="activeConversation"
                                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-r-full"
                                                />
                                            )}
                                            <div className="flex gap-3">
                                                <div className="relative">
                                                    <Avatar className="h-12 w-12 border-2 border-white shadow-md">
                                                        <AvatarFallback className="bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 font-semibold">
                                                            {otherName?.substring(0, 2).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <h3 className={cn(
                                                            "font-semibold text-sm truncate",
                                                            isSelected ? "text-indigo-700" : "text-slate-700"
                                                        )}>
                                                            {otherName}
                                                        </h3>
                                                        <span className="text-[10px] text-slate-400 flex-shrink-0">
                                                            {formatMessageTime(chat.last_message_at)}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-500 truncate">{chat.last_message || 'Start a conversation'}</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        )}
                    </div>
                </motion.div>

                {/* Chat Window */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex-1 flex flex-col rounded-3xl bg-white/60 backdrop-blur-xl border border-white/40 shadow-xl overflow-hidden"
                >
                    {selectedConversation ? (
                        <>
                            {/* Chat Header */}
                            <div className="px-6 py-4 border-b border-white/30 bg-gradient-to-r from-white/50 to-white/30 backdrop-blur-md">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <Avatar className="h-12 w-12 border-2 border-white shadow-lg">
                                                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold">
                                                    {getOtherParticipantName(selectedConversation)?.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800">{getOtherParticipantName(selectedConversation)}</h3>
                                            <div className="flex items-center gap-1.5">
                                                <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                                                <span className="text-xs text-slate-500">Online</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="icon" className="rounded-xl hover:bg-indigo-50 text-slate-500">
                                            <Phone className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="rounded-xl hover:bg-indigo-50 text-slate-500">
                                            <Video className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="rounded-xl hover:bg-indigo-50 text-slate-500">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gradient-to-b from-transparent to-slate-50/30 scrollbar-thin scrollbar-thumb-slate-200">
                                <AnimatePresence initial={false}>
                                    {messages.map((msg, index) => {
                                        const isMe = msg.sender_id === user?.id;
                                        const showAvatar = index === 0 || messages[index - 1]?.sender_id !== msg.sender_id;

                                        return (
                                            <motion.div
                                                key={msg.id}
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                transition={{ duration: 0.2 }}
                                                className={cn("flex gap-3", isMe ? "justify-end" : "justify-start")}
                                            >
                                                {!isMe && showAvatar && (
                                                    <Avatar className="h-8 w-8 mt-1 shadow-md flex-shrink-0">
                                                        <AvatarFallback className="bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 text-xs">
                                                            {getOtherParticipantName(selectedConversation)?.substring(0, 2).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                )}
                                                {!isMe && !showAvatar && <div className="w-8" />}
                                                <div className={cn(
                                                    "max-w-[70%] rounded-2xl px-4 py-3 shadow-sm",
                                                    isMe
                                                        ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-tr-sm"
                                                        : "bg-white/80 backdrop-blur-sm border border-white/40 text-slate-700 rounded-tl-sm"
                                                )}>
                                                    <p className="text-sm leading-relaxed">{msg.content}</p>
                                                    <div className={cn(
                                                        "flex items-center justify-end gap-1 mt-1",
                                                        isMe ? "text-white/70" : "text-slate-400"
                                                    )}>
                                                        <span className="text-[10px]">
                                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        {isMe && (
                                                            msg.is_read
                                                                ? <CheckCheck className="h-3 w-3" />
                                                                : <Check className="h-3 w-3" />
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input */}
                            <div className="p-4 border-t border-white/30 bg-white/50 backdrop-blur-sm">
                                <div className="flex gap-3 items-center">
                                    <Input
                                        placeholder="Type your message..."
                                        className="flex-1 h-12 bg-white/80 border-white/40 rounded-xl focus:border-indigo-400 focus:ring-indigo-400/20"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    />
                                    <Button
                                        onClick={handleSendMessage}
                                        disabled={!newMessage.trim()}
                                        className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl"
                                    >
                                        <Send className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="mb-6"
                                >
                                    <div className="relative inline-block">
                                        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mx-auto">
                                            <MessageCircle className="h-12 w-12 text-indigo-400" />
                                        </div>
                                        <motion.div
                                            className="absolute -top-2 -right-2"
                                            animate={{ rotate: [0, 15, -15, 0] }}
                                            transition={{ repeat: Infinity, duration: 2 }}
                                        >
                                            <Sparkles className="h-6 w-6 text-amber-400" />
                                        </motion.div>
                                    </div>
                                </motion.div>
                                <h3 className="text-xl font-bold text-slate-700 mb-2">Select a Conversation</h3>
                                <p className="text-sm text-slate-500 max-w-xs mx-auto">
                                    Choose a patient from the list to start messaging or view your conversation history.
                                </p>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
