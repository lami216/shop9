import Section from "../models/section.model.js";
import Category from "../models/category.model.js";

const DEFAULT_SECTION_NAME = "خدمات عامة";
const DEFAULT_SECTION_SLUG = "general-services";
const DEFAULT_SECTION_DESCRIPTION = "قسم افتراضي للفئات الحالية";
const DEFAULT_SECTION_IMAGE = "https://placehold.co/600x400?text=Section";

export const ensureDefaultSection = async () => {
        let section = await Section.findOne({ slug: DEFAULT_SECTION_SLUG });

        if (!section) {
                section = await Section.create({
                        name: DEFAULT_SECTION_NAME,
                        slug: DEFAULT_SECTION_SLUG,
                        description: DEFAULT_SECTION_DESCRIPTION,
                        imageUrl: DEFAULT_SECTION_IMAGE,
                        imageFileId: null,
                        imagePublicId: null,
                        order: 0,
                        isActive: true,
                });
        }

        return section;
};

export const assignDefaultSectionToCategories = async () => {
        const defaultSection = await ensureDefaultSection();
        await Category.updateMany(
                {
                        $or: [{ section: { $exists: false } }, { section: null }],
                },
                { $set: { section: defaultSection._id } }
        );
        return defaultSection;
};
