import { Trash2, Edit3, TagIcon } from "lucide-react";
import { Link } from "react-router-dom";

const ManageItemCard = ({ product, onDelete }) => {
  const {
    id,
    name,
    pricePerDay,
    productType,
    productCondition,
    tags,
    productImages,
  } = product;

  // Mock base URL for demo
  const base_url = import.meta.env.VITE_BASE_URL;

  const handleDelete = async () => {
    if (window.confirm(`Delete "${name}"?`)) {
      onDelete(id);
    }
  };


  const conditionColor = {
    NEW: "bg-gray-100 text-gray-800",
    LIKE_NEW: "bg-gray-100 text-gray-800",
    GOOD: "bg-gray-100 text-gray-800",
    FAIR: "bg-gray-200 text-gray-800",
    POOR: "bg-gray-200 text-gray-800",
  }[productCondition] || "bg-gray-100 text-gray-800";

  const conditionLabel = {
    NEW: "New",
    LIKE_NEW: "Like New",
    GOOD: "Good",
    FAIR: "Fair",
    POOR: "Poor",
  }[productCondition] || productCondition;

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="relative h-40 overflow-hidden">
          <img
            src={`${base_url}${productImages[0]}`}
            alt={name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 left-2">
            <div
              className={`px-2 py-1 rounded text-xs font-medium ${conditionColor}`}
            >
              {conditionLabel}
            </div>
          </div>
          <div className="absolute bottom-2 right-2">
            <div className="bg-gray-800 text-white px-2 py-1 rounded text-sm font-medium">
              ${pricePerDay.toFixed(2)}/day
            </div>
          </div>
        </div>

        <div className="p-4 space-y-2">
          <h3 className="text-base font-medium text-gray-900 truncate">
            {name}
          </h3>
          <div className="text-sm text-gray-500">
            {productType.replace("_", " ")}
          </div>
          {tags && (
            <div className="flex items-center gap-2">
              <TagIcon size={16} className="text-gray-500" />
              <div className="flex flex-wrap gap-1">
                {tags
                  .split(",")
                  .slice(0, 3)
                  .map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded border border-gray-200"
                    >
                      {tag.trim()}
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-4 pb-4 flex space-x-2">
          <Link
            to={`/dashboard/update-item/${product.id}`}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-1.5 text-xs rounded font-medium border border-gray-300 flex items-center cursor-pointer justify-center space-x-1"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit</span>
          </Link>
          <button
            onClick={handleDelete}
            className="flex-1 cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-800 py-1.5 text-xs rounded font-medium border border-gray-300 flex items-center justify-center space-x-1"
          >
            <Trash2 color="#ef4444" className="w-4 h-4" />
            <span className="text-red-500">Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageItemCard;