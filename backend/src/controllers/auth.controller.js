import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Signup Controller
export const signup = async (req, res) => {
  try {
    const { name, email, password, role, area, adminKey } = req.body;

    // Check required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    // Validate role
    if (!["citizen", "officer", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    // Admin secret key verification
    if (role === "admin") {
      if (
        !process.env.ADMIN_SIGNUP_KEY ||
        adminKey !== process.env.ADMIN_SIGNUP_KEY
      ) {
        return res.status(403).json({
          success: false,
          message: "Invalid admin registration key",
        });
      }
    }

    // Officer must select an area
    if (role === "officer" && !area?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Area is required for officers",
      });
    }

    // Check existing email
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      area: role === "officer" ? area.trim().toLowerCase() : null,
      isApproved: role === "citizen",
    });

    return res.status(201).json({
      success: true,
      message:
        role === "officer"
          ? "Officer registration submitted for approval"
          : `${role} registered successfully`,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        area: newUser.area,
        isApproved: newUser.isApproved,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "This email, officer area, or admin account is already registered",
      });
    }

    console.log("Signup Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Login Controller
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check officer approval
    if (user.role === "officer" && !user.isApproved) {
      return res.status(403).json({
        success: false,
        message: "Your officer account is awaiting approval",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    // Store token in cookie
    res.cookie("Token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        area: user.area,
      },
    });
  } catch (error) {
    console.log("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get currently logged-in user
export const getCurrentUser = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      area: req.user.area,
    },
  });
};

// Logout user
export const logout = async (req, res) => {
  res.clearCookie("Token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

// import User from "../models/user.model.js";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";

// // Generate JWT token
// const generateToken = (userId) => {
//     return jwt.sign(
//         { id: userId },
//         process.env.JWT_SECRET,
//         { expiresIn: "7d" }
//     );
// };

// // Cookie settings
// const cookieOptions = {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "lax",
//     maxAge: 7 * 24 * 60 * 60 * 1000
// };

// // Signup User
// export const register = async (req, res) => {
//     try {
//         const { name, email, password, phone } = req.body;

//         if (!name || !email || !password || !phone) {
//             return res.status(400).json({
//                 success: false,
//                 message: "All fields are required"
//             });
//         }

//         if (password.length < 6) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Password must contain at least 6 characters"
//             });
//         }

//         const existingUser = await User.findOne({
//             email: email.toLowerCase().trim()
//         });

//         if (existingUser) {
//             return res.status(409).json({
//                 success: false,
//                 message: "Email already registered"
//             });
//         }

//         const hashedPassword = await bcrypt.hash(password, 10);

//         const user = await User.create({
//             name,
//             email,
//             password: hashedPassword,
//             phone,
//             role: "citizen"
//         });

//         const token = generateToken(user._id);

//         res.cookie("Token", token, cookieOptions);

//         return res.status(201).json({
//             success: true,
//             message: "Citizen registered successfully",
//             user: {
//                 id: user._id,
//                 name: user.name,
//                 email: user.email,
//                 role: user.role
//             }
//         });

//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };

// // Login
// export const login = async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         if (!email || !password) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Email and password are required"
//             });
//         }

//         const user = await User.findOne({
//             email: email.toLowerCase().trim()
//         });

//         if (!user || !user.isActive) {
//             return res.status(401).json({
//                 success: false,
//                 message: "Invalid email or password"
//             });
//         }

//         const isPasswordCorrect = await bcrypt.compare(
//             password,
//             user.password
//         );

//         if (!isPasswordCorrect) {
//             return res.status(401).json({
//                 success: false,
//                 message: "Invalid email or password"
//             });
//         }

//         const token = generateToken(user._id);

//         res.cookie("Token", token, cookieOptions);

//         return res.status(200).json({
//             success: true,
//             message: "Login successful",
//             user: {
//                 id: user._id,
//                 name: user.name,
//                 email: user.email,
//                 role: user.role
//             }
//         });

//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };

// // Logout
// export const logout = (req, res) => {
//     res.clearCookie("Token", {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         sameSite: "lax"
//     });

//     return res.status(200).json({
//         success: true,
//         message: "Logged out successfully"
//     });
// };
