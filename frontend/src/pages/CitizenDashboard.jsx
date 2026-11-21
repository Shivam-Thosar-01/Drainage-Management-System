
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";

function CitizenDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);

  // Fetch Citizen Complaints
  const fetchComplaints = async () => {
    try {
      const response = await API.get("/complaints/my-complaints");
      setComplaints(response.data.complaints || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch Notifications
  const fetchNotifications = async () => {
    setNotificationLoading(true);

    try {
      const response = await API.get("/notifications");

      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to load notifications"
      );
    } finally {
      setNotificationLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
    fetchNotifications();
  }, []);

  // Mark One Notification as Read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await API.patch(`/notifications/${notificationId}/read`);

      setNotifications((previous) =>
        previous.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );

      setUnreadCount((previous) => Math.max(0, previous - 1));
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to mark notification as read"
      );
    }
  };

  // Mark All Notifications as Read
  const handleMarkAllAsRead = async () => {
    try {
      await API.patch("/notifications/mark-all-read");

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );

      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to update notifications"
      );
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully!");
      navigate("/", { replace: true });
    } catch (error) {
      toast.error("Logout failed. Please try again.");
    }
  };

  // Complaint Statistics
  const totalComplaints = complaints.length;

  const pendingComplaints = complaints.filter(
    (complaint) => complaint.status === "Pending"
  ).length;

  const inProgressComplaints = complaints.filter(
    (complaint) => complaint.status === "In Progress"
  ).length;

  const resolvedComplaints = complaints.filter(
    (complaint) => complaint.status === "Resolved"
  ).length;

  // Recent Complaints
  const recentComplaints = [...complaints]
    .sort(
      (a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
    )
    .slice(0, 5);

  // Status Styling
  const getStatusStyle = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-700";

      case "In Progress":
        return "bg-blue-100 text-blue-700";

      case "Resolved":
        return "bg-green-100 text-green-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Notification Icon Styling
  const getNotificationStyle = (type) => {
    switch (type) {
      case "Status Update":
        return "bg-blue-100 text-blue-700";

      case "Deadline Update":
        return "bg-yellow-100 text-yellow-700";

      case "New Remark":
        return "bg-purple-100 text-purple-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Format Date
  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatNotificationTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <nav className="bg-blue-700 text-white px-6 md:px-10 py-4 flex justify-between items-center shadow">
        <h1 className="text-lg md:text-xl font-bold">
          Drainage Management System
        </h1>

        <div className="flex items-center gap-3">

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications((previous) => !previous);
              }}
              className="relative bg-blue-600 hover:bg-blue-500 p-2.5 rounded-lg transition"
              aria-label="Notifications"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="23"
                height="23"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                <path d="M10 21h4" />
              </svg>

              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold min-w-5 h-5 px-1 rounded-full flex items-center justify-center">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-14 w-[min(90vw,380px)] bg-white text-gray-800 rounded-xl shadow-xl border z-50 overflow-hidden">

                <div className="flex justify-between items-center p-4 border-b">
                  <div>
                    <h3 className="font-bold text-lg">
                      Notifications
                    </h3>
                    <p className="text-xs text-gray-500">
                      {unreadCount} unread notifications
                    </p>
                  </div>

                  <button
                    onClick={fetchNotifications}
                    disabled={notificationLoading}
                    className="text-blue-600 text-sm hover:underline"
                  >
                    Refresh
                  </button>
                </div>

                {unreadCount > 0 && (
                  <div className="px-4 py-2 border-b text-right">
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-sm text-blue-600 hover:underline font-medium"
                    >
                      Mark all as read
                    </button>
                  </div>
                )}

                <div className="max-h-[400px] overflow-y-auto">

                  {notificationLoading ? (
                    <p className="p-6 text-center text-gray-500">
                      Loading notifications...
                    </p>
                  ) : notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-3xl mb-2">🔔</p>
                      <p className="font-medium text-gray-700">
                        No notifications yet
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Updates about your complaints will appear here.
                      </p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification._id}
                        className={`p-4 border-b last:border-0 ${
                          notification.isRead
                            ? "bg-white"
                            : "bg-blue-50"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-3">

                          <div className="min-w-0">
                            <span
                              className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getNotificationStyle(
                                notification.type
                              )}`}
                            >
                              {notification.type}
                            </span>

                            <p className="text-sm mt-2 break-words">
                              {notification.message}
                            </p>

                            {notification.complaint && (
                              <p className="text-xs text-gray-500 mt-2">
                                Complaint:{" "}
                                {notification.complaint.title}
                              </p>
                            )}

                            <p className="text-xs text-gray-400 mt-2">
                              {formatNotificationTime(
                                notification.createdAt
                              )}
                            </p>
                          </div>

                          {!notification.isRead && (
                            <button
                              onClick={() =>
                                handleMarkAsRead(notification._id)
                              }
                              className="text-blue-600 text-xs font-semibold hover:underline shrink-0"
                            >
                              Mark read
                            </button>
                          )}

                        </div>
                      </div>
                    ))
                  )}

                </div>
              </div>
            )}
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="bg-white text-blue-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Logout
          </button>

        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-5 md:px-8 py-10">

        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 rounded-2xl p-7 md:p-10 text-white shadow-lg">
          <p className="text-blue-100 text-sm font-medium">
            CITIZEN DASHBOARD
          </p>

          <h2 className="text-3xl md:text-4xl font-bold mt-3">
            Welcome, {user?.name || "Citizen"}!
          </h2>

          <p className="text-blue-100 mt-3 max-w-xl">
            Report drainage problems in your area, monitor complaint
            progress and stay updated on their resolution.
          </p>

          <button
            onClick={() => navigate("/citizen/submit-complaint")}
            className="mt-6 bg-white text-blue-700 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
          >
            + Submit New Complaint
          </button>
        </div>

        {/* Statistics */}
        <div className="mt-9">
          <h2 className="text-xl font-bold text-gray-800 mb-5">
            Complaint Overview
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

            <div className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-600">
              <p className="text-gray-500 font-medium">
                Total Complaints
              </p>
              <h3 className="text-3xl font-bold text-blue-600 mt-3">
                {loading ? "..." : totalComplaints}
              </h3>
              <p className="text-sm text-gray-400 mt-2">
                All submitted complaints
              </p>
            </div>

            <div className="bg-white rounded-xl shadow p-6 border-l-4 border-yellow-500">
              <p className="text-gray-500 font-medium">
                Pending
              </p>
              <h3 className="text-3xl font-bold text-yellow-600 mt-3">
                {loading ? "..." : pendingComplaints}
              </h3>
              <p className="text-sm text-gray-400 mt-2">
                Waiting for action
              </p>
            </div>

            <div className="bg-white rounded-xl shadow p-6 border-l-4 border-indigo-500">
              <p className="text-gray-500 font-medium">
                In Progress
              </p>
              <h3 className="text-3xl font-bold text-indigo-600 mt-3">
                {loading ? "..." : inProgressComplaints}
              </h3>
              <p className="text-sm text-gray-400 mt-2">
                Currently being handled
              </p>
            </div>

            <div className="bg-white rounded-xl shadow p-6 border-l-4 border-green-500">
              <p className="text-gray-500 font-medium">
                Resolved
              </p>
              <h3 className="text-3xl font-bold text-green-600 mt-3">
                {loading ? "..." : resolvedComplaints}
              </h3>
              <p className="text-sm text-gray-400 mt-2">
                Successfully completed
              </p>
            </div>

          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-10">
          <h2 className="text-xl font-bold text-gray-800 mb-5">
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition">
              <div className="bg-blue-100 text-blue-700 w-12 h-12 rounded-lg flex items-center justify-center text-2xl">
                +
              </div>

              <h3 className="text-xl font-bold text-gray-800 mt-4">
                Submit Complaint
              </h3>

              <p className="text-gray-500 mt-2">
                Report a new drainage blockage, water overflow
                or other drainage-related problem.
              </p>

              <button
                onClick={() => navigate("/citizen/submit-complaint")}
                className="mt-5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition"
              >
                Submit Now
              </button>
            </div>

            <div className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition">
              <div className="bg-green-100 text-green-700 w-12 h-12 rounded-lg flex items-center justify-center text-2xl">
                ☷
              </div>

              <h3 className="text-xl font-bold text-gray-800 mt-4">
                My Complaints
              </h3>

              <p className="text-gray-500 mt-2">
                View all your submitted complaints, check their
                current status and read officer remarks.
              </p>

              <button
                onClick={() => navigate("/citizen/my-complaints")}
                className="mt-5 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-medium transition"
              >
                View All Complaints
              </button>
            </div>

          </div>
        </div>

        {/* Recent Complaints */}
        <div className="mt-10 bg-white rounded-xl shadow p-6">

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Recent Complaints
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Your five most recently submitted complaints.
              </p>
            </div>

            <button
              onClick={() => navigate("/citizen/my-complaints")}
              className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
            >
              View All →
            </button>
          </div>

          {loading ? (
            <p className="text-gray-500 py-5">
              Loading complaints...
            </p>
          ) : recentComplaints.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">
                You haven't submitted any complaints yet.
              </p>

              <button
                onClick={() => navigate("/citizen/submit-complaint")}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
              >
                Submit Your First Complaint
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">

                <thead>
                  <tr className="border-b text-gray-500 text-sm">
                    <th className="py-3 px-3">Complaint</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {recentComplaints.map((complaint) => (
                    <tr
                      key={complaint._id}
                      className="border-b last:border-0 hover:bg-gray-50"
                    >
                      <td className="py-4 px-3 font-medium text-gray-800">
                        {complaint.title}
                      </td>

                      <td className="py-4 px-3 text-gray-600">
                        {complaint.category}
                      </td>

                      <td className="py-4 px-3 text-gray-600">
                        {formatDate(complaint.createdAt)}
                      </td>

                      <td className="py-4 px-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                            complaint.status
                          )}`}
                        >
                          {complaint.status}
                        </span>
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
}

export default CitizenDashboard;
