import { useCallback, useEffect, useState } from "react";
import { ImagePlus, Trash2, Edit3, X, Save, ToggleLeft, ToggleRight } from "lucide-react";
import toast from "react-hot-toast";
import useTranslation from "../hooks/useTranslation";
import { useSectionStore } from "../stores/useSectionStore";

const SectionManager = () => {
        const {
                sections,
                selectedSection,
                setSelectedSection,
                clearSelectedSection,
                createSection,
                updateSection,
                deleteSection,
                fetchSections,
                loading,
        } = useSectionStore();
        const { t } = useTranslation();

        const createEmptyForm = useCallback(
                () => ({
                        name: "",
                        description: "",
                        image: "",
                        imagePreview: "",
                        imageChanged: false,
                        order: "",
                        isActive: true,
                }),
                []
        );

        const [formState, setFormState] = useState(() => createEmptyForm());

        useEffect(() => {
                fetchSections();
        }, [fetchSections]);

        useEffect(() => {
                if (!selectedSection) {
                        setFormState(createEmptyForm());
                        return;
                }

                setFormState({
                        name: selectedSection.name ?? "",
                        description: selectedSection.description ?? "",
                        image: "",
                        imagePreview: selectedSection.imageUrl ?? "",
                        imageChanged: false,
                        order:
                                selectedSection.order !== undefined && selectedSection.order !== null
                                        ? String(selectedSection.order)
                                        : "",
                        isActive: Boolean(selectedSection.isActive),
                });
        }, [selectedSection, createEmptyForm]);

        const handleImageChange = (event) => {
                const file = event.target.files?.[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onloadend = () => {
                        const result = typeof reader.result === "string" ? reader.result : "";
                        setFormState((previous) => ({
                                ...previous,
                                image: result,
                                imagePreview: result,
                                imageChanged: true,
                        }));
                };
                reader.readAsDataURL(file);
                event.target.value = "";
        };

        const resetForm = () => {
                clearSelectedSection();
                setFormState(createEmptyForm());
        };

        const handleSubmit = async (event) => {
                event.preventDefault();
                const trimmedName = formState.name.trim();
                const trimmedDescription = formState.description.trim();
                const hasOrder = formState.order !== "";
                const numericOrder = hasOrder ? Number(formState.order) : null;

                if (!trimmedName) {
                        toast.error(t("sections.manager.form.nameRequired"));
                        return;
                }

                if (!selectedSection && !formState.image) {
                        toast.error(t("sections.manager.form.imageRequired"));
                        return;
                }

                const payload = {
                        name: trimmedName,
                        description: trimmedDescription,
                        isActive: formState.isActive,
                };

                if (formState.image && (formState.imageChanged || !selectedSection)) {
                        payload.image = formState.image;
                }

                if (!Number.isNaN(numericOrder) && numericOrder !== null) {
                        payload.order = numericOrder;
                }

                try {
                        if (selectedSection) {
                                await updateSection(selectedSection._id, payload);
                        } else {
                                await createSection(payload);
                        }
                        resetForm();
                } catch (error) {
                        console.error("Section save failed", error);
                }
        };

        const handleEdit = (section) => setSelectedSection(section);
        const handleCancelEdit = () => resetForm();

        const handleDelete = (section) => {
                if (globalThis.window?.confirm(t("sections.manager.confirmDelete"))) {
                        deleteSection(section._id);
                }
        };

        return (
                <div className='space-y-6'>
                        <div className='rounded-xl border border-ali-card bg-gradient-to-br from-white to-ali-card/60 p-6 shadow-lg'>
                                <div className='mb-6 flex items-center justify-between'>
                                        <div>
                                                <h2 className='text-2xl font-bold text-ali-ink'>{t("sections.manager.title")}</h2>
                                                <p className='text-sm text-ali-muted'>{t("sections.manager.description")}</p>
                                        </div>
                                        {selectedSection && (
                                                <button
                                                        type='button'
                                                        onClick={handleCancelEdit}
                                                        className='inline-flex items-center gap-2 rounded-md bg-ali-card px-4 py-2 text-sm text-ali-ink transition hover:bg-white'
                                                >
                                                        <X className='h-4 w-4' />
                                                        {t("sections.manager.form.cancelEdit")}
                                                </button>
                                        )}
                                </div>

                                <form onSubmit={handleSubmit} className='space-y-5'>
                                        <div className='grid gap-5 md:grid-cols-2'>
                                                <div>
                                                        <label className='block text-sm font-medium text-ali-ink' htmlFor='section-name'>
                                                                {t("sections.manager.form.name")}
                                                        </label>
                                                        <input
                                                                id='section-name'
                                                                type='text'
                                                                className='mt-1 block w-full rounded-md border border-ali-card bg-white px-3 py-2 text-ali-ink focus:border-payzone-gold focus:outline-none focus:ring-2 focus:ring-payzone-indigo'
                                                                value={formState.name}
                                                                onChange={(event) =>
                                                                        setFormState((previous) => ({
                                                                                ...previous,
                                                                                name: event.target.value,
                                                                        }))
                                                                }
                                                                required
                                                        />
                                                </div>
                                                <div>
                                                        <label className='block text-sm font-medium text-ali-ink' htmlFor='section-order'>
                                                                {t("sections.manager.form.order")}
                                                        </label>
                                                        <input
                                                                id='section-order'
                                                                type='number'
                                                                min='0'
                                                                className='mt-1 block w-full rounded-md border border-ali-card bg-white px-3 py-2 text-ali-ink focus:border-payzone-gold focus:outline-none focus:ring-2 focus:ring-payzone-indigo'
                                                                value={formState.order}
                                                                onChange={(event) =>
                                                                        setFormState((previous) => ({
                                                                                ...previous,
                                                                                order: event.target.value,
                                                                        }))
                                                                }
                                                        />
                                                </div>
                                        </div>

                                        <div className='grid gap-5 md:grid-cols-2'>
                                                <div>
                                                        <label className='block text-sm font-medium text-ali-ink'>
                                                                {t("sections.manager.form.image")}
                                                        </label>
                                                        <div className='mt-1 flex items-center gap-3'>
                                                                <input
                                                                        type='file'
                                                                        id='section-image'
                                                                        accept='image/*'
                                                                        className='sr-only'
                                                                        onChange={handleImageChange}
                                                                />
                                                                <label
                                                                        htmlFor='section-image'
                                                                        className='inline-flex cursor-pointer items-center gap-2 rounded-md border border-ali-card bg-white px-3 py-2 text-sm text-ali-ink transition hover:border-payzone-gold hover:bg-ali-card'
                                                                >
                                                                        <ImagePlus className='h-4 w-4' />
                                                                        {formState.imagePreview
                                                                                ? t("sections.manager.form.changeImage")
                                                                                : t("sections.manager.form.chooseImage")}
                                                                </label>
                                                                {formState.imagePreview && (
                                                                        <img
                                                                                src={formState.imagePreview}
                                                                                alt='معاينة القسم'
                                                                                className='h-14 w-14 rounded-lg object-cover'
                                                                        />
                                                                )}
                                                        </div>
                                                        <p className='mt-2 text-xs text-ali-muted'>{t("sections.manager.form.imageHint")}</p>
                                                </div>
                                                <div>
                                                        <label className='block text-sm font-medium text-ali-ink'>
                                                                {t("sections.manager.form.isActive")}
                                                        </label>
                                                        <button
                                                                type='button'
                                                                onClick={() =>
                                                                        setFormState((previous) => ({
                                                                                ...previous,
                                                                                isActive: !previous.isActive,
                                                                        }))
                                                                }
                                                                className='mt-2 inline-flex items-center gap-2 rounded-md border border-ali-card bg-white px-4 py-2 text-sm font-semibold text-ali-ink transition hover:border-payzone-gold'
                                                        >
                                                                {formState.isActive ? (
                                                                        <ToggleRight className='h-5 w-5 text-green-500' />
                                                                ) : (
                                                                        <ToggleLeft className='h-5 w-5 text-ali-muted' />
                                                                )}
                                                                {formState.isActive
                                                                        ? t("sections.manager.form.active")
                                                                        : t("sections.manager.form.inactive")}
                                                        </button>
                                                </div>
                                        </div>

                                        <div>
                                                <label className='block text-sm font-medium text-ali-ink' htmlFor='section-description'>
                                                        {t("sections.manager.form.description")}
                                                </label>
                                                <textarea
                                                        id='section-description'
                                                        rows={3}
                                                        className='mt-1 block w-full rounded-md border border-ali-card bg-white px-3 py-2 text-ali-ink focus:border-payzone-gold focus:outline-none focus:ring-2 focus:ring-payzone-indigo'
                                                        value={formState.description}
                                                        onChange={(event) =>
                                                                setFormState((previous) => ({
                                                                        ...previous,
                                                                        description: event.target.value,
                                                                }))
                                                        }
                                                />
                                        </div>

                                        <button
                                                type='submit'
                                                className='inline-flex items-center justify-center gap-2 rounded-md bg-payzone-gold px-4 py-2 font-semibold text-payzone-navy transition hover:bg-[#b8873d] focus:outline-none focus:ring-2 focus:ring-payzone-indigo disabled:opacity-50'
                                                disabled={loading}
                                        >
                                                <Save className='h-4 w-4' />
                                                {selectedSection
                                                        ? t("sections.manager.form.submitUpdate")
                                                        : t("sections.manager.form.submitCreate")}
                                        </button>
                                </form>
                        </div>

                        <div className='rounded-xl border border-ali-card bg-white p-6 shadow-lg backdrop-blur-sm'>
                                <h3 className='mb-4 text-xl font-semibold text-ali-ink'>{t("sections.manager.list.title")}</h3>
                                {sections.length === 0 ? (
                                        <p className='text-sm text-ali-muted'>{t("sections.manager.list.empty")}</p>
                                ) : (
                                        <ul className='space-y-4'>
                                                {sections.map((section) => (
                                                        <li
                                                                key={section._id}
                                                                className='flex flex-col gap-3 rounded-lg border border-ali-card bg-ali-card p-4 sm:flex-row sm:items-center sm:justify-between'
                                                        >
                                                                <div className='flex items-center gap-4'>
                                                                        <img
                                                                                src={section.imageUrl}
                                                                                alt={section.name}
                                                                                className='h-14 w-14 rounded-lg object-cover'
                                                                        />
                                                                        <div>
                                                                                <p className='text-lg font-semibold text-ali-ink'>{section.name}</p>
                                                                                <p className='text-xs text-ali-muted'>
                                                                                        {t("sections.manager.list.categoryCount", {
                                                                                                count: section.categoryCount ?? 0,
                                                                                        })}
                                                                                </p>
                                                                                {section.description && (
                                                                                        <p className='text-sm text-ali-muted'>{section.description}</p>
                                                                                )}
                                                                        </div>
                                                                </div>
                                                                <div className='flex items-center gap-2'>
                                                                        <span
                                                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                                                        section.isActive
                                                                                                ? "bg-green-100 text-green-700"
                                                                                                : "bg-ali-card text-ali-muted"
                                                                                }`}
                                                                        >
                                                                                {section.isActive
                                                                                        ? t("sections.manager.form.active")
                                                                                        : t("sections.manager.form.inactive")}
                                                                        </span>
                                                                        <button
                                                                                type='button'
                                                                                className='inline-flex items-center gap-1 rounded-md bg-ali-card px-3 py-1 text-sm text-ali-ink transition hover:bg-white'
                                                                                onClick={() => handleEdit(section)}
                                                                        >
                                                                                <Edit3 className='h-4 w-4' />
                                                                                {t("sections.manager.list.actions.edit")}
                                                                        </button>
                                                                        <button
                                                                                type='button'
                                                                                className='inline-flex items-center gap-1 rounded-md bg-red-100 px-3 py-1 text-sm text-red-700 transition hover:bg-red-200'
                                                                                onClick={() => handleDelete(section)}
                                                                        >
                                                                                <Trash2 className='h-4 w-4' />
                                                                                {t("sections.manager.list.actions.delete")}
                                                                        </button>
                                                                </div>
                                                        </li>
                                                ))}
                                        </ul>
                                )}
                        </div>
                </div>
        );
};

export default SectionManager;
