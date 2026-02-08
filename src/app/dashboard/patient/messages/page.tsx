'use client';

import React, { useEffect, useState, useRef } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Search, Mail, User } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/lib/supabase/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';

interface Conversation {
    id: string;
    participant1_id: string;
    participant2_id: string;
    participant1?: { full_name: string; id: string };
    participant2?: { full_name: string; id: string };
    last_message?: string;
    last_message_at: string;
}

interface Message {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    created_at: string;
    is_read: boolean;
}

export default function PatientMessagesPage() {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch conversations
    useEffect(() => {
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
            .channel('patient_conversations_channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, () => {
                fetchConversations();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    // Fetch messages when conversation selected
    useEffect(() => {
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
            .channel(`patient_messages:${selectedConversation.id}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `conversation_id=eq.${selectedConversation.id}`
            }, (payload) => {
                setMessages(prev => [...prev, payload.new as Message]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [selectedConversation]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation || !user) return;

        const messageContent = newMessage.trim();
        const temporaryId = crypto.randomUUID();
        const newMsgObj: Message = {
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
        } else {
            await supabase
                .from('conversations')
                .update({
                    last_message: messageContent,
                    last_message_at: new Date().toISOString()
                })
                .eq('id', selectedConversation.id);

            // Send email notification to doctor
            const recipientId = selectedConversation.participant1_id === user.id
                ? selectedConversation.participant2_id
                : selectedConversation.participant1_id;

            const { data: patientProfile } = await supabase
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
                        senderName: patientProfile?.full_name || 'Patient',
                        senderRole: 'patient',
                        messagePreview: messageContent
                    }
                })
            }).catch(err => console.error('Email notification failed:', err));
        }
    };


    const getOtherParticipantName = (conv: Conversation) => {
        if (!user) return 'Unknown';
        const name = conv.participant1_id === user.id ? conv.participant2?.full_name : conv.participant1?.full_name;
        return name ? `Dr. ${name}` : 'Doctor';
    };

    const filteredConversations = conversations.filter(c => {
        const name = getOtherParticipantName(c)?.toLowerCase() || '';
        return name.includes(searchTerm.toLowerCase());
    });

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-1"
            >
                <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
                    Messages
                </h1>
                <p className="text-muted-foreground text-base max-w-lg">
                    Communicate securely with your healthcare providers.
                </p>
            </motion.div>

            {/* Main Content - Flex Layout */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex gap-6 h-[calc(100vh-220px)]"
            >
                {/* Conversations Sidebar */}
                <div className="w-80 shrink-0">
                    <GlassCard className="h-full flex flex-col p-0 overflow-hidden bg-white/80 backdrop-blur-xl border border-slate-200/50 shadow-lg">
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                            <div className="flex items-center gap-2 mb-3">
                                <Mail className="h-5 w-5 text-blue-600" />
                                <h2 className="font-semibold text-slate-800">Conversations</h2>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search..."
                                    className="pl-10 bg-white border-slate-200 focus:border-blue-400 rounded-lg h-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-auto">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <LoadingSpinner size={32} className="text-blue-500" />
                                    <p className="mt-3 text-sm text-slate-400">Loading...</p>
                                </div>
                            ) : filteredConversations.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                                    <div className="h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                                        <Mail className="h-8 w-8 text-blue-400" />
                                    </div>
                                    <h3 className="font-medium text-slate-700 mb-1">No conversations</h3>
                                    <p className="text-sm text-slate-400">Doctor conversations will appear here</p>
                                </div>
                            ) : (
                                filteredConversations.map((conv) => {
                                    const otherName = getOtherParticipantName(conv);
                                    const isSelected = selectedConversation?.id === conv.id;
                                    return (
                                        <div
                                            key={conv.id}
                                            onClick={() => setSelectedConversation(conv)}
                                            className={`p-4 border-b border-slate-100 hover:bg-blue-50/50 cursor-pointer flex gap-3 transition-all ${isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                                        >
                                            <Avatar className="h-10 w-10 border-2 border-white shadow-sm shrink-0">
                                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm font-medium">
                                                    {otherName?.substring(0, 2).toUpperCase() || 'DR'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start gap-2">
                                                    <h3 className={`font-medium text-sm truncate ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}>
                                                        {otherName || 'Doctor'}
                                                    </h3>
                                                    <span className="text-[10px] text-slate-400 shrink-0">
                                                        {new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 truncate mt-0.5">
                                                    {conv.last_message || 'Start a conversation'}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </GlassCard>
                </div>

                {/* Chat Window */}
                <div className="flex-1 min-w-0">
                    <GlassCard className="h-full flex flex-col p-0 overflow-hidden bg-white/90 backdrop-blur-xl border border-slate-200/50 shadow-lg">
                        {selectedConversation ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center gap-3">
                                    <Avatar className="h-10 w-10 border-2 border-white shadow-md">
                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-medium">
                                            {getOtherParticipantName(selectedConversation)?.substring(0, 2).toUpperCase() || 'DR'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-semibold text-slate-800">
                                            {getOtherParticipantName(selectedConversation) || 'Doctor'}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <span className="h-2 w-2 rounded-full bg-green-500" />
                                            <span className="text-xs text-slate-500">Available</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Messages Area */}
                                <div className="flex-1 p-4 overflow-auto space-y-4 bg-slate-50/30">
                                    {messages.map((msg) => {
                                        const isMe = msg.sender_id === user?.id;
                                        return (
                                            <div
                                                key={msg.id}
                                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div className="flex items-end gap-2 max-w-[70%]">
                                                    {!isMe && (
                                                        <Avatar className="h-6 w-6 shrink-0">
                                                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-[10px]">
                                                                DR
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    )}
                                                    <div
                                                        className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm ${isMe
                                                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-sm'
                                                            : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm'
                                                            }`}
                                                    >
                                                        {msg.content}
                                                        <div className={`text-[10px] mt-1 ${isMe ? 'text-blue-100' : 'text-slate-400'}`}>
                                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </div>
                                                    {isMe && (
                                                        <Avatar className="h-6 w-6 shrink-0">
                                                            <AvatarFallback className="bg-slate-700 text-white text-[10px]">
                                                                <User className="h-3 w-3" />
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Message Input */}
                                <div className="p-4 border-t border-slate-100 bg-white">
                                    <div className="flex gap-3">
                                        <Input
                                            placeholder="Type your message..."
                                            className="flex-1 bg-slate-50 border-slate-200 focus:border-blue-400 rounded-xl h-12"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                        />
                                        <Button
                                            onClick={handleSendMessage}
                                            disabled={!newMessage.trim()}
                                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl h-12 px-6 shadow-lg shadow-blue-500/25"
                                        >
                                            <Send className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center mb-6">
                                    <Mail className="h-10 w-10 text-blue-400" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">Select a conversation</h3>
                                <p className="text-slate-500 max-w-sm">
                                    Choose a conversation from the list to view messages and chat with your healthcare provider.
                                </p>
                            </div>
                        )}
                    </GlassCard>
                </div>
            </motion.div>
        </div>
    );
}
