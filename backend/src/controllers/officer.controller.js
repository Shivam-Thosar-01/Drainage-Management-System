
import Complaint from "../models/complaint.model.js";
import Notification from "../models/notification.model.js";

// Get complaints assigned to the logged-in officer
export const getAssignedComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      assignedOfficer: req.user._id,
    })
      .populate("citizen", "name email")
      .populate("area", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Update complaint status, deadline and remarks
export const updateComplaint = async (req, res) => {
  try {
    const { status, deadline, remarks } = req.body;
    const { complaintId } = req.params;

    const complaint = await Complaint.findOne({
      _id: complaintId,
      assignedOfficer: req.user._id,
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found or not assigned to you",
      });
    }

    const notifications = [];

    // Status Update
    if (status && status !== complaint.status) {
      const validStatuses = [
        "Pending",
        "In Progress",
        "Resolved",
      ];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid complaint status",
        });
      }

      complaint.status = status;

      notifications.push({
        recipient: complaint.citizen,
        complaint: complaint._id,
        message: `Your complaint status has been changed to ${status}.`,
        type: "Status Update",
      });
    }

    // Deadline Update
    if (deadline) {
      const parsedDeadline = new Date(deadline);

      if (Number.isNaN(parsedDeadline.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid deadline",
        });
      }

      const oldDeadline = complaint.deadline
        ? new Date(complaint.deadline).getTime()
        : null;

      if (oldDeadline !== parsedDeadline.getTime()) {
        complaint.deadline = parsedDeadline;

        notifications.push({
          recipient: complaint.citizen,
          complaint: complaint._id,
          message: `The deadline for your complaint has been updated to ${parsedDeadline.toLocaleDateString()}.`,
          type: "Deadline Update",
        });
      }
    }

    // New Remark
    if (remarks && remarks.trim()) {
      const remarkMessage = remarks.trim();

      complaint.remarks.push({
        message: remarkMessage,
        updatedBy: req.user._id,
      });

      notifications.push({
        recipient: complaint.citizen,
        complaint: complaint._id,
        message: `The officer added a remark: ${remarkMessage}`,
        type: "New Remark",
      });
    }

    await complaint.save();

    // Save notifications only if there are actual updates
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    return res.status(200).json({
      success: true,
      message: "Complaint updated successfully",
      complaint,
    });

  } catch (error) {
    console.log("Update Complaint Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
