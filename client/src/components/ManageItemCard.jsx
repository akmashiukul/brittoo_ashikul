import React from "react";
import Swal from "sweetalert2";
import axios from "axios";

const ManageItemCard = ({ product, onDelete, onUpdate }) => {
  const {
    id,
    name,
    pricePerDay,
    productType,
    productCondition,
    tags,
    productImages,
  } = product;

  const base_url = import.meta.env.VITE_BASE_URL;
  console.log(base_url)
  console.log(`${base_url}${productImages[0]}`);

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You won't be able to revert this deletion for "${name}"!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authentication token not found");

        await axios.delete(`/api/v1/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Your product has been deleted.",
          timer: 1500,
        });

        onDelete(id);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.message || "Failed to delete product",
        });
      }
    }
  };

  const handleUpdate = () => {
    onUpdate(product);
    Swal.fire({
      icon: "info",
      title: "Update",
      text: "Update functionality to be implemented!",
      timer: 1500,
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transform transition-all hover:shadow-2xl hover:-translate-y-1">
      <div className="h-48 w-full overflow-hidden">
        <img
          src={`${base_url}${productImages[0]}`}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
          {name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {productType} • {productCondition}
        </p>
        <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-1">
          ${pricePerDay.toFixed(2)}/day
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-600 mt-2 truncate">
          Tags: {tags}
        </p>
      </div>
      <div className="flex justify-between p-4 bg-gray-50 dark:bg-gray-700">
        <button
          onClick={handleUpdate}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 text-sm font-medium"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 text-sm font-medium"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default ManageItemCard;
