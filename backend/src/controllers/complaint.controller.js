
import Complaint from "../models/complaint.model.js";
import Area from "../models/area.model.js";

// Submit new complaint
export const createComplaint = async (req, res) => {
  try {
    const { title, description, category, area } = req.body;

    // Validate required fields
    if (!title || !description || !category || !area) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Find selected area
    const selectedArea = await Area.findOne({
      name: area.trim().toLowerCase(),
    });

    if (!selectedArea) {
      return res.status(404).json({
        success: false,
        message: "Selected area does not exist",
      });
    }

    // Check assigned officer
    if (!selectedArea.assignedOfficer) {
      return res.status(400).json({
        success: false,
        message: "No officer is currently assigned to this area",
      });
    }

    // Get uploaded image path
    const image = req.file
      ? `/uploads/complaints/${req.file.filename}`
      : "";

    // Create complaint
    const complaint = await Complaint.create({
      title,
      description,
      category,
      image,
      citizen: req.user._id,
      area: selectedArea._id,
      assignedOfficer: selectedArea.assignedOfficer,
    });

    return res.status(201).json({
      success: true,
      message: "Complaint submitted successfully",
      complaint,
    });

  } catch (error) {
    console.log("Create Complaint Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// Get citizen's own complaints
export const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      citizen: req.user._id,
    })
      .populate("area", "name")
      .populate("assignedOfficer", "name email")
      .populate("remarks.updatedBy", "name role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: complaints.length,
      complaints,
    });

  } catch (error) {
    console.log("Get My Complaints Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// Get details of a single complaint belonging to the logged-in citizen
export const getComplaintById = async (req, res) => {
  try {
    const { complaintId } = req.params;

    const complaint = await Complaint.findOne({
      _id: complaintId,
      citizen: req.user._id,
    })
      .populate("area", "name")
      .populate("assignedOfficer", "name email")
      .populate("remarks.updatedBy", "name role");

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    return res.status(200).json({
      success: true,
      complaint,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
