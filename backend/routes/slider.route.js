import express from "express";
import {
        createSliderItem,
        deleteSliderItem,
        getSliderItems,
        reorderSliderItems,
        updateSliderItem,
} from "../controllers/slider.controller.js";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getSliderItems);
router.post("/", protectRoute, adminRoute, createSliderItem);
router.put("/reorder", protectRoute, adminRoute, reorderSliderItems);
router.put("/:id", protectRoute, adminRoute, updateSliderItem);
router.delete("/:id", protectRoute, adminRoute, deleteSliderItem);

export default router;
