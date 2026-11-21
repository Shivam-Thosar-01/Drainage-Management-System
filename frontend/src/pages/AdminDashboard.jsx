
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [officers, setOfficers] = useState([]);
  const [areas, setAreas] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const [approvingId, setApprovingId] = useState(null);
  const [areaName, setAreaName] = useState("");
  const [creatingArea, setCreatingArea] = useState(false);

  // Logout
  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Logout request failed");
    } finally {
      navigate("/", { replace: true });
    }
  };

  // Fetch Dashboard Data
  const fetchDashboardData = async () => {
    try {
      const [
        officerResponse,
        areaResponse,
        analyticsResponse,
      ] = await Promise.all([
        API.get("/admin/pending-officers"),
        API.get("/admin/areas"),
        API.get("/admin/analytics"),
      ]);

      setOfficers(officerResponse.data.officers || []);
      setAreas(areaResponse.data.areas || []);
      setAnalytics(analyticsResponse.data.analytics || null);

    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to load admin dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Approve Officer
  const handleApprove = async (officerId) => {
    setApprovingId(officerId);

    try {
      const response = await API.patch(
        `/admin/approve-officer/${officerId}`
      );

      toast.success(
        response.data.message || "Officer approved successfully"
      );

      await fetchDashboardData();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to approve officer"
      );
    } finally {
      setApprovingId(null);
    }
  };

  // Create Area
  const handleCreateArea = async (e) => {
    e.preventDefault();

    if (!areaName.trim()) {
      return toast.error("Please enter an area name");
    }

    setCreatingArea(true);

    try {
      const response = await API.post("/admin/areas", {
        name: areaName.trim(),
      });

      toast.success(
        response.data.message || "Area created successfully"
      );

      setAreaName("");
      await fetchDashboardData();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to create area"
      );
    } finally {
      setCreatingArea(false);
    }
  };

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">
          Loading admin dashboard...
        </p>
      </div>
    );
  }

  const statusCounts = analytics?.statusCounts || {
    Pending: 0,
    "In Progress": 0,
    Resolved: 0,
  };

  const totalComplaints = analytics?.totalComplaints || 0;

  const getPercentage = (count) => {
    return totalComplaints
      ? Math.round((count / totalComplaints) * 100)
      : 0;
  };

  const getBarWidth = (count, maxCount) => {
    return maxCount
      ? `${(count / maxCount) * 100}%`
      : "0%";
  };

  const areaStats = analytics?.areaWise || [];
  const categoryStats = analytics?.categoryWise || [];

  const maxAreaCount = Math.max(
    ...areaStats.map((item) => item.count),
    0
  );

  const maxCategoryCount = Math.max(
    ...categoryStats.map((item) => item.count),
    0
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Admin Dashboard
            </h1>

            <p className="text-gray-600 mt-2">
              Manage officers and monitor municipal complaints.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-medium transition"
          >
            Logout
          </button>
        </div>

        {/* Complaint Statistics */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Complaint Overview
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">

          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-500">
              Total Complaints
            </p>
            <h2 className="text-3xl font-bold text-blue-600 mt-2">
              {totalComplaints}
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-500">
              Pending
            </p>
            <h2 className="text-3xl font-bold text-yellow-600 mt-2">
              {statusCounts.Pending}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {getPercentage(statusCounts.Pending)}% of total
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-500">
              In Progress
            </p>
            <h2 className="text-3xl font-bold text-blue-600 mt-2">
              {statusCounts["In Progress"]}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {getPercentage(statusCounts["In Progress"])}% of total
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-500">
              Resolved
            </p>
            <h2 className="text-3xl font-bold text-green-600 mt-2">
              {statusCounts.Resolved}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {getPercentage(statusCounts.Resolved)}% of total
            </p>
          </div>

        </div>

        {/* Resolution Rate */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold text-gray-800">
              Complaint Resolution Rate
            </h2>

            <span className="text-2xl font-bold text-green-600">
              {analytics?.resolutionRate || 0}%
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-green-500 h-4 rounded-full transition-all duration-500"
              style={{
                width: `${analytics?.resolutionRate || 0}%`,
              }}
            />
          </div>

          <p className="text-sm text-gray-500 mt-3">
            Percentage of total complaints successfully resolved.
          </p>
        </div>

        {/* Area-wise Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-5">
              Area-wise Complaints
            </h2>

            {areaStats.length === 0 ? (
              <p className="text-gray-500">
                No area-wise complaint data available.
              </p>
            ) : (
              <div className="space-y-5">
                {areaStats.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-700 font-medium capitalize">
                        {item.areaName}
                      </span>

                      <span className="text-gray-600 font-semibold">
                        {item.count}
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-blue-500 h-3 rounded-full"
                        style={{
                          width: getBarWidth(
                            item.count,
                            maxAreaCount
                          ),
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Category-wise Analytics */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-5">
              Category-wise Complaints
            </h2>

            {categoryStats.length === 0 ? (
              <p className="text-gray-500">
                No category-wise complaint data available.
              </p>
            ) : (
              <div className="space-y-5">
                {categoryStats.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between gap-3 mb-2">
                      <span className="text-gray-700 font-medium">
                        {item.category}
                      </span>

                      <span className="text-gray-600 font-semibold">
                        {item.count}
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-purple-500 h-3 rounded-full"
                        style={{
                          width: getBarWidth(
                            item.count,
                            maxCategoryCount
                          ),
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Administration Statistics */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Administration Overview
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">

          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-500">
              Pending Officers
            </p>

            <h2 className="text-3xl font-bold text-yellow-600 mt-2">
              {officers.length}
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-500">
              Total Areas
            </p>

            <h2 className="text-3xl font-bold text-blue-600 mt-2">
              {areas.length}
            </h2>
          </div>

        </div>

        {/* Create Area */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">

          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Create New Area
          </h2>

          <form
            onSubmit={handleCreateArea}
            className="flex flex-col sm:flex-row gap-3"
          >
            <input
              type="text"
              value={areaName}
              onChange={(e) => setAreaName(e.target.value)}
              placeholder="Enter area name"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="submit"
              disabled={creatingArea}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium"
            >
              {creatingArea ? "Creating..." : "Create Area"}
            </button>
          </form>

        </div>

        {/* Pending Officers */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">

          <h2 className="text-xl font-bold text-gray-800 mb-5">
            Pending Officer Approvals
          </h2>

          {officers.length === 0 ? (
            <p className="text-gray-500">
              No pending officer registrations.
            </p>
          ) : (
            <div className="space-y-4">

              {officers.map((officer) => (
                <div
                  key={officer._id}
                  className="border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >

                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {officer.name}
                    </h3>

                    <p className="text-sm text-gray-500">
                      {officer.email}
                    </p>

                    <p className="text-sm text-gray-600 mt-1">
                      Requested Area:{" "}
                      <span className="font-semibold">
                        {officer.area}
                      </span>
                    </p>
                  </div>

                  <button
                    onClick={() => handleApprove(officer._id)}
                    disabled={approvingId !== null}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-5 py-2 rounded-lg font-medium"
                  >
                    {approvingId === officer._id
                      ? "Approving..."
                      : "Approve Officer"}
                  </button>

                </div>
              ))}

            </div>
          )}

        </div>

        {/* Area Management */}
        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="text-xl font-bold text-gray-800 mb-5">
            Area Management
          </h2>

          {areas.length === 0 ? (
            <p className="text-gray-500">
              No areas registered yet.
            </p>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full text-left">
                <thead>
                  <tr className="border-b text-gray-600">
                    <th className="py-3 px-3">
                      Area Name
                    </th>

                    <th className="py-3 px-3">
                      Assigned Officer
                    </th>

                    <th className="py-3 px-3">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {areas.map((area) => (
                    <tr
                      key={area._id}
                      className="border-b"
                    >
                      <td className="py-3 px-3 font-medium text-gray-800 capitalize">
                        {area.name}
                      </td>

                      <td className="py-3 px-3 text-gray-600">
                        {area.assignedOfficer?.name ||
                          "Not assigned"}
                      </td>

                      <td className="py-3 px-3">
                        {area.assignedOfficer ? (
                          <span className="text-green-600 font-medium">
                            Assigned
                          </span>
                        ) : (
                          <span className="text-yellow-600 font-medium">
                            Unassigned
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
