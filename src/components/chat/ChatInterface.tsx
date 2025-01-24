import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Send } from 'lucide-react';

interface ChatInterfaceProps {
  recipientId: string;
}

export default function ChatInterface({ recipientId }: ChatInterfaceProps) {
  const { state, dispatch } = useApp();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUser = state.currentUser!;
  const recipient = state.users.find((user) => user.id === recipientId);

  const chatMessages = state.messages.filter(
    (msg) =>
      (msg.senderId === currentUser.id && msg.receiverId === recipientId) ||
      (msg.senderId === recipientId && msg.receiverId === currentUser.id)
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: crypto.randomUUID(),
          senderId: currentUser.id,
          receiverId: recipientId,
          content: message.trim(),
          createdAt: new Date(),
        },
      });
      setMessage('');
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-md">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Chat with {recipient?.name}</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.map((msg) => {
          const isCurrentUser = msg.senderId === currentUser.id;
          return (
            <div
              key={msg.id}
              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  isCurrentUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p>{msg.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    isCurrentUser ? 'text-blue-100' : 'text-gray-500'
                  }`}
                >
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}