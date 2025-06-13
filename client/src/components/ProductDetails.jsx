import { useEffect, useState } from "react";
import api from "../lib/api";
import Swal from "sweetalert2";
import Loader from "./shared/Loader";
import { useParams } from "react-router-dom";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";
import { TagIcon } from "lucide-react";
import Avatar from "boring-avatars";
import { usePriceCalculate } from "../hooks/usePriceCalculate";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { differenceInDays } from "date-fns";
import useUserStore from "../stores/authStores/useUserStore";
import useCreditModalStore from "../stores/creditModalStores/useCreditModalStore";

const ProductDetails = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [numberOfDays, setNumberOfDays] = useState(3);
  const [price, setPrice] = useState(0);
  const { currentUser } = useUserStore();
  const { id } = useParams();
  const base_url = import.meta.env.VITE_BASE_URL;
  const { calculatePricePerDay } = usePriceCalculate();
  const [range, setRange] = useState({
    from: undefined,
    to: undefined,
  });
  const initial = range?.from;
  const final = range?.to;

  const { openCreditModal } = useCreditModalStore();

  //sss
  console.log(`${base_url}${product?.productImages[0]}`)

  useEffect(() => {
    if (initial && final) {
      setNumberOfDays(differenceInDays(final, initial) + 1);
    }
  }, [initial, final]);

  useEffect(() => {
    if (product) {
      const newPrice = calculatePricePerDay(
        product.omv,
        product.productCondition,
        product.productAge,
        product.owner.securityScore,
        numberOfDays,
      );
      setPrice(newPrice);
    }
  }, [calculatePricePerDay, numberOfDays, product]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/v1/products?productId=${id}`);
        setProduct(response.data.products[0]);
        setPrice(response.data.products[0].pricePerDay);
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

  const requestRental = async () => {
    openCreditModal(product.secondHandPrice);
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
                  square
                  colors={[
                    "#482344",
                    "#2b5166",
                    "#429867",
                    "#fab243",
                    "#e02130",
                  ]}
                  variant="beam"
                  size={30}
                  className="cursor-pointer"
                />
                <div>
                  <div className="text-xs">
                    <strong className="block font-medium text-gray-600">
                      {product.owner.name}
                    </strong>
                    <p className="text-gray-500 mt-1 italic">
                      {product.owner.email}
                    </p>
                    <p className="text-xs text-gray-600 mt-3">
                      <span className="font-medium">Security Score: </span>
                      <span
                        className={`text-xs ${
                          securityScoreColor[product.owner.securityScore]
                        }`}
                      >
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
                      <span className="font-medium">
                        Total Rental Engagements:{" "}
                      </span>
                      <span className={`text-xs`}>
                        {product.owner._count.borrowedProducts +
                          product.owner._count.rentedProducts}
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
          <p className="text-gray-700 sm:text-[15px] text-xs">
            {product.productDescription}
          </p>
        </div>
      </div>

      {/* 2 - A */}
      <div className="w-full md:w-1/3 md:border-l border-gray-300 sm:my-7 px-4">
        <h2 className="text-green-600 font-bold text-xl sm:text-2xl">
          BDT {price}/<span className="text-sm font-medium">day</span>
        </h2>
        <p className="text-sm text-gray-700">
          If rented for{" "}
          <span className="text-blue-600 font-medium">{numberOfDays}</span> Days
        </p>
        <div className="flex flex-col">
          <h2 className="text-lg font-bold text-gray-700 mt-8">
            Pick a custom range{" "}
            <span className="text-sm font-medium">(max 15 days)</span>:{" "}
          </h2>
          <p className="text-gray-700 text-xs mb-2">
            Price varies according to you selected range.
          </p>
          <DayPicker
            mode="range"
            selected={range}
            onSelect={setRange}
            max={15}
            disabled={{
              before: new Date()
            }}
            className="rdp-root self-center md:self-start"
          />
          {initial && final && (
            <div className="mt-4 text-xs">
              <p className="text-gray-700">
                <strong>Start:</strong> {initial.toDateString()}
              </p>
              <p className="text-gray-700">
                <strong>End:</strong> {final.toDateString()}
              </p>
            </div>
          )}
        </div>
        <div className="mt-8">
          <label htmlFor="coupon" className="text-lg font-bold text-gray-700">
            Enter Coupon{" "}
            <span className="text-sm font-medium">(If Applicable)</span>:
          </label>
          <input
            type="text"
            name="coupon"
            id="coupon"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-xs md:text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-1.5 md:p-2.5"
            placeholder="AF4K3LK3"
            required
          />
        </div>
        <button
          className="w-full text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-xs md:text-sm px-5 py-2.5 text-center cursor-pointer mt-8"
          onClick={requestRental}
        >
          Request Rental
        </button>
      </div>
    </div>
  );
};

export default ProductDetails;
