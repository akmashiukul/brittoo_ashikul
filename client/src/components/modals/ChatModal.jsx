import { useState, useEffect, useRef } from 'react';
import { X, Send, Circle, ChevronUp } from 'lucide-react';
import io from 'socket.io-client';
import api from '../../lib/api';
import Avatar from 'boring-avatars';
import useUserStore from '../../stores/authStores/useUserStore';

const ChatModal = ({ isOpen, onClose, productId, chatRoomId: initialChatRoomId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatRoom, setChatRoom] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const chatRoomId = useRef(initialChatRoomId);
  const previousScrollHeight = useRef(0);

  const { currentUser } = useUserStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const maintainScrollPosition = () => {
    if (messagesContainerRef.current) {
      const newScrollHeight = messagesContainerRef.current.scrollHeight;
      const scrollDiff = newScrollHeight - previousScrollHeight.current;
      messagesContainerRef.current.scrollTop += scrollDiff;
    }
  };

  useEffect(() => {
    if (isOpen && productId && !initialChatRoomId) {
      createOrGetChatRoom();
    } else if (isOpen && initialChatRoomId) {
      chatRoomId.current = initialChatRoomId;
      fetchMessages();
    }
  }, [isOpen, productId, initialChatRoomId]);

  useEffect(() => {
    if (chatRoomId.current && isOpen) {
      const token = localStorage.getItem('token');
      const newSocket = io(import.meta.env.VITE_BASE_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 10000,
      });

      newSocket.on('connect', () => {
        setIsConnected(true);
        newSocket.emit('join_room', { chatRoomId: chatRoomId.current });
      });
      newSocket.on('connect_error', (err) => {
        console.error('Socket connect_error:', err.message);
        setIsConnected(false);
      });
      newSocket.on('disconnect', (reason) => {
        setIsConnected(false);
      });
      newSocket.on('error', (error) => {
        console.error('Socket error from server:', error);
        alert(error.message || 'Socket error occurred');
      });
      newSocket.on('new_message', (message) => {
        setMessages(prev => [...prev, message]);
      });
      newSocket.on('messages_read', ({ chatRoomId: roomId }) => {
        console.log('Messages read in room:', roomId);
      });
      setSocket(newSocket);
      return () => {
        if (chatRoomId.current) {
          newSocket.emit('leave_room', chatRoomId.current);
        }
        newSocket.disconnect();
      };
    }
  }, [chatRoomId.current, isOpen]);

  useEffect(() => {
    if (messages.length > 0 && !isLoadingMore) {
      scrollToBottom();
    }
  }, [messages, isLoadingMore]);

  const createOrGetChatRoom = async () => {
    setIsLoading(true);
    try {
      const res = await api.post('/api/v1/chat/room', { productId });
      setChatRoom(res.data.data);
      chatRoomId.current = res.data.data.id;
      setMessages(res.data.data.messages || []);
      setHasMore(res.data.data.hasMore || false);
      setPage(1);
    } catch (err) {
      console.error('Error creating/getting chat room:', err);
      alert(err.response?.data?.message || 'Failed to create chat');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/api/v1/chat/room/${chatRoomId.current}/messages`);
      setMessages(res.data.data.messages);
      setHasMore(res.data.data.pagination?.hasMore || false);
      setPage(res.data.data.pagination?.currentPage || 1);
      const roomRes = await api.get('/api/v1/chat/rooms');
      const room = roomRes.data.data.find(r => r.id === chatRoomId.current);
      setChatRoom(room);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreMessages = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    const nextPage = page + 1;
    try {
      if (messagesContainerRef.current) {
        previousScrollHeight.current = messagesContainerRef.current.scrollHeight;
      }
      const res = await api.get(
        `/api/v1/chat/room/${chatRoomId.current}/messages?page=${nextPage}&limit=50`
      );
      const olderMessages = res.data.data.messages;
      setMessages(prev => [...olderMessages, ...prev]);
      setHasMore(res.data.data.pagination?.hasMore || false);
      setPage(nextPage);
      setTimeout(maintainScrollPosition, 0);
    } catch (err) {
      console.error('Error loading more messages:', err);
      alert('Failed to load more messages');
    } finally {
      setIsLoadingMore(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !isConnected) {
      console.log('Cannot send message:', { 
        hasMessage: !!newMessage.trim(), 
        hasSocket: !!socket, 
        isConnected 
      });
      return;
    }
    socket.emit('send_message', {
      chatRoomId: chatRoomId.current,
      content: newMessage.trim()
    });
    setNewMessage('');
  };

  if (!isOpen) return null;
  const currentUserId = currentUser.id;
  const partner = chatRoom?.buyerId === currentUserId ? chatRoom?.seller : chatRoom?.buyer;

  return (
    <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <Avatar
              name={chatRoom?.seller?.email}
              colors={[
                "#482344",
                "#2b5166",
                "#429867",
                "#fab243",
                "#e02130",
              ]}
              variant="beam"
              size={35}
            />
            <div>
              <h3 className="font-semibold text-gray-900">
                {chatRoom?.product?.name || 'Loading...'}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {partner && (
                  <>
                    <span>{partner.name}</span>
                    <Circle
                      className={`w-2 h-2 fill-current ${
                        isConnected 
                          ? 'text-green-500' 
                          : 'text-gray-400'
                      }`}
                    />
                    <span className="text-xs">
                      {isConnected ? 'Connected' : 'Connecting...'}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Messages */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-3"
        >
          {/* Load More Button */}
          {hasMore && !isLoading && (
            <div className="flex justify-center mb-4">
              <button
                onClick={loadMoreMessages}
                disabled={isLoadingMore}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingMore ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                    Loading...
                  </>
                ) : (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Load More Messages
                  </>
                )}
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <p>No messages yet</p>
              <p className="text-sm">Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.senderId === currentUserId;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      isOwn
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm break-words">{msg.content}</p>
                    <p className={`text-xs mt-1 ${isOwn ? 'text-green-100' : 'text-gray-500'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t">
          <form onSubmit={sendMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={!isConnected}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || !isConnected}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;