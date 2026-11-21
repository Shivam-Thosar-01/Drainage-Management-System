
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const OfficerDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [status, setStatus] = useState("Pending");
  const [deadline, setDeadline] = useState("");
  const [remarks, setRemarks] = useState("");
  const [updating, setUpdating] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Logout
  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/", { replace: true });
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  // Fetch Assigned Complaints
  const fetchComplaints = async () => {
    try {
      const response = await API.get("/officer/complaints");
      setComplaints(response.data.complaints || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load complaints"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // Open Complaint Management Form
  const handleManage = (complaint) => {
    setSelectedComplaintId(complaint._id);
    setStatus(complaint.status);
    setDeadline(
      complaint.deadline
        ? new Date(complaint.deadline).toISOString().slice(0, 10)
        : ""
    );
    setRemarks("");
  };

  // Update Complaint
  const handleUpdateComplaint = async (e) => {
    e.preventDefault();

    if (!selectedComplaintId) return;

    if (remarks.trim().length > 500) {
      toast.error("Remarks cannot exceed 500 characters");
      return;
    }

    setUpdating(true);

    try {
      const updateData = {
        status,
        remarks: remarks.trim(),
      };

      if (deadline) {
        updateData.deadline = deadline;
      }

      const response = await API.patch(
        `/officer/complaints/${selectedComplaintId}`,
        updateData
      );

      toast.success(
        response.data.message || "Complaint updated successfully"
      );

      setSelectedComplaintId(null);
      setRemarks("");

      await fetchComplaints();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update complaint"
      );
    } finally {
      setUpdating(false);
    }
  };

  // Status Styles
  const getStatusStyle = (value) => {
    switch (value) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Resolved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Check overdue deadline
  const isOverdue = (complaint) => {
    return (
      complaint.deadline &&
      new Date(complaint.deadline).getTime() < Date.now() &&
      complaint.status !== "Resolved"
    );
  };

  // Category options
  const categories = [
    "Drainage Blockage",
    "Water Overflow",
    "Damaged Drainage",
    "Water Leakage",
    "Other",
  ];

  // Filter Complaints
  const filteredComplaints = useMemo(() => {
    return complaints.filter((complaint) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        complaint.title?.toLowerCase().includes(searchText) ||
        complaint.description?.toLowerCase().includes(searchText) ||
        complaint.citizen?.name?.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "All" || complaint.status === statusFilter;

      const matchesCategory =
        categoryFilter === "All" ||
        complaint.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [complaints, search, statusFilter, categoryFilter]);

  // Statistics
  const totalCount = complaints.length;

  const pendingCount = complaints.filter(
    (c) => c.status === "Pending"
  ).length;

  const progressCount = complaints.filter(
    (c) => c.status === "In Progress"
  ).length;

  const resolvedCount = complaints.filter(
    (c) => c.status === "Resolved"
  ).length;

  const overdueCount = complaints.filter(isOverdue).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">
            Loading officer dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Officer Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Manage and monitor complaints assigned to your area.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-medium transition"
          >
            Logout
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">

          <div className="bg-white rounded-xl shadow-sm border-l-4 border-gray-500 p-5">
            <p className="text-gray-500 text-sm font-medium">
              Total Complaints
            </p>
            <h2 className="text-3xl font-bold text-gray-800 mt-2">
              {totalCount}
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow-sm border-l-4 border-yellow-500 p-5">
            <p className="text-gray-500 text-sm font-medium">
              Pending
            </p>
            <h2 className="text-3xl font-bold text-yellow-600 mt-2">
              {pendingCount}
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow-sm border-l-4 border-blue-500 p-5">
            <p className="text-gray-500 text-sm font-medium">
              In Progress
            </p>
            <h2 className="text-3xl font-bold text-blue-600 mt-2">
              {progressCount}
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow-sm border-l-4 border-green-500 p-5">
            <p className="text-gray-500 text-sm font-medium">
              Resolved
            </p>
            <h2 className="text-3xl font-bold text-green-600 mt-2">
              {resolvedCount}
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow-sm border-l-4 border-red-500 p-5">
            <p className="text-gray-500 text-sm font-medium">
              Overdue
            </p>
            <h2 className="text-3xl font-bold text-red-600 mt-2">
              {overdueCount}
            </h2>
          </div>

        </div>

        {/* Assigned Complaints */}
        <div className="bg-white rounded-xl shadow-sm p-5 sm:p-6">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Assigned Complaints
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Showing {filteredComplaints.length} of {totalCount} complaints
              </p>
            </div>

            <button
              onClick={fetchComplaints}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              Refresh
            </button>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, description or citizen..."
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

          </div>

          {/* Complaint List */}
          {filteredComplaints.length === 0 ? (
            <div className="text-center py-12 border border-dashed rounded-xl">
              <p className="text-gray-600 font-medium">
                {complaints.length === 0
                  ? "No complaints assigned to you yet."
                  : "No complaints match your search or filters."}
              </p>

              {(search || statusFilter !== "All" || categoryFilter !== "All") && (
                <button
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("All");
                    setCategoryFilter("All");
                  }}
                  className="mt-3 text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-5">

              {filteredComplaints.map((complaint) => (
                <div
                  key={complaint._id}
                  className={`border rounded-xl p-5 transition hover:shadow-md ${
                    isOverdue(complaint)
                      ? "border-red-300 bg-red-50/30"
                      : "border-gray-200"
                  }`}
                >

                  {/* Complaint Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">

                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {complaint.title}
                      </h3>

                      <p className="text-sm text-gray-500 mt-1">
                        {complaint.category}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusStyle(
                          complaint.status
                        )}`}
                      >
                        {complaint.status}
                      </span>

                      {isOverdue(complaint) && (
                        <span className="px-3 py-1.5 rounded-full text-sm font-semibold bg-red-100 text-red-700">
                          Overdue
                        </span>
                      )}
                    </div>

                  </div>

                  {/* Description */}
                  <p className="text-gray-600 mt-4 leading-relaxed whitespace-pre-wrap">
                    {complaint.description}
                  </p>

                  {/* Complaint Image */}
                  {complaint.image && (
                    <div className="mt-5">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">
                        Uploaded Complaint Image
                      </h3>

                      <div className="w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                        <img
                          src={`http://localhost:5000${complaint.image}`}
                          alt="Complaint"
                          className="block w-full h-auto max-h-[450px] object-contain"
                        />
                      </div>
                    </div>
                  )}

                  {/* Additional Details */}
                  <div className="border-t mt-5 pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">

                    <div>
                      <p className="text-gray-400 mb-1">Citizen</p>
                      <p className="text-gray-700 font-medium">
                        {complaint.citizen?.name || "Unknown"}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-400 mb-1">Area</p>
                      <p className="text-gray-700 font-medium">
                        {complaint.area?.name || "Unknown"}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-400 mb-1">Submitted</p>
                      <p className="text-gray-700 font-medium">
                        {new Date(complaint.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-400 mb-1">Deadline</p>
                      <p className={`font-medium ${
                        isOverdue(complaint) ? "text-red-600" : "text-gray-700"
                      }`}>
                        {complaint.deadline
                          ? new Date(complaint.deadline).toLocaleDateString()
                          : "Not set"}
                      </p>
                    </div>

                  </div>

                  {/* Manage Button */}
                  <div className="mt-5">
                    <button
                      onClick={() =>
                        selectedComplaintId === complaint._id
                          ? setSelectedComplaintId(null)
                          : handleManage(complaint)
                      }
                      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition"
                    >
                      {selectedComplaintId === complaint._id
                        ? "Close Form"
                        : "Manage Complaint"}
                    </button>
                  </div>

                  {/* Update Form */}
                  {selectedComplaintId === complaint._id && (
                    <form
                      onSubmit={handleUpdateComplaint}
                      className="mt-5 border-t pt-5 space-y-5"
                    >

                      <h3 className="text-lg font-semibold text-gray-800">
                        Update Complaint
                      </h3>

                      {/* Status */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Complaint Status
                        </label>

                        <select
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </div>

                      {/* Deadline */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Deadline
                        </label>

                        <input
                          type="date"
                          value={deadline}
                          min={new Date().toISOString().slice(0, 10)}
                          onChange={(e) => setDeadline(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Remarks */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Remarks
                        </label>

                        <textarea
                          value={remarks}
                          onChange={(e) => setRemarks(e.target.value)}
                          rows="3"
                          maxLength={500}
                          placeholder="Enter your remarks about this complaint..."
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />

                        <p className="text-xs text-gray-400 text-right mt-1">
                          {remarks.length}/500 characters
                        </p>
                      </div>

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={updating}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition"
                      >
                        {updating ? "Updating..." : "Save Changes"}
                      </button>

                    </form>
                  )}

                </div>
              ))}

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default OfficerDashboard;
