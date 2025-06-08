import { useEffect, useState } from "react";
import api from "../lib/api";
import Swal from "sweetalert2";
import useUserStore from "../stores/useUserStore";
import Loader from "./shared/Loader";
import { useParams } from "react-router-dom";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";
import { TagIcon } from "lucide-react";
import Avatar from "boring-avatars";

const ProductDetails = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useUserStore();
  const { id } = useParams();
  const base_url = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/v1/products?productId=${id}`);
        setProduct(response.data.products[0]);
        console.log(response.data.products[0]);
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err.response?.data?.message || err.message,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [currentUser.id, id]);

  let days;
  if (product) {
    days = Math.floor(
      (Date.now() - new Date(product.createdAt).getTime()) /
        (1000 * 60 * 60 * 24),
    );
  }

  const conditionColor =
    {
      NEW: "text-green-400",
      LIKE_NEW: "text-emerald-400",
      GOOD: "text-teal-400",
      FAIR: "text-yellow-400",
      POOR: "text-red-400",
    }[product?.productCondition] || "bg-gray-100 text-gray-800";

  const conditionLabel =
    {
      NEW: "🆕 New",
      LIKE_NEW: "✨ Like New",
      GOOD: "👍 Good",
      FAIR: "👌 Fair",
      POOR: "⚠️ Poor",
    }[product?.productCondition] || product?.productCondition;

  const securityScoreColor = {
    VERY_LOW: "text-red-600",
    LOW: "text-orange-500",
    MID: "text-yellow-500",
    HIGH: "text-green-500",
    VERY_HIGH: "text-emerald-600",
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <div className="w-full md:w-2/3 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
          {/* 1 - A */}
          <div className="w-full sm:w-1/2">
            <Carousel showThumbs={true} className="text-center">
              {product?.productImages?.map((image) => (
                <div key={image}>
                  <img
                    className="w-full h-[150px] md:h-[350px] object-contain"
                    src={`${base_url}${image}`}
                  />
                </div>
              ))}
            </Carousel>
          </div>
          {/*  1 - B */}
          <div className="w-full sm:w-1/2">
            <h2 className="text-xl md:text-2xl font-semibold sm:font-bold">
              {product.name}
            </h2>
            <p className="text-xs text-gray-500">
              Listed {days <= 0 ? "Today" : `${days} days ago.`}
            </p>

            <div className="flex items-center gap-2 mt-4 sm:mt-6">
              <TagIcon size={18} color="#4b5563" />
              <div className="flex flex-wrap gap-1">
                {product.tags
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter((tag) => tag.length > 0)
                  .slice(0, 3)
                  .map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs md:text-xs bg-green-50 text-green-700 rounded-md border border-green-100"
                    >
                      {tag.trim()}
                    </span>
                  ))}
              </div>
            </div>

            <p className="text-sm text-gray-600 mt-4 sm:mt-6">
              <span className="font-semibold">Condition:</span>{" "}
              <span
                className={`px-2 py-1 rounded-md text-sm ${conditionColor}`}
              >
                {conditionLabel}
              </span>
            </p>
            <p className="text-sm text-gray-600 mt-2">
              <span className="font-semibold">Product Age: </span>{" "}
              <span className={`px-2 py-1 rounded-md text-sm`}>
                Less than {product.productAge}{" "}
                {product.productAge == 1 ? "Year" : "Years"}
              </span>
            </p>
            <p className="text-sm text-gray-600 mt-2">
              <span className="font-semibold">Original Market Price: </span>{" "}
              <span className={`px-2 py-1 rounded-md text-sm`}>
                BDT {product.omv}.00
              </span>
            </p>

            <div className="mt-6 md:mt-8">
              <h2 className="text-base md:text-lg font-semibold sm:font-bold text-gray-600">
                Listed By:
              </h2>
              <hr className="w-full border-t border-gray-300 mt-1 mb-4 mx-auto" />
              <div className="flex gap-3 mt-1">
                <Avatar
                  name={product.owner.email}
                  colors={[
                    "#482344",
                    "#2b5166",
                    "#429867",
                    "#fab243",
                    "#e02130",
                  ]}
                  variant="beam"
                  size={35}
                  className="cursor-pointer"
                />
                <div>
                  <div className="text-xs">
                    <strong className="block font-medium text-gray-600">
                      {product.owner.name}
                    </strong>
                    <p className="text-gray-500 mt-1 italic">{product.owner.email}</p>
                    <p className="text-xs text-gray-600 mt-3">
                      <span className="font-medium">Security Score: </span>
                      <span className={`text-xs ${securityScoreColor[product.owner.securityScore]}`}>
                        {product.owner.securityScore
                          .toLowerCase()
                          .split("_")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1),
                          )
                          .join(" ")}
                      </span>
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      <span className="font-medium">Suspended: </span>
                      <span className={`text-xs`}>
                        {product.owner.suspensionCount || 0} times
                      </span>
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      <span className="font-medium">Total Rental Engagements: </span>
                      <span className={`text-xs`}>
                        {product.owner._count.borrowedProducts + product.owner._count.rentedProducts}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 1 - C */}
        <div className="mt-4">
          <h2 className="text-base md:text-lg font-semibold sm:font-bold text-gray-600">
            Details:
          </h2>
          <p className="text-gray-600 text-xs sm:text-sm">
            {product.productDescription}
          </p>
        </div>
      </div>

      <div className="w-full md:w-1/3 md:border-l border-gray-300 sm:my-7 px-4">
        Div 2 (1/3 width)
      </div>
    </div>
  );
};

export default ProductDetails;
