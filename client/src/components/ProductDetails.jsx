import { useEffect, useState } from "react";
import api from "../lib/api";
import Swal from "sweetalert2";
import Loader from "./shared/Loader";
import { useParams } from "react-router-dom";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";
import { CheckCircle, TagIcon, XCircle } from "lucide-react";
import Avatar from "boring-avatars";
import { usePriceCalculate } from "../hooks/usePriceCalculate";
import { differenceInDays } from "date-fns";
import useUserStore from "../stores/authStores/useUserStore";
import useCreditModalStore from "../stores/creditModalStores/useCreditModalStore";
import calendarImage from "../assets/calendar.png";
import { formatDistanceToNow } from "date-fns";
import DaysDisplay from "./DaysDisplay";

const ProductDetails = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [holdLoading, setHoldLoading] = useState(false);
  const [numberOfDays, setNumberOfDays] = useState(3);
  const [price, setPrice] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState(null);
  const [couponValidationError, setCouponValidationError] = useState("");
  const [discountedPrice, setDiscountedPrice] = useState({
    value: 0,
    floor: false,
    ceil: false
  });

  const { currentUser } = useUserStore();
  const { id } = useParams();

  const baseUrl = import.meta.env.VITE_BASE_URL;

  const { calculatePricePerDay } = usePriceCalculate();
  const [range, setRange] = useState({
    from: undefined,
    to: undefined,
  });
  const initial = range?.from;
  const final = range?.to;

  const { openCreditModal } = useCreditModalStore();

  function conditionalCeilOrFloor(value) {
    const decimalPart = value - Math.floor(value);

    if (decimalPart >= 0.5) {
      return {
        value: Math.ceil(value),
        ceil: true,
      };
    } else {
      return {
        value: Math.floor(value),
        floor: true,
      };
    }
  }

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
  }, [id]);

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
    if (!currentUser) {
      Swal.fire({
        icon: "error",
        title: "You Can't Rent!",
        text: "You Need to Login First to Rent Something",
      });
      return;
    }
    if (product?.ownerId === currentUser?.id) {
      Swal.fire({
        icon: "error",
        title: "Hey Nigga!",
        text: "You can't rent your own product",
      });
      return;
    }
    if (!initial) {
      Swal.fire({
        imageUrl: calendarImage,
        imageWidth: 190,
        imageHeight: 180,
        imageAlt: "Custom image",
        title: "Select date/range you wanna rent for",
      });
      return;
    }
    openCreditModal({ initial, final, product: { ...product, secondHandPrice: (product.secondHandPrice - discountedPrice.value) }, setProduct, coupon });
  };

  const handleHoldProduct = async (status) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#7e0de0",
      cancelButtonColor: "#d33",
      confirmButtonText: `${status}`
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setHoldLoading(true);
          const res = await api.put(`/api/v1/admin-dash/hold/${product.id}`, {
            status
          }, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          });
          if (!res.data.success) {
            Swal.fire({
              icon: "error",
              title: "OOPS!",
              text: "Couldn't hold the product",
            });
            return;
          }
          Swal.fire({
            title: "Success!",
            text: "Hold status changed successfully",
            icon: "success"
          });
          setHoldLoading(false);
          setProduct((prev) => ({ ...prev, isOnHold: res.data.data.isOnHold }));
        } catch (error) {
          console.log(error);
          Swal.fire({
            icon: "error",
            title: "OOPS!",
            text: "Couldn't hold the product",
          });
          setHoldLoading(false);
        } finally {
          setHoldLoading(false);
        }
      }
    });
  }

  const handleApplyCoupon = async () => {
    try {
      const res = await api.get(`/api/v1/coupons/validate/${couponCode}/${currentUser.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      if (!res.data.success) {
        Swal.fire({
          icon: "error",
          title: "OOPS!",
          text: "Error in Coupon Validation",
        });
        setCoupon(null);
        return;
      }
      if (!res.data.valid) {
        setCouponValidationError(res.data.message);
        setCoupon(null);
        return;
      }
      setCoupon(res.data.data);
      setCouponValidationError("");
      const roundedDiscountPrice = conditionalCeilOrFloor(product.secondHandPrice * (res.data.data.discount / 100));
      setDiscountedPrice(roundedDiscountPrice);
    } catch (error) {
      console.log("Error in apply coupon: ", error);
      alert("Error in coupon validation");
    }
  }

  useEffect(() => {
    if (couponCode == "") {
      setCouponValidationError("");
      setDiscountedPrice({
        value: 0,
        floor: false,
        ceil: false
      })
      setCoupon(null);
    }
  }, [couponCode]);



  if (loading) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <div className="w-full lg:w-2/3 p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
          {/* 1 - A */}
          <div className="w-full lg:w-1/2">
            <Carousel showThumbs={true} className="text-center">
              {product?.optimizedImages?.map((image) => (
                <div key={image}>
                  <img
                    className="w-full h-[150px] md:h-[350px] object-contain"
                    src={`${baseUrl}${image}`}
                  />
                </div>
              ))}
            </Carousel>
          </div>
          {/*  1 - B */}
          <div className="w-full lg:w-1/2">
            <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-semibold sm:font-bold">
                {product.name}
              </h2>
              <span className="font-bold text-gray-500 px-1 py-0.5 border rounded-xs border-gray-400">{product.productSL}</span>
            </div>
            <p className="text-xs text-gray-500">
              Listed{" "}
              {formatDistanceToNow(product.createdAt, { addSuffix: true })}
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
            {product.isForSale ? (
              <div className="flex items-center gap-1 text-green-600 text-sm mt-2 font-semibold">
                <CheckCircle className="w-4 h-4" />
                <span>Available for Sale</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-500 text-sm mt-2 font-semibold">
                <XCircle className="w-4 h-4" />
                <span>Not for Sale</span>
              </div>
            )}
            {
              currentUser?.role === "ADMIN" && (
                <div className="mt-3">
                  {
                    product.isOnHold ? (
                      <span onClick={() => handleHoldProduct("REMOVE-HOLD")} className="text-sm font-semibold text-red-500 hover:text-red-700 underline cursor-pointer">Remove Hold</span>
                    ) : (
                      holdLoading ? (
                        <span className="text-sm text-amber-500">Loading...</span>
                      ) : (
                        <span onClick={() => handleHoldProduct("HOLD")} className="text-sm font-semibold text-green-500 hover:text-green-700 underline cursor-pointer">Hold Product</span>
                      )

                    )
                  }
                </div>
              )
            }

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
                    <p className="text-xs text-gray-600 mt-1 flex gap-2">
                      <span className="font-medium">Email Validity</span>
                      <span className={`text-xs`}>
                        {
                          !product.owner.isValidRuetMail ? (<span className="flex items-center gap-0.5 text-red-500">Not Valid <XCircle size={12} /> </span>) : (<span className="flex items-center gap-0.5 text-green-500">Valid <CheckCircle size={12} /></span>)
                        }
                      </span>
                    </p>
                    <p className="text-xs text-gray-600 mt-1 flex gap-2">
                      <span className="font-medium">Verification Status: </span>
                      <span className={`text-xs`}>
                        {
                          product.owner.isVerified !== "VERIFIED" ? (<span className="flex items-center gap-0.5 text-red-500">Not Verified <XCircle size={12} /> </span>) : (<span className="flex items-center gap-0.5 text-green-500">Verified <CheckCircle size={12} /></span>)
                        }
                      </span>
                    </p>
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">Security Score: </span>

                      {
                        product.owner.securityScore == "MID" ? <span
                          className={`text-xs ${securityScoreColor[product.owner.securityScore]
                            }`}
                        >
                          Normal
                        </span> : <span
                          className={`text-xs ${securityScoreColor[product.owner.securityScore]
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
                      }
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      <span className="font-medium">Suspended: </span>
                      <span className={`text-xs`}>
                        {product.owner.suspensionCount || 0} times
                      </span>
                    </p>
                    {/* <p className="text-xs text-gray-600 mt-1">
                      <span className="font-medium">
                        Total Rental Engagements:{" "}
                      </span>
                      <span className={`text-xs`}>
                        {product.owner._count.borrowedProducts +
                          product.owner._count.rentedOutProducts}
                      </span>
                    </p> */}
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
      <div className="w-full lg:w-1/3 lg:border-l border-gray-300 sm:my-7 px-4">
        <DaysDisplay
          numberOfDays={numberOfDays}
          price={price}
          range={range}
          setRange={setRange}
          initial={initial}
          final={final}
        />
        <div className="mt-8">
          <div className="mb-2">
            <h2 className="font-semibold text-gray-600">Credit Required: <span className={`text-green-800 font-bold ${coupon && "line-through"}`}>{product.secondHandPrice}  CC</span>{coupon && <span className={`text-purple-600 font-bold ml-1.5 text-xl`}>{product.secondHandPrice - discountedPrice.value}  CC <span className="text-xs font-light">{discountedPrice.ceil ? "ceiled" : "(floored)"}</span> </span>}</h2>
            {
              coupon && <span className="text-purple-500 text-sm">{coupon.discount}% discount applied🤩</span>
            }
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="coupon" className="text-lg font-bold text-gray-700">
                Enter Coupon{" "}
                <span className="text-sm font-medium">(If Applicable)</span>:
              </label>
              {
                couponCode && <p onClick={handleApplyCoupon} className="text-green-500 font-bold text-base mb-1 mr-1 cursor-pointer">Apply</p>
              }
            </div>
            <input
              type="text"
              name="coupon"
              id="coupon"
              onChange={(e) => setCouponCode(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-xs md:text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-1.5 md:p-2.5"
              placeholder="AF4K3LK3"
              required
            />
          </div>
        </div>
        {
          couponValidationError && <p className="text-sm text-red-500">{couponValidationError}</p>
        }
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
