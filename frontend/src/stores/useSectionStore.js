import { create } from "zustand";
import toast from "react-hot-toast";
import apiClient from "../lib/apiClient";
import { translate } from "../lib/locale";

export const useSectionStore = create((set) => ({
        sections: [],
        loading: false,
        error: null,
        selectedSection: null,
        sectionDetails: null,

        setSelectedSection: (section) => set({ selectedSection: section }),
        clearSelectedSection: () => set({ selectedSection: null }),

        fetchSections: async (onlyActive = false) => {
                set({ loading: true, error: null });
                try {
                        const query = onlyActive ? "?active=true" : "";
                        const data = await apiClient.get(`/sections${query}`);
                        set({ sections: data?.sections ?? [], loading: false });
                } catch (error) {
                        set({ loading: false, error: error.response?.data?.message || "Failed to fetch sections" });
                        toast.error(translate("toast.sectionFetchError"));
                }
        },

        fetchSectionBySlug: async (slug) => {
                set({ loading: true, error: null });
                try {
                        const data = await apiClient.get(`/sections/slug/${slug}`);
                        set({ sectionDetails: data, loading: false });
                        return data;
                } catch (error) {
                        set({ loading: false, error: error.response?.data?.message || "Failed to load section" });
                        toast.error(error.response?.data?.message || translate("toast.sectionFetchError"));
                        throw error;
                }
        },

        createSection: async (payload) => {
                set({ loading: true, error: null });
                try {
                        const data = await apiClient.post(`/sections`, payload);
                        set((state) => ({
                                sections: [...state.sections, data],
                                loading: false,
                        }));
                        toast.success(translate("common.messages.sectionCreated"));
                        return data;
                } catch (error) {
                        set({ loading: false });
                        toast.error(error.response?.data?.message || translate("toast.sectionCreateError"));
                        throw error;
                }
        },

        updateSection: async (id, payload) => {
                set({ loading: true, error: null });
                try {
                        const data = await apiClient.put(`/sections/${id}`, payload);
                        set((state) => ({
                                sections: state.sections.map((section) => (section._id === id ? data : section)),
                                selectedSection: null,
                                loading: false,
                        }));
                        toast.success(translate("common.messages.sectionUpdated"));
                        return data;
                } catch (error) {
                        set({ loading: false });
                        toast.error(error.response?.data?.message || translate("toast.sectionUpdateError"));
                        throw error;
                }
        },

        deleteSection: async (id) => {
                set({ loading: true, error: null });
                try {
                        await apiClient.delete(`/sections/${id}`);
                        set((state) => ({
                                sections: state.sections.filter((section) => section._id !== id),
                                selectedSection: state.selectedSection?._id === id ? null : state.selectedSection,
                                loading: false,
                        }));
                        toast.success(translate("common.messages.sectionDeleted"));
                } catch (error) {
                        set({ loading: false });
                        toast.error(error.response?.data?.message || translate("toast.sectionDeleteError"));
                        throw error;
                }
        },
}));

export default useSectionStore;
