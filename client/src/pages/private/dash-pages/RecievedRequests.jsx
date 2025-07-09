import { useState, useEffect } from 'react';
import { 
  User, 
  Calendar, 
  Phone, 
  Shield, 
  Package, 
  DollarSign, 
  CheckCircle, 
  XCircle,
  Clock,
  Mail,
  Check,
  X
} from 'lucide-react';
import api from '../../../lib/api';

const RecievedRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingRequest, setProcessingRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [acceptFormData, setAcceptFormData] = useState({
    ownerDepositMethod: '',
    ownerPhoneNumber: '',
    pickupPoint: ''
  });

  const baseUrl = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    fetchRentalRequests();
  }, []);

  const fetchRentalRequests = async () => {
    try {
      const res = await api.get('/api/v1/rental-requests/owner-requests', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!res.data.success) {
        throw new Error('Failed to fetch requests');
      }
      
      setRequests(res.data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    setProcessingRequest(selectedRequest.id);
    try {
      const response = await fetch(`/api/rental-requests/accept/${selectedRequest.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(acceptFormData)
      });

      if (!response.ok) {
        throw new Error('Failed to accept request');
      }

      const data = await response.json();
      
      // Update the request in the state
      setRequests(prev => prev.map(req => 
        req.id === selectedRequest.id 
          ? { ...req, status: 'ACCEPTED_BY_OWNER' }
          : req
      ));

      // Show success notification
      showNotification('Request accepted successfully!', 'success');
      closeModal();
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      showNotification('Please provide a reason for rejection', 'error');
      return;
    }

    setProcessingRequest(selectedRequest.id);
    try {
      const response = await fetch(`/api/rental-requests/reject/${selectedRequest.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ rejectReason })
      });

      if (!response.ok) {
        throw new Error('Failed to reject request');
      }

      const data = await response.json();
      
      // Update the request in the state
      setRequests(prev => prev.map(req => 
        req.id === selectedRequest.id 
          ? { ...req, status: 'REJECTED_BY_OWNER', rejectReason }
          : req
      ));

      // Show success notification
      showNotification('Request rejected successfully', 'success');
      closeModal();
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setProcessingRequest(null);
    }
  };

  const showNotification = (message, type) => {
    // You can implement your notification system here
    // For now, we'll use a simple alert
    alert(message);
  };

  const openModal = (type, request) => {
    setModalType(type);
    setSelectedRequest(request);
    setShowModal(true);
    if (type === 'accept') {
      setAcceptFormData({
        ownerDepositMethod: '',
        ownerPhoneNumber: '',
        pickupPoint: ''
      });
    } else {
      setRejectReason('');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setSelectedRequest(null);
    setRejectReason('');
    setAcceptFormData({
      ownerDepositMethod: '',
      ownerPhoneNumber: '',
      pickupPoint: ''
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'REQUESTED_BY_RENTER':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ACCEPTED_BY_OWNER':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED_BY_OWNER':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSecurityScoreColor = (score) => {
    switch (score) {
      case 'VERY_HIGH':
        return 'text-green-600 bg-green-100';
      case 'HIGH':
        return 'text-green-500 bg-green-50';
      case 'MID':
        return 'text-yellow-500 bg-yellow-50';
      case 'LOW':
        return 'text-orange-500 bg-orange-50';
      case 'VERY_LOW':
        return 'text-red-500 bg-red-50';
      default:
        return 'text-gray-500 bg-gray-50';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatStatus = (status) => {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-green-600 mt-4">Loading rental requests...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 text-lg">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 border-b pb-4 border-gray-300">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Rental Requests</h1>
            <p className="text-gray-600">Manage rental requests for your products</p>
          </div>
          <div>

          </div>
        </div>

        {/* Requests List */}
        {requests.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-green-800 mb-2">No Requests Found</h3>
            <p className="text-green-600">You haven't received any rental requests yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {requests.map((request) => (
              <div key={request.id} className="bg-white rounded-2xl shadow-lg border border-green-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Product Image */}
                    <div className="lg:w-48 h-48 rounded-xl overflow-hidden flex-shrink-0 border border-gray-300">
                      <img
                        src={`${baseUrl}${request.product.productImages[0]}`}
                        alt={request.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800 mb-2">{request.product.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              <span>৳{request.product.pricePerDay}/day</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Package className="w-4 h-4" />
                              <span>{request.product.productType}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{formatDate(request.createdAt)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(request.status)}`}>
                          <Clock className="w-4 h-4" />
                          {formatStatus(request.status)}
                        </div>
                      </div>

                      {/* Renter Information */}
                      <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-green-50 rounded-xl p-4">
                          <div className="flex items-center gap-2 text-sm text-green-700 mb-3">
                            <User className="w-4 h-4" />
                            <span className="font-medium">Renter Information</span>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <p className="font-medium text-gray-800">{request.requester.name}</p>
                              <p className="text-sm text-gray-600">{request.requester.email}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span className="text-xs mt-1 text-gray-600">{request.renterPhoneNumber}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4 text-gray-400" />
                              <span className={`text-sm font-medium px-2 py-1 rounded ${getSecurityScoreColor(request.requester.securityScore)}`}>
                                {request.requester.securityScore.replace('_', ' ')}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                <span>{request.requester.emailVerified ? 'Verified' : 'Not Verified'}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                <span>{request.requester.isVerified === "VERIFIED" ? 'Verified' : 'Not Verified'}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Rental Details */}
                        <div className="bg-blue-50 rounded-xl p-4">
                          <div className="flex items-center gap-2 text-sm text-blue-700 mb-3">
                            <Calendar className="w-4 h-4" />
                            <span className="font-medium">Rental Details</span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Start Date:</span>
                              <span className="text-sm font-medium text-gray-800">{formatDate(request.rentalStartDate)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">End Date:</span>
                              <span className="text-sm font-medium text-gray-800">{formatDate(request.rentalEndDate)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Duration:</span>
                              <span className="text-sm font-medium text-gray-800">{request.totalDays} days</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Total Amount:</span>
                              <span className="text-sm font-medium text-green-600">৳{(request.product.pricePerDay * request.totalDays).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Collection:</span>
                              <span className="text-sm font-medium text-gray-800">
                                {request.renterCollectionMethod === 'TERMINAL_PICKUP' ? 'Terminal Pickup' : 'Home Delivery'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {request.status === 'REQUESTED_BY_RENTER' && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => openModal('accept', request)}
                            disabled={processingRequest === request.id}
                            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Check className="w-4 h-4" />
                            {processingRequest === request.id ? 'Processing...' : 'Accept'}
                          </button>
                          <button
                            onClick={() => openModal('reject', request)}
                            disabled={processingRequest === request.id}
                            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <X className="w-4 h-4" />
                            {processingRequest === request.id ? 'Processing...' : 'Reject'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              {modalType === 'accept' ? (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Accept Rental Request</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Deposit Method
                      </label>
                      <select
                        value={acceptFormData.ownerDepositMethod}
                        onChange={(e) => setAcceptFormData({...acceptFormData, ownerDepositMethod: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Select deposit method</option>
                        <option value="HOME_DEPOSIT">Home Deposit</option>
                        <option value="TERMINAL_DEPOSIT">Terminal Deposit</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Phone Number
                      </label>
                      <input
                        type="tel"
                        value={acceptFormData.ownerPhoneNumber}
                        onChange={(e) => setAcceptFormData({...acceptFormData, ownerPhoneNumber: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Enter your phone number"
                      />
                    </div>
                    {acceptFormData.ownerDepositMethod === 'TERMINAL_DEPOSIT' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pickup Point
                        </label>
                        <select
                          value={acceptFormData.pickupPoint}
                          onChange={(e) => setAcceptFormData({...acceptFormData, pickupPoint: e.target.value})}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="">Select pickup point</option>
                          <option value="CSE_1">CSE Building</option>
                          <option value="ADMIN_1">Admin Building</option>
                          <option value="BANGABANDHU_HALL_1">Bangabandhu Hall</option>
                          <option value="ZIA_HALL_1">Zia Hall</option>
                          <option value="LIBRARY_1">Library</option>
                        </select>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={handleAccept}
                      disabled={!acceptFormData.ownerDepositMethod || !acceptFormData.ownerPhoneNumber}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Accept Request
                    </button>
                    <button
                      onClick={closeModal}
                      className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Reject Rental Request</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reason for Rejection
                      </label>
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        rows="4"
                        placeholder="Please provide a reason for rejecting this request..."
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={handleReject}
                      disabled={!rejectReason.trim()}
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Reject Request
                    </button>
                    <button
                      onClick={closeModal}
                      className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecievedRequests;