import React, { useState, useEffect } from 'react';
import { MessageCircle, Circle } from 'lucide-react';
import api from '../../../lib/api';
import ChatModal from '../../../components/modals/ChatModal';


const IncomingChats = () => {
  const [chatRooms, setChatRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChatRoom, setSelectedChatRoom] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchChatRooms();
  }, []);

  const fetchChatRooms = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/api/v1/chat/rooms');
      setChatRooms(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const openChat = (room) => {
    setSelectedChatRoom(room);
    setIsModalOpen(true);
  };

  const currentUserId = JSON.parse(localStorage.getItem('user'))?.id;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Chats</h1>

      {chatRooms.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No chats yet</p>
          <p className="text-sm text-gray-500 mt-2">
            Start a conversation with a seller or buyer
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {chatRooms.map((room) => {
            const partner = room.buyerId === currentUserId ? room.seller : room.buyer;
            const lastMessage = room.messages?.[0];
            const isBuyer = room.buyerId === currentUserId;

            return (
              <div
                key={room.id}
                onClick={() => openChat(room)}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex gap-4">
                  {/* Product Image */}
                  <img
                    src={room.product.productImages?.[0] || '/placeholder.png'}
                    alt={room.product.name}
                    className="w-20 h-20 object-cover rounded"
                  />

                  {/* Chat Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {room.product.name}
                      </h3>
                      {room.unreadCount > 0 && (
                        <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                          {room.unreadCount}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <span>{partner.name}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-500">
                        {isBuyer ? 'Seller' : 'Buyer'}
                      </span>
                      <Circle
                        className={`w-2 h-2 fill-current ${room.isPartnerOnline ? 'text-green-500' : 'text-gray-400'
                          }`}
                      />
                    </div>

                    <p className="text-sm text-gray-600 truncate">
                      {lastMessage?.content || 'No messages yet'}
                    </p>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        ${room.product.askingPrice}
                      </span>
                      {lastMessage && (
                        <span className="text-xs text-gray-400">
                          {new Date(lastMessage.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && selectedChatRoom && (
        <ChatModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedChatRoom(null);
            fetchChatRooms();
          }}
          chatRoomId={selectedChatRoom.id}
        />
      )}
    </div>
  );
};

export default IncomingChats;