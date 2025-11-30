import mongoose from "mongoose";

const sliderItemSchema = new mongoose.Schema(
        {
                title: {
                        type: String,
                        default: "",
                        trim: true,
                },
                subtitle: {
                        type: String,
                        default: "",
                        trim: true,
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

const SliderItem = mongoose.model("SliderItem", sliderItemSchema);

export default SliderItem;
