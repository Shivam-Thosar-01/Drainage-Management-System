
import { useEffect, useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";

const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchComplaints = async () => {
    setLoading(true);

    try {
      const response = await API.get("/complaints/my-complaints");
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

  // Timeline stages
  const getTimelineSteps = (status) => {
    const stages = [
      {
        title: "Complaint Submitted",
        description: "Your complaint has been successfully registered.",
      },
      {
        title: "Work In Progress",
        description: "The officer is working on your complaint.",
      },
      {
        title: "Complaint Resolved",
        description: "The complaint has been marked as resolved.",
      },
    ];

    const currentStage =
      status === "Resolved" ? 2 :
      status === "In Progress" ? 1 : 0;

    return stages.map((stage, index) => ({
      ...stage,
      completed: index <= currentStage,
      current: index === currentStage,
    }));
  };

  const formatDate = (date) => {
    if (!date) return "Date not available";

    return new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading complaints...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              My Complaints
            </h1>

            <p className="text-gray-600 mt-2">
              Track your complaints and monitor their progress.
            </p>
          </div>

          <button
            onClick={fetchComplaints}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
          >
            Refresh
          </button>
        </div>

        {/* Complaint List */}
        {complaints.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-700">
              No Complaints Found
            </h2>

            <p className="text-gray-500 mt-2">
              You have not submitted any complaints yet.
            </p>
          </div>
        ) : (
          <div className="space-y-6">

            {complaints.map((complaint) => {
              const timeline = getTimelineSteps(complaint.status);

              return (
                <div
                  key={complaint._id}
                  className="bg-white rounded-xl shadow p-6"
                >

                  {/* Title and Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">
                        {complaint.title}
                      </h2>

                      <p className="text-sm text-gray-500 mt-1">
                        {complaint.category}
                      </p>
                    </div>

                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold w-fit ${getStatusStyle(
                        complaint.status
                      )}`}
                    >
                      {complaint.status}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 mt-4">
                    {complaint.description}
                  </p>

                  {/* Complaint Image */}
                  {complaint.image && (
                    <div className="mt-5 w-full">
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

                  {/* Complaint Information */}
                  <div className="border-t border-gray-200 mt-5 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">

                    <p className="text-gray-600">
                      <span className="font-semibold">Area: </span>
                      {complaint.area?.name || "Not assigned"}
                    </p>

                    <p className="text-gray-600">
                      <span className="font-semibold">Officer: </span>
                      {complaint.assignedOfficer?.name || "Not assigned"}
                    </p>

                    <p className="text-gray-600">
                      <span className="font-semibold">Submitted: </span>
                      {formatDate(complaint.createdAt)}
                    </p>

                    <p className="text-gray-600">
                      <span className="font-semibold">Deadline: </span>
                      {complaint.deadline
                        ? new Date(complaint.deadline).toLocaleDateString("en-IN")
                        : "Not set"}
                    </p>

                  </div>

                  {/* Complaint Tracking Timeline */}
                  <div className="border-t border-gray-200 mt-6 pt-5">

                    <h3 className="text-lg font-bold text-gray-800 mb-6">
                      Complaint Tracking
                    </h3>

                    <div className="relative ml-2">

                      {timeline.map((step, index) => (
                        <div
                          key={step.title}
                          className="relative flex gap-4 pb-8 last:pb-0"
                        >

                          {/* Timeline Line */}
                          {index !== timeline.length - 1 && (
                            <div
                              className={`absolute left-[11px] top-6 w-0.5 h-full ${
                                step.completed
                                  ? "bg-green-500"
                                  : "bg-gray-200"
                              }`}
                            />
                          )}

                          {/* Timeline Circle */}
                          <div className="relative z-10 shrink-0">
                            {step.completed ? (
                              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                                <span className="text-white text-sm">
                                  ✓
                                </span>
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-full border-2 border-gray-300 bg-white" />
                            )}
                          </div>

                          {/* Timeline Details */}
                          <div className="flex-1 -mt-0.5">
                            <div className="flex flex-wrap items-center gap-2">

                              <h4
                                className={`font-semibold ${
                                  step.completed
                                    ? "text-gray-800"
                                    : "text-gray-400"
                                }`}
                              >
                                {step.title}
                              </h4>

                              {step.current && (
                                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                                  Current Status
                                </span>
                              )}

                            </div>

                            <p className="text-sm text-gray-500 mt-1">
                              {step.description}
                            </p>

                            {index === 0 && (
                              <p className="text-xs text-gray-400 mt-2">
                                {formatDate(complaint.createdAt)}
                              </p>
                            )}

                          </div>

                        </div>
                      ))}

                    </div>

                    {/* <p className="text-xs text-gray-400 mt-4">
                      Timeline stages are based on the current complaint status.
                      Exact dates for status changes are not recorded yet.
                    </p> */}

                  </div>

                  {/* Officer Remarks */}
                  <div className="border-t border-gray-200 mt-5 pt-5">

                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Officer Updates & Remarks
                    </h3>

                    {!complaint.remarks ||
                    complaint.remarks.length === 0 ? (
                      <p className="text-gray-500 text-sm">
                        No updates from the officer yet.
                      </p>
                    ) : (
                      <div className="space-y-4">

                        {complaint.remarks.map((remark, index) => (
                          <div
                            key={remark._id || index}
                            className="border-l-4 border-blue-500 bg-gray-50 p-4 rounded-r-lg"
                          >
                            <p className="text-gray-700">
                              {remark.message}
                            </p>

                            <div className="flex flex-col sm:flex-row sm:justify-between gap-2 mt-3 text-xs text-gray-500">

                              <span>
                                Updated by:{" "}
                                {remark.updatedBy?.name || "Officer"}
                              </span>

                              <span>
                                {formatDate(remark.updatedAt)}
                              </span>

                            </div>
                          </div>
                        ))}

                      </div>
                    )}

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>
    </div>
  );
};

export default MyComplaints;
