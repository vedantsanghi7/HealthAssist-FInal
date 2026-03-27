'use client';

import React from 'react';
import { AIChatInterface } from '@/components/chat/AIChatInterface';

export default function AIChatPage() {
    return (
        <div className="space-y-6 pb-16 md:pb-6">
            <div className="flex justify-between items-center animate-fade-in-up">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">AI Health Assistant</h1>
                    <p className="text-muted-foreground mt-1">Chat with our advanced AI to understand your health better.</p>
                </div>
            </div>

            <div className="animate-fade-in-up delay-100">
                <AIChatInterface />
            </div>
        </div>
    );
}
