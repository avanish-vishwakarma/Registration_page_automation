const express = require("express");
const router = express.Router();

const bcrypt = require("bcryptjs");
const Registration = require("../models/Registration");

// POST API - Register User

router.post("/register", async (req, res) => {
    try {
        // 1. Extract data from request body
        const {
            title,
            firstName,
            lastName,
            dob,
            gender,
            mobile,
            alternateMobile,
            contactEmail,
            address,
            country,
            state,
            city,
            pincode,
            occupation,
            username,
            password,
            website,
            linkedin,
            terms
        } = req.body || {};

        // 2. Basic required field validation
        const requiredFields = {
            firstName,
            lastName,
            dob,
            gender,
            mobile,
            contactEmail,
            username,
            password
        };

        const missingFields = Object.entries(requiredFields)
            .filter(([key, value]) =>
                typeof value !== "string" || !value.trim()
            )
            .map(([key]) => key);

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields.",
                missingFields
            });
        }

        // 3. Validate terms and conditions
        if (terms !== true) {
            return res.status(400).json({
                success: false,
                message: "Please accept terms and conditions."
            });
        }

        // 4. Normalize input
        const normalizedEmail = contactEmail.trim().toLowerCase();
        const normalizedUsername = username.trim().toLowerCase();

        // 5. Check duplicate email and username
        const existingUser = await Registration.findOne({
            $or: [
                { contactEmail: normalizedEmail },
                { username: normalizedUsername }
            ]
        });

        if (existingUser) {

            if (existingUser.contactEmail === normalizedEmail) {
                return res.status(409).json({
                    success: false,
                    field: "contactEmail",
                    message: "Email already registered."
                });
            }

            if (existingUser.username === normalizedUsername) {
                return res.status(409).json({
                    success: false,
                    field: "username",
                    message: "Username already registered."
                });
            }
        }

        // 6. Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // 7. Create registration document
        const newRegistration = new Registration({
            title,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            dob,
            gender,
            mobile,
            alternateMobile,
            contactEmail: normalizedEmail,
            address,
            country,
            state,
            city,
            pincode,
            occupation,
            username: normalizedUsername,
            password: hashedPassword,
            website,
            linkedin,
            terms
        });

        // 8. Save in MongoDB
        await newRegistration.save();

        // 9. Send success response
        return res.status(201).json({
            success: true,
            message: "Registration successful!"
        });

    } catch (error) {

        console.error("Registration Error:", error);

        // Handle MongoDB duplicate key error
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern || {})[0];

            return res.status(409).json({
                success: false,
                field,
                message: `${field || "Field"} already registered.`
            });
        }

        // Server error
        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
});

// GET API - Fetch All Registered Users
router.get("/users", async (req, res) => {
    try {

        // 1. Get page and limit from URL
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 5;


        const skip = (page - 1) * limit;

        // 3. Count total users
        const totalUsers = await Registration.countDocuments();

        // 4. Fetch users for current page
        const users = await Registration.find()
            .select("-password")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // 5. Calculate total pages
        const totalPages = Math.ceil(totalUsers / limit);

        return res.status(200).json({
            success: true,
            users: users,
            currentPage: page,
            totalUsers: totalUsers,
            totalPages: totalPages
        });

    } catch (error) {

        console.error("Fetch Users Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch users."
        });
    }
});

// DELETE USER API
router.delete("/users/:id", async (req, res) => {
    try {
        const user = await Registration.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });

    } catch (error) {
        console.error("Delete User Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete user"
        });
    }
});

// UPDATE USER API

router.put("/users/:id", async (req, res) => {
    try {
        // 1. Find existing user
        const existingUser = await Registration.findById(req.params.id);

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // 2. Allowed fields
        const allowedFields = [
            "title",
            "firstName",
            "lastName",
            "dob",
            "gender",
            "mobile",
            "alternateMobile",
            "contactEmail",
            "address",
            "country",
            "state",
            "city",
            "pincode",
            "occupation",
            "username",
            "website",
            "linkedin",
            "terms"
        ];

        // 3. Prepare update data
        const updateData = {};

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        // 4. Preserve existing State and City
        if (!updateData.state || !updateData.state.trim()) {
            updateData.state = existingUser.state;
        }

        if (!updateData.city || !updateData.city.trim()) {
            updateData.city = existingUser.city;
        }

        // 5. Update user
        const updatedUser = await Registration.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            {
                returnDocument: "after",
                runValidators: true
            }
        ).select("-password");

        return res.status(200).json({
            success: true,
            message: "User updated successfully!",
            user: updatedUser
        });

    } catch (error) {
        console.error("Update User Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


// Export Router
module.exports = router;
