import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema(
        {
                name: {
                        type: String,
                        required: true,
                        trim: true,
                },
                slug: {
                        type: String,
                        required: true,
                        unique: true,
                        trim: true,
                },
                description: {
                        type: String,
                        default: "",
                },
                imageUrl: {
                        type: String,
                        required: true,
                },
                imageFileId: {
                        type: String,
                        default: null,
                },
                imagePublicId: {
                        type: String,
                        default: null,
                },
                order: {
                        type: Number,
                        default: null,
                },
                isActive: {
                        type: Boolean,
                        default: true,
                },
        },
        { timestamps: true }
);

const Section = mongoose.model("Section", sectionSchema);

export default Section;
