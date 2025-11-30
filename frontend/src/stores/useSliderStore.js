import { create } from "zustand";
import toast from "react-hot-toast";
import apiClient from "../lib/apiClient";
import { translate } from "../lib/locale";

export const useSliderStore = create((set) => ({
        slides: [],
        loading: false,
        error: null,

        fetchSlides: async (onlyActive = false) => {
                set({ loading: true, error: null });
                try {
                        const query = onlyActive ? "?active=true" : "";
                        const data = await apiClient.get(`/sliders${query}`);
                        set({ slides: data?.sliders ?? [], loading: false });
                } catch (error) {
                        set({ loading: false, error: error.response?.data?.message || "Failed to fetch sliders" });
                        toast.error(translate("toast.sliderFetchError"));
                }
        },

        createSlide: async (payload) => {
                set({ loading: true, error: null });
                try {
                        const data = await apiClient.post(`/sliders`, payload);
                        set((state) => ({ slides: [...state.slides, data], loading: false }));
                        toast.success(translate("slider.messages.created"));
                        return data;
                } catch (error) {
                        set({ loading: false });
                        toast.error(error.response?.data?.message || translate("toast.sliderCreateError"));
                        throw error;
                }
        },

        updateSlide: async (id, payload) => {
                set({ loading: true, error: null });
                try {
                        const data = await apiClient.put(`/sliders/${id}`, payload);
                        set((state) => ({
                                slides: state.slides.map((slide) => (slide._id === id ? data : slide)),
                                loading: false,
                        }));
                        toast.success(translate("slider.messages.updated"));
                        return data;
                } catch (error) {
                        set({ loading: false });
                        toast.error(error.response?.data?.message || translate("toast.sliderUpdateError"));
                        throw error;
                }
        },

        deleteSlide: async (id) => {
                set({ loading: true, error: null });
                try {
                        await apiClient.delete(`/sliders/${id}`);
                        set((state) => ({
                                slides: state.slides.filter((slide) => slide._id !== id),
                                loading: false,
                        }));
                        toast.success(translate("slider.messages.deleted"));
                } catch (error) {
                        set({ loading: false });
                        toast.error(error.response?.data?.message || translate("toast.sliderDeleteError"));
                        throw error;
                }
        },

        reorderSlides: async (orderedSlides) => {
                set({ loading: true, error: null });
                try {
                        const payload = { items: orderedSlides.map((slide, index) => ({ id: slide._id, order: index })) };
                        const data = await apiClient.put(`/sliders/reorder`, payload);
                        set({ slides: data?.sliders ?? [], loading: false });
                        toast.success(translate("slider.messages.reordered"));
                        return data?.sliders ?? [];
                } catch (error) {
                        set({ loading: false });
                        toast.error(error.response?.data?.message || translate("toast.sliderReorderError"));
                        throw error;
                }
        },
}));

export default useSliderStore;
