
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";

const SubmitComplaint = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    area: "",
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

  // Create and clean up image preview URL
  useEffect(() => {
    if (!image) {
      setPreview("");
      return;
    }

    const imageURL = URL.createObjectURL(image);
    setPreview(imageURL);

    return () => URL.revokeObjectURL(imageURL);
  }, [image]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const selectedImage = e.target.files[0];

    if (!selectedImage) return;

    if (!selectedImage.type.startsWith("image/")) {
      toast.error("Please select a valid image");
      e.target.value = "";
      return;
    }

    if (selectedImage.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5 MB");
      e.target.value = "";
      return;
    }

    setImage(selectedImage);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Create FormData for text fields and image
      const complaintData = new FormData();

      complaintData.append("title", formData.title);
      complaintData.append("description", formData.description);
      complaintData.append("category", formData.category);
      complaintData.append("area", formData.area);

      if (image) {
        complaintData.append("image", image);
      }

      const response = await API.post(
        "/complaints/create",
        complaintData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success(
        response.data.message || "Complaint submitted successfully"
      );

      setFormData({
        title: "",
        description: "",
        category: "",
        area: "",
      });

      setImage(null);
      e.target.reset();

    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to submit complaint"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto max-w-2xl rounded-xl bg-white p-8 shadow-md">

        <button
          onClick={() => navigate("/citizen/dashboard")}
          className="mb-6 text-sm font-medium text-blue-600 hover:underline"
        >
          ← Back to Dashboard
        </button>

        <h1 className="mb-2 text-2xl font-bold text-gray-800">
          Submit a Complaint
        </h1>

        <p className="mb-8 text-sm text-gray-500">
          Provide the details of your drainage-related problem.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Complaint Title
            </label>

            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter complaint title"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Description
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your drainage problem..."
              rows="4"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Complaint Category
            </label>

            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="">Select category</option>
              <option value="Drainage Blockage">Drainage Blockage</option>
              <option value="Water Overflow">Water Overflow</option>
              <option value="Damaged Drainage">Damaged Drainage</option>
              <option value="Water Leakage">Water Leakage</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Area
            </label>

            <input
              type="text"
              name="area"
              value={formData.area}
              onChange={handleChange}
              placeholder="Enter your registered area name"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />

            <p className="mt-1 text-xs text-gray-500">
              Enter the area name exactly as registered by the admin.
            </p>
          </div>

          {/* Image Upload */}
          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Upload Complaint Image (Optional)
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full rounded-lg border border-gray-300 p-3 text-sm"
            />

            <p className="mt-1 text-xs text-gray-500">
              Supported image files. Maximum size: 5 MB.
            </p>

            {preview && (
              <div className="mt-4">
                <p className="mb-2 text-sm font-medium text-gray-700">
                  Image Preview
                </p>

                <img
                  src={preview}
                  alt="Complaint preview"
                  className="h-48 w-full rounded-lg border object-cover"
                />

                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                  }}
                  className="mt-2 text-sm font-medium text-red-600 hover:underline"
                >
                  Remove Image
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Submitting..." : "Submit Complaint"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default SubmitComplaint;
