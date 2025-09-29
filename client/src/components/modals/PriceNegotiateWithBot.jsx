import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Loader2 } from 'lucide-react';
import negotiationApi from '../../lib/negotiationApi';

const PriceNegotiateWithBot = ({ product, isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentOffer, setCurrentOffer] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setMessages([
        {
          id: 1,
          type: 'bot',
          content: `Hello! I'm here to help you negotiate the price for ${product.name}. The current asking price is ৳${product.askingPrice}. What price would you like to offer?`,
          timestamp: new Date()
        }
      ]);
    }
  }, [isOpen, product]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await negotiationApi.post('/api/v2/agents/negotiate', {
        message: inputMessage,
        confirm: false,
        close: false,
        product,
      });

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.data.reply,
        timestamp: new Date(),
        suggestedPrice: response.data.suggestedPrice
      };

      setMessages(prev => [...prev, botMessage]);
      setCurrentOffer(response.data.suggestedPrice);

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }

    setInputMessage('');
  };

  const confirmOffer = async () => {
    if (!currentOffer) return;

    setIsLoading(true);
    try {
      const response = await negotiationApi.post('/api/v2/agents/negotiate', {
        message: `I accept the offer of ৳${currentOffer}`,
        confirm: true,
        close: false,
        product: product
      });

      const confirmMessage = {
        id: Date.now(),
        type: 'bot',
        content: `Great! The deal is confirmed at ৳${currentOffer}. Thank you for negotiating!`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, confirmMessage]);

      // You can add logic here to handle the confirmed deal
      // e.g., redirect to payment page, update product status, etc.

    } catch (error) {
      console.error('Error confirming offer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-green-50 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="bg-green-600 p-2 rounded-full">
              <Bot className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Price Negotiation Bot</h3>
              <p className="text-sm text-gray-600">{product.productName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''
                }`}
            >
              <div className={`p-2 rounded-full ${message.type === 'user'
                  ? 'bg-green-600'
                  : 'bg-gray-200'
                }`}>
                {message.type === 'user' ? (
                  <User className="text-white" size={16} />
                ) : (
                  <Bot className="text-gray-600" size={16} />
                )}
              </div>

              <div className={`flex-1 max-w-xs lg:max-w-md ${message.type === 'user' ? 'text-right' : ''
                }`}>
                <div className={`p-3 rounded-lg ${message.type === 'user'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                  }`}>
                  {message.content}
                </div>

                {message.suggestedPrice && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      Suggested Price: <span className="font-semibold">৳{message.suggestedPrice}</span>
                    </p>
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="bg-gray-200 p-2 rounded-full">
                <Bot className="text-gray-600" size={16} />
              </div>
              <div className="bg-gray-100 p-3 rounded-lg">
                <Loader2 className="animate-spin" size={16} />
                <span className="ml-2 text-gray-600">Bot is typing...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Action Buttons */}
        {currentOffer && (
          <div className="px-4 py-2 bg-green-50 border-t border-green-200">
            <button
              onClick={confirmOffer}
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Accept Offer of ৳{currentOffer}
            </button>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your offer or message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white p-2 rounded-lg transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceNegotiateWithBot;