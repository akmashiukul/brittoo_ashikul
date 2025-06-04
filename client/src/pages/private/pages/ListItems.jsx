import { Plus, Upload, X } from "lucide-react";
import { useState } from "react";

const ListItems = () => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    productType: "",
    productCondition: "",
    productAge: "",
    tags: "",
    omv: "",
    description: "",
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const total = selectedImages.length + files.length;

    if (total <= 4) {
      const filesWithPreview = files.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));

      setSelectedImages((prev) => [...prev, ...filesWithPreview]);
    } else {
      alert("You can only upload up to 4 images in total.");
    }
  };

  const deleteImage = (indexToDelete) => {
    setSelectedImages((prevImages) => {
      URL.revokeObjectURL(prevImages[indexToDelete].preview);
      return prevImages.filter((_, index) => index !== indexToDelete);
    });
  };

  return (
    <div className="p-4 md:p-10">
      <div>
        <h1 className="text-lg sm:text-2xl font-semibold text-gray-800">
          List Your Items & Start Earning 🤑
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          So you don&apos;t have to survive on only shingara from the tong.
        </p>
      </div>
      <form className="mt-8 flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-4">
          <div>
            {selectedImages.length > 0 ? (
              <div className="flex items-center justify-center">
                <div className="grid grid-cols-2 gap-2 border border-gray-300 rounded-md p-4">
                  {selectedImages.map((img, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={img.preview}
                        alt={`preview-${idx}`}
                        className="object-cover rounded-md border border-gray-500 h-28 md:h-40"
                      />
                      <button
                        type="button"
                        onClick={() => deleteImage(idx)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors cursor-pointer"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}

                  {selectedImages.length < 4 && (
                    <label
                      htmlFor="File"
                      className={`flex flex-col  h-28 md:h-40 items-center justify-center rounded md:border md:border-gray-300 p-4 text-gray-900 shadow-sm sm:p-6 cursor-pointer hover:bg-gray-100`}
                    >
                      <Plus size={32} />
                      <input
                        multiple
                        type="file"
                        id="File"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="sr-only"
                      />
                    </label>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center md:border rounded-2xl md:border-gray-200 md:bg-gray-50 h-full">
                <label
                  htmlFor="File"
                  className={`flex flex-col max-w-sm items-center rounded border border-gray-300 p-4 text-gray-900 shadow-sm sm:p-6 cursor-pointer`}
                >
                  <Upload />
                  <span className="mt-4 font-medium gap-2">
                    Upload Product Images
                    <span className="text-[11px]">(max 4)</span>
                  </span>
                  <span className="mt-2 inline-block rounded border border-gray-200 bg-gray-50 px-3 py-1.5 text-center text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-200">
                    Browse files
                  </span>
                  <input
                    multiple
                    type="file"
                    id="File"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="sr-only"
                  />
                </label>
              </div>
            )}
          </div>
          <div className="flex w-full flex-col gap-3 flex-1">
            <label htmlFor="name" className="flex flex-col gap-1.5 w-full">
              <span className="text-sm font-medium text-gray-700">
                Item Name
              </span>
              <input
                type="name"
                id="name"
                className="border bg-white border-gray-300 rounded-md w-full px-2 py-2 md:py-3 p md:px-4 focus:border-gray-400 focus:outline-none text-xs md:text-sm"
                placeholder="Name of your product.."
              />
            </label>
            <label
              htmlFor="productType"
              className="flex flex-col gap-1.5 w-full"
            >
              <span className="text-sm font-medium text-gray-700">
                Select Item Type
              </span>
              <select
                name="productType"
                id="productType"
                className="border bg-white border-gray-300 rounded-md w-full px-2 py-2 md:py-3 p md:px-4 focus:border-gray-400 focus:outline-none text-xs md:text-sm"
              >
                <option value="">Please select</option>
                <option value="GADGET">Gadget</option>
                <option value="FURNITURE">Furniture</option>
                <option value="VEHICLE">Vehicle</option>
                <option value="STATIONARY">Stationary</option>
                <option value="MUSICAL_INSTRUMENT">Musical Instrument</option>
                <option value="CLOTHING">Clothing/Footwear</option>
                <option value="BOOK">Book</option>
                <option value="ELECTRONICS">Electronics</option>
                <option value="APARTMENTS">Apartments</option>
              </select>
            </label>
            <label htmlFor="omv" className="flex flex-col gap-1.5 w-full">
              <span className="text-sm font-medium text-gray-700">
                Original Market Price
              </span>
              <input
                type="number"
                id="omv"
                className="border bg-white border-gray-300 rounded-md w-full px-2 py-2 md:py-3 p md:px-4 focus:border-gray-400 focus:outline-none text-xs md:text-sm"
                placeholder="At what price was this product bought?"
              />
            </label>
            <label
              htmlFor="productCondition"
              className="flex flex-col gap-1.5 w-full"
            >
              <span className="text-sm font-medium text-gray-700">
                ⚖️ Product Condition
              </span>
              <select
                name="productCondition"
                id="productCondition"
                className="border bg-white border-gray-300 rounded-md w-full px-2 py-2 md:py-3 p md:px-4 focus:border-gray-400 focus:outline-none text-xs md:text-sm"
              >
                <option value="">Please select</option>
                <option value="new">✨ New</option>
                <option value="like-new">🌟 Like New</option>
                <option value="good">👍 Good</option>
                <option value="fair">👌 Fair</option>
                <option value="poor">😔 Poor</option>
              </select>
            </label>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <label htmlFor="productAge" className="flex flex-col gap-1.5 w-full">
            <span className="text-sm font-medium text-gray-700">
              📅 Age of the Item (Approx.)
            </span>
            <select
              name="productAge"
              id="productAge"
              className="border bg-white border-gray-300 rounded-md w-full px-2 py-2 md:py-3 p md:px-4 focus:border-gray-400 focus:outline-none text-xs md:text-sm"
            >
              <option value="">Please select</option>
              <option value="1"> Less than 1 year</option>
              <option value="2"> Less than 2 years</option>
              <option value="3"> Less than 3 years</option>
              <option value="5"> Less than 5 years</option>
              <option value="8"> Less than 8 years</option>
              <option value="10"> Less than 10 years</option>
            </select>
          </label>
        </div>
        <label htmlFor="tags" className="flex flex-col gap-1.5 w-full">
          <span className="text-sm font-medium text-gray-700">
            Add Tags (Comma ',' separated values)
          </span>
          <input
            type="text"
            id="tags"
            className="border bg-white border-gray-300 rounded-md w-full px-2 py-2 md:py-3 p md:px-4 focus:border-gray-400 focus:outline-none text-xs md:text-sm"
            placeholder="e.g.  gadget,electronics,arduino,uno,project"
          />
        </label>
        <label htmlFor="description" className="flex flex-col gap-1.5 w-full">
          <span className="text-sm font-medium text-gray-700">Description</span>
          <textarea
            type="text"
            id="description"
            className="border h-24 bg-white border-gray-300 rounded-md w-full px-2 py-2 md:py-3 p md:px-4 focus:border-gray-400 focus:outline-none text-xs md:text-sm"
            placeholder="Say something about the product..."
          />
        </label>
      </form>
    </div>
  );
};

export default ListItems;
