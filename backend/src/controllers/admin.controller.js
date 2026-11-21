
import Area from "../models/area.model.js";
import User from "../models/user.model.js";
import Complaint from "../models/complaint.model.js";

// Create new municipal area
export const createArea = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Area name is required",
      });
    }

    const areaName = name.trim().toLowerCase();

    const existingArea = await Area.findOne({ name: areaName });

    if (existingArea) {
      return res.status(409).json({
        success: false,
        message: "Area already exists",
      });
    }

    const area = await Area.create({
      name: areaName,
    });

    return res.status(201).json({
      success: true,
      message: "Area created successfully",
      area,
    });

  } catch (error) {
    console.log("Create Area Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// Get all municipal areas
export const getAreas = async (req, res) => {
  try {
    const areas = await Area.find()
      .populate("assignedOfficer", "name email");

    return res.status(200).json({
      success: true,
      areas,
    });

  } catch (error) {
    console.log("Get Areas Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// Get pending officer registrations
export const getPendingOfficers = async (req, res) => {
  try {
    const officers = await User.find({
      role: "officer",
      isApproved: false,
    }).select("-password");

    return res.status(200).json({
      success: true,
      officers,
    });

  } catch (error) {
    console.log("Get Pending Officers Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// Approve officer and assign area
export const approveOfficer = async (req, res) => {
  let assignedArea = null;

  try {
    const { officerId } = req.params;

    const officer = await User.findOne({
      _id: officerId,
      role: "officer",
      isApproved: false,
    });

    if (!officer) {
      return res.status(404).json({
        success: false,
        message: "Pending officer not found",
      });
    }

    // Find the area selected by officer during signup
    const area = await Area.findOne({
      name: officer.area,
    });

    if (!area) {
      return res.status(404).json({
        success: false,
        message: "Officer's selected area does not exist. Create the area first.",
      });
    }

    // Atomically reserve the area for this officer
    assignedArea = await Area.findOneAndUpdate(
      {
        _id: area._id,
        assignedOfficer: null,
      },
      {
        $set: { assignedOfficer: officer._id },
      },
      { new: true }
    );

    if (!assignedArea) {
      return res.status(409).json({
        success: false,
        message: "This area already has a main officer",
      });
    }

    // Approve officer
    officer.isApproved = true;
    await officer.save();

    return res.status(200).json({
      success: true,
      message: "Officer approved and assigned successfully",
      officer: {
        id: officer._id,
        name: officer.name,
        email: officer.email,
        area: officer.area,
        isApproved: officer.isApproved,
      },
    });

  } catch (error) {
    // Release area if officer approval fails
    if (assignedArea) {
      await Area.updateOne(
        { _id: assignedArea._id, assignedOfficer: assignedArea.assignedOfficer },
        { $set: { assignedOfficer: null } }
      );
    }

    console.log("Approve Officer Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// Get complaint analytics for admin dashboard
export const getComplaintAnalytics = async (req, res) => {
  try {
    const [
      totalComplaints,
      statusStats,
      areaStats,
      categoryStats,
    ] = await Promise.all([
      Complaint.countDocuments(),

      Complaint.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),

      Complaint.aggregate([
        {
          $group: {
            _id: "$area",
            count: { $sum: 1 },
          },
        },
      ]),

      Complaint.aggregate([
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    // Prepare status counts
    const statusCounts = {
      Pending: 0,
      "In Progress": 0,
      Resolved: 0,
    };

    statusStats.forEach((item) => {
      statusCounts[item._id] = item.count;
    });

    // Calculate resolution percentage
    const resolutionRate = totalComplaints
      ? Math.round(
          (statusCounts.Resolved / totalComplaints) * 100
        )
      : 0;

    // Get area names
    const areaIds = areaStats
      .map((item) => item._id)
      .filter(Boolean);

    const areas = await Area.find({
      _id: { $in: areaIds },
    }).select("name").lean();

    const areaMap = new Map(
      areas.map((area) => [
        area._id.toString(),
        area.name,
      ])
    );

    const areaWise = areaStats.map((item) => ({
      areaName: item._id
        ? areaMap.get(item._id.toString()) || "Unknown Area"
        : "Unassigned",
      count: item.count,
    }));

    const categoryWise = categoryStats.map((item) => ({
      category: item._id || "Uncategorized",
      count: item.count,
    }));

    return res.status(200).json({
      success: true,
      analytics: {
        totalComplaints,
        statusCounts,
        resolutionRate,
        areaWise,
        categoryWise,
      },
    });

  } catch (error) {
    console.log("Complaint Analytics Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch complaint analytics",
    });
  }
};
