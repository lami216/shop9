import express from "express";
import {
        createSection,
        deleteSection,
        getSectionBySlug,
        getSections,
        updateSection,
} from "../controllers/section.controller.js";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getSections);
router.get("/slug/:slug", getSectionBySlug);
router.post("/", protectRoute, adminRoute, createSection);
router.put("/:id", protectRoute, adminRoute, updateSection);
router.delete("/:id", protectRoute, adminRoute, deleteSection);

export default router;
