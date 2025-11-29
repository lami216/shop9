import mongoose from "mongoose";
import Section from "../models/section.model.js";
import Category from "../models/category.model.js";
import { deleteImage, uploadImage } from "../lib/imagekit.js";
import { assignDefaultSectionToCategories, ensureDefaultSection } from "../lib/sectionDefaults.js";

const createHttpError = (status, message) => {
        const error = new Error(message);
        error.status = status;
        return error;
};

const slugify = (value) => {
        if (value === undefined || value === null) {
                        return "";
        }

        const normalized = value
                .toString()
                .normalize("NFKD")
                .replaceAll(/[\u0300-\u036f]/g, "");

        const slug = normalized
                .replaceAll(/[^\p{L}\p{N}\s-]/gu, "")
                .trim()
                .replaceAll(/[\s_-]+/g, "-")
                .replaceAll(/(?:^-+)|(?:-+$)/g, "")
                .toLowerCase();

        return slug || "section";
};

const generateUniqueSlug = async (baseName, ignoreId = null) => {
        const baseSlug = slugify(baseName);
        let uniqueSlug = baseSlug;
        let counter = 1;

        while (true) {
                const existing = await Section.findOne({ slug: uniqueSlug });
                if (!existing || (ignoreId && existing._id.equals(ignoreId))) {
                        return uniqueSlug;
                }
                counter += 1;
                uniqueSlug = `${baseSlug}-${counter}`;
        }
};

const uploadSectionImage = async (image) => {
        if (!image || typeof image !== "string" || !image.startsWith("data:")) {
                throw new Error("INVALID_IMAGE_FORMAT");
        }

        const result = await uploadImage(image, "sections");

        return {
                secure_url: result.url,
                public_id: result.fileId ?? null,
        };
};

const ensureUploadSuccess = (uploadResult) => {
        if (!uploadResult?.secure_url) {
                throw createHttpError(500, "Failed to process section image");
        }

        const secureUrl =
                typeof uploadResult.secure_url === "string"
                        ? uploadResult.secure_url
                        : String(uploadResult.secure_url);
        let publicId = null;

        if (typeof uploadResult.public_id === "string") {
                publicId = uploadResult.public_id;
        } else if (uploadResult.public_id) {
                publicId = String(uploadResult.public_id);
        }

        return {
                secureUrl,
                publicId,
        };
};

const sanitizeCreatePayload = (body) => {
        const payload = body && typeof body === "object" ? body : {};
        const rawName = payload.name;
        const rawDescription = payload.description;
        const rawImage = payload.image;
        const rawOrder = payload.order;
        const rawIsActive = payload.isActive;

        if (typeof rawName !== "string" || !rawName.trim()) {
                throw createHttpError(400, "Name is required");
        }

        if (rawDescription !== undefined && typeof rawDescription !== "string") {
                throw createHttpError(400, "Invalid section description");
        }

        if (typeof rawImage !== "string") {
                throw createHttpError(400, "Section image is required");
        }

        const parsedOrder = rawOrder === undefined ? null : Number(rawOrder);
        const order = Number.isNaN(parsedOrder) ? null : parsedOrder;
        const isActive = rawIsActive === undefined ? true : Boolean(rawIsActive);

        return {
                name: rawName.trim(),
                description: typeof rawDescription === "string" ? rawDescription.trim() : "",
                image: rawImage,
                order,
                isActive,
        };
};

const sanitizeUpdatePayload = (body) => {
        const payload = body && typeof body === "object" ? body : {};
        const updates = {};

        if (typeof payload.name === "string" && payload.name.trim()) {
                updates.name = payload.name.trim();
        }

        if (payload.description !== undefined) {
                if (typeof payload.description !== "string") {
                        throw createHttpError(400, "Invalid section description");
                }
                updates.description = payload.description.trim();
        }

        if (payload.order !== undefined) {
                const parsedOrder = Number(payload.order);
                updates.order = Number.isNaN(parsedOrder) ? null : parsedOrder;
        }

        if (payload.isActive !== undefined) {
                updates.isActive = Boolean(payload.isActive);
        }

        if (typeof payload.image === "string") {
                updates.image = payload.image;
        }

        return updates;
};

const removeSectionImage = async (section) => {
        if (section.imageFileId) {
                try {
                        await deleteImage(section.imageFileId);
                } catch (cleanupError) {
                        console.log("Failed to delete section image", cleanupError.message);
                }
        }
};

const normalizeSectionsWithCounts = (sections, counts) => {
        const countMap = new Map();
        counts.forEach((entry) => {
                if (entry?._id) {
                        countMap.set(entry._id.toString(), entry.count || 0);
                }
        });

        return sections.map((section) => ({
                ...section,
                categoryCount: countMap.get(section._id.toString()) || 0,
        }));
};

export const getSections = async (req, res) => {
        try {
                await assignDefaultSectionToCategories();

                const onlyActive = String(req.query.active || "").toLowerCase() === "true";
                const filter = onlyActive ? { isActive: true } : {};

                const sections = await Section.find(filter)
                        .sort({ order: 1, createdAt: -1 })
                        .lean();
                const counts = await Category.aggregate([
                        { $group: { _id: "$section", count: { $sum: 1 } } },
                ]);

                res.json({ sections: normalizeSectionsWithCounts(sections, counts) });
        } catch (error) {
                console.log("Error in getSections controller", error.message);
                res.status(500).json({ message: "Server error", error: error.message });
        }
};

export const getSectionBySlug = async (req, res) => {
        try {
                const { slug } = req.params;
                await assignDefaultSectionToCategories();

                const section = await Section.findOne({ slug, isActive: true }).lean();

                if (!section) {
                        return res.status(404).json({ message: "Section not found" });
                }

                const categories = await Category.find({ section: section._id })
                        .sort({ createdAt: -1 })
                        .lean();

                res.json({ section, categories });
        } catch (error) {
                console.log("Error in getSectionBySlug controller", error.message);
                res.status(500).json({ message: "Server error", error: error.message });
        }
};

export const createSection = async (req, res) => {
        try {
                const { name, description, image, order, isActive } = sanitizeCreatePayload(req.body);
                const uploadResult = ensureUploadSuccess(await uploadSectionImage(image));
                const slug = await generateUniqueSlug(name);

                const section = await Section.create({
                        name,
                        description,
                        slug,
                        imageUrl: uploadResult.secureUrl,
                        imageFileId: uploadResult.publicId ?? null,
                        imagePublicId: uploadResult.publicId ?? null,
                        order,
                        isActive,
                });

                res.status(201).json(section);
        } catch (error) {
                if (error.status) {
                        return res.status(error.status).json({ message: error.message });
                }
                console.log("Error in createSection controller", error.message);
                res.status(500).json({ message: "Server error", error: error.message });
        }
};

export const updateSection = async (req, res) => {
        try {
                const { id } = req.params;
                const updates = sanitizeUpdatePayload(req.body);

                const section = await Section.findById(id);

                if (!section) {
                        return res.status(404).json({ message: "Section not found" });
                }

                if (updates.name && updates.name !== section.name) {
                        section.slug = await generateUniqueSlug(updates.name, section._id);
                        section.name = updates.name;
                }

                if (updates.description !== undefined) {
                        section.description = updates.description;
                }

                if (updates.order !== undefined) {
                        section.order = updates.order;
                }

                if (updates.isActive !== undefined) {
                        section.isActive = updates.isActive;
                }

                if (typeof updates.image === "string" && updates.image.startsWith("data:")) {
                        const uploadResult = ensureUploadSuccess(await uploadSectionImage(updates.image));
                        await removeSectionImage(section);
                        section.imageUrl = uploadResult.secureUrl;
                        section.imageFileId = uploadResult.publicId ?? null;
                        section.imagePublicId = uploadResult.publicId ?? null;
                }

                await section.save();

                res.json(section);
        } catch (error) {
                if (error.status) {
                        return res.status(error.status).json({ message: error.message });
                }
                console.log("Error in updateSection controller", error.message);
                res.status(500).json({ message: "Server error", error: error.message });
        }
};

export const deleteSection = async (req, res) => {
        try {
                const { id } = req.params;
                const section = await Section.findById(id);

                if (!section) {
                        return res.status(404).json({ message: "Section not found" });
                }

                const defaultSection = await ensureDefaultSection();

                if (section._id.equals(defaultSection._id)) {
                        return res.status(400).json({ message: "Cannot delete the default section" });
                }

                await Category.updateMany({ section: section._id }, { $set: { section: defaultSection._id } });

                if (section.imageFileId) {
                        try {
                                await deleteImage(section.imageFileId);
                        } catch (cleanupError) {
                                console.log("Failed to delete section image", cleanupError.message);
                        }
                }

                await Section.findByIdAndDelete(id);

                res.json({ message: "Section deleted successfully", defaultSectionId: defaultSection._id });
        } catch (error) {
                console.log("Error in deleteSection controller", error.message);
                res.status(500).json({ message: "Server error", error: error.message });
        }
};

export const ensureSectionIdValid = async (sectionId) => {
        if (!sectionId || !mongoose.Types.ObjectId.isValid(sectionId)) {
                throw createHttpError(400, "A valid section is required");
        }

        const section = await Section.findById(sectionId);

        if (!section) {
                throw createHttpError(404, "Section not found");
        }

        if (!section.isActive) {
                throw createHttpError(400, "Section is not active");
        }

        return section;
};
