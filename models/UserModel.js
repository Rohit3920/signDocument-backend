const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            unique: true,
            trim: true,
            required: [true, "Please add a username"]
        },
        email: {
            type: String,
            unique: true,
            trim: true,
            required: [true, "Please add an email"],
            match: [/^.+@.+\..+$/, "Please enter a valid email"]
        },
        password: {
            type: String,
            required: [true, "Please add a password"],
            minlength: [6, "Password must be at least 6 characters long"],
            select: false
        }
    },
    { timestamps: true }
);


UserSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);