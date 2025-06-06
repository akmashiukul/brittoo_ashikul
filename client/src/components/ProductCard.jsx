import { Trash2, Edit3, TagIcon } from "lucide-react";

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

  // Mock base URL for demo
  const base_url = import.meta.env.VITE_BASE_URL;

  const handleDelete = async () => {
    // Simplified for demo - replace with your SweetAlert logic
    if (window.confirm(`Delete "${name}"?`)) {
      onDelete(id);
    }
  };

  const handleUpdate = () => {
    onUpdate(product);
  };

  const conditionColor =
    {
      NEW: "from-green-400 to-green-500",
      LIKE_NEW: "from-emerald-400 to-emerald-500",
      GOOD: "from-teal-400 to-teal-500",
      FAIR: "from-yellow-400 to-yellow-500",
      POOR: "from-red-400 to-red-500",
    }[productCondition] || "from-gray-400 to-gray-500";

  const conditionLabel =
    {
      NEW: "New",
      LIKE_NEW: "Like New",
      GOOD: "Good",
      FAIR: "Fair",
      POOR: "Poor",
    }[productCondition] || productCondition;

  return (
    <div
      className="group relative w-full max-w-sm mx-auto"
    >
      <div className="relative bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl group-hover:scale-[1.01]">
        <div className="absolute top-3 left-3 z-20">
          <div
            className={`px-2 py-1 rounded-md text-xs font-medium text-white bg-gradient-to-r ${conditionColor} shadow-sm`}
          >
            {conditionLabel}
          </div>
        </div>

        <div className="relative h-40 overflow-hidden">
          <img
            src={`${base_url}${productImages[0]}`}
            alt={name}
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>

          <div className="absolute bottom-3 right-3">
            <div className="bg-green-600 text-white px-3 py-[2px] rounded-lg shadow-md">
              <span className="text-sm font-semibold">
                ${pricePerDay.toFixed(2)}
              </span>
              <span className="text-xs opacity-90">/day</span>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div className="relative">
            <h3 className="text-lg font-semibold text-gray-700 group-hover:text-green-700 transition-colors duration-300 truncate">
              {name}
            </h3>
          </div>

          <div className="flex items-center space-x-2 text-gray-600">
            <span className="text-sm">{productType.replace("_", " ")}</span>
          </div>

          {tags && (
            <div className="flex items-center gap-2">
              <TagIcon size={18} color="#4b5563" />
              <div className="flex flex-wrap gap-1">
                {tags
                  .split(",")
                  .slice(0, 3)
                  .map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-green-50 text-green-700 rounded-md border border-green-100"
                    >
                      {tag.trim()}
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Action buttons with green theme */}
        <div className="px-4 pb-4">
          <div className="flex space-x-2">
            <button
              onClick={handleUpdate}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 text-xs px-2 rounded-lg font-medium shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center space-x-1 cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit</span>
            </button>

            <button
              onClick={handleDelete}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 text-xs px-2 rounded-lg font-medium shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center space-x-1 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageItemCard;
