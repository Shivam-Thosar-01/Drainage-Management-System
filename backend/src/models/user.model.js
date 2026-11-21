
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["citizen", "officer", "admin"],
      required: true,
    },

    area: {
      type: String,
      default: null,
    },

    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

userSchema.index(
  { area: 1 },
  {
    unique: true,
    partialFilterExpression: {
      role: "officer",
      area: { $type: "string" },
    },
  }
);

userSchema.index(
  { role: 1 },
  {
    unique: true,
    partialFilterExpression: {
      role: "admin",
    },
  }
);

const User = mongoose.model("User", userSchema);

export default User;
