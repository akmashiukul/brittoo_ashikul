import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import useUserStore from "../../../stores/useUserStore";
import ManageItemCard from "../../../components/ManageItemCard";
import api from "../../../lib/api";

const ManageItems = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useUserStore();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token || !currentUser.id) {
          throw new Error("Please log in to view your products.");
        }

        const response = await api.get(`/api/v1/products?ownerId=${currentUser.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setProducts(response.data.products || []);
        console.log(response.data.products);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err.response?.data?.message || err.message,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentUser.id]);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Manage Your Products
        </h1>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-600">
            {error}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center text-gray-600">
            You haven't listed any products yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ManageItemCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageItems;