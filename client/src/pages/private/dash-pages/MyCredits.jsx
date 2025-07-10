import { useState, useEffect } from "react";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import api from "../../../lib/api";
import BCC from "../../../components/CacheCreditCard/BCC";
import RCC from "../../../components/CacheCreditCard/RCC";
import { Link } from "react-router-dom";

const MyCredits = () => {
  const [creditHistory, setCreditHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedSections, setExpandedSections] = useState({
    bccTransactions: false,
    rccUsage: false,
    rentalHistory: false,
  });

  console.log("C history: --- : ", creditHistory);

  // Fetch dashboard data from API
  useEffect(() => {
    const fetchCreditHistory = async () => {
      try {
        const response = await api.get("/api/v1/credits/user/credit-history", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.data.success) {
          throw new Error("Failed to fetch dashboard data");
        }
        setCreditHistory(response.data.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCreditHistory();
  }, []);

  const refetchData = () => {
    setLoading(true);
    setError(null);
    // Re-run the fetch effect
    const fetchCreditHistory = async () => {
      try {
        const response = await api.get("/api/v1/credits/user/credit-history", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.data.success) {
          throw new Error("Failed to fetch dashboard data");
        }
        setCreditHistory(response.data.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCreditHistory();
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ACCEPTED":
        return "text-green-600";
      case "REJECTED":
        return "text-red-600";
      case "PENDING":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "ACCEPTED":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "REJECTED":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "PENDING":
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isExpired = (endDate) => {
    return new Date(endDate) < new Date();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="flex flex-col items-center justify-center h-64">
          <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-gray-600 mb-4 text-center">{error}</p>
          <button
            onClick={refetchData}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!creditHistory) {
    return (
      <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="flex flex-col items-center justify-center h-64">
          <Package className="w-16 h-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            No Data Available
          </h2>
          <p className="text-gray-600">
            Unable to load dashboard data at this time.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <div className="flex justify-between items-center border-b border-gray-200 pb-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Credits Dashboard
            </h1>
            <p className="text-gray-600">
              Manage your Blue Cache Credits and Red Cache Credits
            </p>
          </div>
          <button
            onClick={refetchData}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-md border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Available BCC
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {creditHistory?.summary?.bcc?.availableBalance || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-md border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <Package className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Available RCC</p>
              <p className="text-2xl font-bold text-gray-900">
                {creditHistory?.summary?.rcc?.availableAmount || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-md border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Rentals</p>
              <p className="text-2xl font-bold text-gray-900">
                {creditHistory?.summary?.rentals?.totalRentals || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-md border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Pending BCC
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {creditHistory?.summary?.bcc?.totalPendingBcc || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-md border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Package className="w-6 h-6 text-red-200" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Use RCC</p>
              <p className="text-2xl font-bold text-gray-900">
                {creditHistory?.summary?.rcc?.totalInUse || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-md border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Package className="w-6 h-6 text-blue-200" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Use BCC</p>
              <p className="text-2xl font-bold text-gray-900">
                {creditHistory?.summary?.bcc?.lockedBalance || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {["overview", "bcc-transactions", "rcc-details", "usage"].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? "border-green-500 text-green-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab
                    .replace("-", " ")
                    .replace("rcc", "RCC")
                    .replace("bcc", "BCC")}
                </button>
              ),
            )}
          </nav>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Credit Cards */}
          <div className="flex-1 overflow-y-auto pb-4">
            <div className="px-3 md:px-5 mt-2">
              <h3 className="mt-1 text-sm font-semibold text-center sm:text-left">
                🔵Available Blue Cache Credits
              </h3>
              <div className="mt-4 flex flex-col sm:flex-row items-center">
                <BCC
                  handleSelect={() => {}}
                  bccWallet={creditHistory?.bccWallet}
                />
              </div>
              <h3 className="mt-6 text-sm font-semibold text-center sm:text-left">
                🔴Available Red Cache Credits
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 mt-2 justify-self-center sm:justify-self-start">
                {creditHistory?.redCacheCredits?.map((credit) => (
                  <RCC handleSelect={() => {}} key={credit.id} rcc={credit} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rcc details tab */}
      {activeTab === "rcc-details" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              Red Cache Credits Details
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source Product
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    In Use
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Validity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {creditHistory?.redCacheCredits?.map((rcc) => (
                  <tr key={rcc.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package className="w-4 h-4 text-gray-400 mr-2" />
                        <Link
                          to={rcc.sourceProduct.id}
                          className="p-2 border border-gray-200 rounded-lg w-full hover:scale-105 hover:bg-gray-200 hover:text-white transition-all duration-300 hover:ml-2"
                        >
                          <div className="text-sm font-medium text-gray-900">
                            {rcc.sourceProduct.name}
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="text-sm text-gray-500">
                              {rcc.sourceProduct.productSL}
                            </div>
                            <div className="h-1 w-1 bg-gray-400 rounded-full"></div>
                            <div className="text-xs text-gray-500">
                              BDT {rcc.sourceProduct.pricePerDay}/Day
                            </div>
                          </div>
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {rcc.amount}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{rcc.inUse}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(rcc.validityStart)} -{" "}
                        {formatDate(rcc.validityEnd)}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          isExpired(rcc.validityEnd)
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {isExpired(rcc.validityEnd) ? "Expired" : "Active"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === "bcc-transactions" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                BCC Transaction History
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gateway
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {creditHistory?.bccTransactions?.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-gray-900">
                          {transaction.transactionId || transaction.id}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {transaction.transactionType}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {transaction.transactionType === "USAGE" ||
                          transaction.transactionType === "WITHDRAWAL"
                            ? "-"
                            : "+"}
                          {transaction.amount}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {transaction.paymentGateway || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(transaction.status)}
                          <span
                            className={`ml-2 text-sm ${getStatusColor(
                              transaction.status,
                            )}`}
                          >
                            {transaction.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {formatDate(transaction.createdAt)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Usage Tab */}
      {activeTab === "usage" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                Credit Usage in Rentals
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      BCC Used
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      RCC Used
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Period
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {creditHistory?.rentalHistory?.map((rental) => (
                    <tr key={rental.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Package className="w-4 h-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {rental.product.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {rental.product.productSL}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {rental.totalDays} days
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {rental.usedBccAmount || 0}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {rental.rccUsageDetails?.map((usage, index) => (
                            <div key={index} className="mb-1">
                              <span className="font-medium">
                                {usage.usedAmount}
                              </span>
                              <span className="text-gray-500 ml-1">
                                (from{" "}
                                {usage.redCacheCredit.sourceProduct.productSL})
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {rental.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(rental.rentalStartDate)} -{" "}
                          {formatDate(rental.rentalEndDate)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCredits;
