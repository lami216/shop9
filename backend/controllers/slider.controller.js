import sharp from "sharp";
import SliderItem from "../models/slider.model.js";
import { uploadImage, deleteImage } from "../lib/imagekit.js";

const createHttpError = (status, message) => {
        const error = new Error(message);
        error.status = status;
        return error;
};

const parseString = (value) => (typeof value === "string" ? value.trim() : "");

const ensureUploadResult = (uploadResult) => {
        if (!uploadResult?.url) {
                throw createHttpError(500, "Failed to upload slider image");
        }

        return {
                url: String(uploadResult.url),
                fileId: uploadResult.fileId ? String(uploadResult.fileId) : null,
        };
};

const parseDataUrl = (dataUrl) => {
        if (typeof dataUrl !== "string") return null;

        const matches = dataUrl.match(/^data:(.+);base64,(.*)$/);
        if (!matches) return null;

        const [, mimeType, base64Data] = matches;
        return {
                buffer: Buffer.from(base64Data, "base64"),
                mimeType: mimeType || "image/jpeg",
        };
};

const mimeToExtension = (mimeType = "") => {
        const match = mimeType.match(/^[^\/]+\/([a-z0-9+.-]+)/i);
        return match?.[1]?.replace(/\+xml$/i, "") || "jpg";
};

const processSliderImage = async (imageDataUrl) => {
        const parsed = parseDataUrl(imageDataUrl);
        if (!parsed) {
                throw createHttpError(400, "Invalid slider image data");
        }

        const { buffer: originalBuffer, mimeType } = parsed;
        const extension = mimeToExtension(mimeType);
        const minThreshold = 300 * 1024;
        const maxThreshold = 1024 * 1024;

        if (originalBuffer.length <= minThreshold) {
                return { buffer: originalBuffer, extension };
        }

        try {
                let optimizedBuffer = await sharp(originalBuffer)
                        .rotate()
                        .resize({ width: 1200, withoutEnlargement: true })
                        .jpeg({ quality: 70 })
                        .toBuffer();

                if (optimizedBuffer.length > maxThreshold) {
                        optimizedBuffer = await sharp(originalBuffer)
                                .rotate()
                                .resize({ width: 1200, withoutEnlargement: true })
                                .jpeg({ quality: 60 })
                                .toBuffer();
                }

                return { buffer: optimizedBuffer, extension: "jpeg" };
        } catch (compressionError) {
                console.log("Image compression failed, fallback to original", compressionError.message);
                return { buffer: originalBuffer, extension };
        }
};

const resolveOrder = async (requestedOrder) => {
        if (requestedOrder !== undefined && requestedOrder !== null && !Number.isNaN(Number(requestedOrder))) {
                return Number(requestedOrder);
        }

        const latestOrderedItem = await SliderItem.findOne({ order: { $ne: null } })
                .sort({ order: -1, createdAt: -1 })
                .select("order")
                .lean();

        const highestOrder = Number.isFinite(latestOrderedItem?.order) ? Number(latestOrderedItem.order) : 0;

        return highestOrder + 1;
};

export const getSliderItems = async (req, res) => {
        try {
                const onlyActive = String(req.query.active || "").toLowerCase() === "true";
                const filter = onlyActive ? { isActive: true } : {};
                const sliders = await SliderItem.find(filter)
                        .sort({ order: 1, createdAt: -1 })
                        .lean()
                        .then((items) =>
                                items.map((item, index) => ({
                                        ...item,
                                        // عالج العناصر التي قد لا تملك قيمة للترتيب حتى لا يتم إسقاطها
                                        order: Number.isFinite(item.order) ? Number(item.order) : 999 + index,
                                }))
                        );

                res.json({ sliders: Array.isArray(sliders) ? sliders : [] });
        } catch (error) {
                console.log("Error in getSliderItems controller", error.message);
                res.status(500).json({ message: "Server error", error: error.message });
        }
};

export const createSliderItem = async (req, res) => {
        try {
                const { image, title, subtitle, order, isActive } = req.body || {};

                if (typeof image !== "string") {
                        throw createHttpError(400, "Slider image is required");
                }

                const processedImage = await processSliderImage(image);
                const uploadResult = await uploadImage(processedImage.buffer, "slider", {
                        extension: processedImage.extension,
                });
                const { url, fileId } = ensureUploadResult(uploadResult);
                const nextOrder = await resolveOrder(order);

                const sliderItem = await SliderItem.create({
                        imageUrl: url,
                        imageFileId: fileId,
                        imagePublicId: fileId,
                        title: parseString(title),
                        subtitle: parseString(subtitle),
                        order: nextOrder,
                        isActive: isActive === undefined ? true : Boolean(isActive),
                });

                res.status(201).json(sliderItem);
        } catch (error) {
                console.log("Error in createSliderItem controller", error.message);
                const statusCode = error.status || 500;
                res.status(statusCode).json({ message: error.message || "Server error" });
        }
};

export const updateSliderItem = async (req, res) => {
        try {
                const { id } = req.params;
                const { image, title, subtitle, order, isActive } = req.body || {};

                const sliderItem = await SliderItem.findById(id);

                if (!sliderItem) {
                        return res.status(404).json({ message: "Slider item not found" });
                }

                if (typeof title === "string") {
                        sliderItem.title = parseString(title);
                }

                if (typeof subtitle === "string") {
                        sliderItem.subtitle = parseString(subtitle);
                }

                if (order !== undefined) {
                        const parsedOrder = Number(order);
                        sliderItem.order = Number.isNaN(parsedOrder) ? sliderItem.order : parsedOrder;
                }

                if (isActive !== undefined) {
                        sliderItem.isActive = Boolean(isActive);
                }

                if (typeof image === "string" && image.startsWith("data:")) {
                        if (sliderItem.imageFileId) {
                                try {
                                        await deleteImage(sliderItem.imageFileId);
                                } catch (cleanupError) {
                                        console.log("Failed to delete slider image", cleanupError.message);
                                }
                        }

                        const processedImage = await processSliderImage(image);
                        const uploadResult = await uploadImage(processedImage.buffer, "slider", {
                                extension: processedImage.extension,
                        });
                        const { url, fileId } = ensureUploadResult(uploadResult);
                        sliderItem.imageUrl = url;
                        sliderItem.imageFileId = fileId;
                        sliderItem.imagePublicId = fileId;
                }

                const updatedSlider = await sliderItem.save();
                res.json(updatedSlider);
        } catch (error) {
                console.log("Error in updateSliderItem controller", error.message);
                const statusCode = error.status || 500;
                res.status(statusCode).json({ message: error.message || "Server error" });
        }
};

export const deleteSliderItem = async (req, res) => {
        try {
                const { id } = req.params;
                const sliderItem = await SliderItem.findById(id);

                if (!sliderItem) {
                        return res.status(404).json({ message: "Slider item not found" });
                }

                if (sliderItem.imageFileId) {
                        try {
                                await deleteImage(sliderItem.imageFileId);
                        } catch (cleanupError) {
                                console.log("Failed to delete slider image", cleanupError.message);
                        }
                }

                await SliderItem.findByIdAndDelete(id);
                res.json({ success: true });
        } catch (error) {
                console.log("Error in deleteSliderItem controller", error.message);
                res.status(500).json({ message: "Server error", error: error.message });
        }
};

export const reorderSliderItems = async (req, res) => {
        try {
                const { items } = req.body || {};

                if (!Array.isArray(items)) {
                        throw createHttpError(400, "Invalid reorder payload");
                }

                const operations = items
                        .filter((item) => item && item.id !== undefined && item.order !== undefined)
                        .map((item) => ({
                                updateOne: {
                                        filter: { _id: item.id },
                                        update: { $set: { order: Number(item.order) } },
                                },
                        }));

                if (operations.length === 0) {
                        throw createHttpError(400, "No items to reorder");
                }

                await SliderItem.bulkWrite(operations);
                const sliders = await SliderItem.find({}).sort({ order: 1, createdAt: -1 }).lean();

                res.json({ sliders });
        } catch (error) {
                console.log("Error in reorderSliderItems controller", error.message);
                const statusCode = error.status || 500;
                res.status(statusCode).json({ message: error.message || "Server error" });
        }
};
