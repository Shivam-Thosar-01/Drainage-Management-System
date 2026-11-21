import mongoose from "mongoose";

const areaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    assignedOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

areaSchema.index(
  { assignedOfficer: 1 },
  {
    unique: true,
    partialFilterExpression: {
      assignedOfficer: { $type: "objectId" },
    },
  },
);

const Area = mongoose.model("Area", areaSchema);

export default Area;
