const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const registrationSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true
    },

    firstName: {
        type: String,
        required: true,
        trim: true
    },

    lastName: {
        type: String,
        required: true,
        trim: true
    },

    dob: {
        type: Date,
        required: true
    },

    gender: {
        type: String,
        required: true
    },

    mobile: {
        type: String,
        required: true
    },

    alternateMobile: {
        type: String
    },

    contactEmail: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    address: {
        type: String,
        required: true
    },

    country: {
        type: String,
        required: true
    },

    state: {
        type: String,
        required: true
    },

    city: {
        type: String,
        required: true
    },

    pincode: {
        type: String,
        required: true
    },

    occupation: {
        type: String,
        required: true
    },

    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    password: {
        type: String,
        required: true
    },

    website: {
        type: String
    },

    linkedin: {
        type: String
    },

    terms: {
        type: Boolean,
        required: true
    }

}, { timestamps: true });


// Hash password before saving
registrationSchema.pre("save", async function () {

    if (!this.isModified("password")) {
        return;
    }

    this.password = await bcrypt.hash(this.password, 10);
});

const Registration = mongoose.model(
    "Registration",
    registrationSchema
);

module.exports = Registration;