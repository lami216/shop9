import { useCallback, useEffect, useState } from "react";
import { ImagePlus, Trash2, Edit3, X, Save } from "lucide-react";
import toast from "react-hot-toast";
import useTranslation from "../hooks/useTranslation";
import { useCategoryStore } from "../stores/useCategoryStore";

const CategoryManager = () => {
        const {
                categories,
                selectedCategory,
                setSelectedCategory,
                clearSelectedCategory,
                createCategory,
                updateCategory,
                deleteCategory,
                fetchCategories,
                loading,
        } = useCategoryStore();
        const { t } = useTranslation();

        const createEmptyForm = useCallback(
                () => ({
                        name: "",
                        description: "",
                        image: "",
                        imagePreview: "",
                        imageChanged: false,
                }),
                []
        );

        const [formState, setFormState] = useState(() => createEmptyForm());

        useEffect(() => {
                fetchCategories();
        }, [fetchCategories]);

        useEffect(() => {
                if (!selectedCategory) {
                        setFormState(createEmptyForm());
                        return;
                }

                setFormState({
                        name: selectedCategory.name ?? "",
                        description: selectedCategory.description ?? "",
                        image: "",
                        imagePreview: selectedCategory.imageUrl ?? "",
                        imageChanged: false,
                });
        }, [selectedCategory, createEmptyForm]);

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
                clearSelectedCategory();
                setFormState(createEmptyForm());
        };

        const handleSubmit = async (event) => {
                event.preventDefault();
                const trimmedName = formState.name.trim();
                const trimmedDescription = formState.description.trim();

                if (!trimmedName) {
                        toast.error(t("categories.manager.form.nameRequired"));
                        return;
                }

                if (!selectedCategory && !formState.image) {
                        toast.error(t("categories.manager.form.imageRequired"));
                        return;
                }

                const payload = {
                        name: trimmedName,
                        description: trimmedDescription,
                };

                if (formState.image && (formState.imageChanged || !selectedCategory)) {
                        payload.image = formState.image;
                }

                try {
                        if (selectedCategory) {
                                await updateCategory(selectedCategory._id, payload);
                        } else {
                                await createCategory(payload);
                        }
                        resetForm();
                } catch (error) {
                        console.error("Category save failed", error);
                }
        };

        const handleEdit = (category) => {
                setSelectedCategory(category);
        };

        const handleCancelEdit = () => {
                resetForm();
        };

        const handleDelete = (category) => {
                if (globalThis.window?.confirm(t("categories.manager.confirmDelete"))) {
                        deleteCategory(category._id);
                }
        };

        return (
                <div className='mx-auto mb-12 max-w-5xl space-y-8'>
                        <div className='rounded-xl border border-ali-card bg-white p-6 shadow-lg backdrop-blur-sm'>
                                <div className='mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
                                        <div>
                                                <h2 className='text-2xl font-semibold text-ali-ink'>{t("categories.manager.title")}</h2>
                                                <p className='text-sm text-ali-muted'>{t("categories.manager.description")}</p>
                                        </div>
                                        {selectedCategory && (
                                                <button
                                                        type='button'
                                                        className='inline-flex items-center gap-2 rounded-md border border-ali-card px-3 py-1 text-sm text-ali-ink transition hover:border-payzone-gold'
                                                        onClick={handleCancelEdit}
                                                >
                                                        <X className='h-4 w-4' />
                                                        {t("categories.manager.form.cancelEdit")}
                                                </button>
                                        )}
                                </div>

                                <form onSubmit={handleSubmit} className='space-y-6'>
                                        <div className='grid gap-4 sm:grid-cols-2'>
                                                <div>
                                                        <label className='block text-sm font-medium text-ali-ink' htmlFor='category-name'>
                                                                {t("categories.manager.form.name")}
                                                        </label>
                                                        <input
                                                                id='category-name'
                                                                type='text'
                                                                className='mt-1 block w-full rounded-md border border-ali-card bg-white px-3 py-2 text-ali-ink focus:border-payzone-gold focus:outline-none focus:ring-2 focus:ring-payzone-indigo'
                                                                value={formState.name}
                                                                onChange={(event) => setFormState((previous) => ({
                                                                        ...previous,
                                                                        name: event.target.value,
                                                                }))}
                                                                required
                                                        />
                                                </div>
                                                <div>
                                                        <label className='block text-sm font-medium text-ali-ink'>
                                                                {t("categories.manager.form.image")}
                                                        </label>
                                                        <div className='mt-1 flex items-center gap-3'>
                                                                <input
                                                                        type='file'
                                                                        id='category-image'
                                                                        accept='image/*'
                                                                        className='sr-only'
                                                                        onChange={handleImageChange}
                                                                />
                                                                <label
                                                                        htmlFor='category-image'
                                                                        className='inline-flex cursor-pointer items-center gap-2 rounded-md border border-ali-card bg-white px-3 py-2 text-sm text-ali-ink transition hover:border-payzone-gold hover:bg-ali-card'
                                                                >
                                                                        <ImagePlus className='h-4 w-4' />
                                                                        {formState.imagePreview
                                                                                ? t("categories.manager.form.changeImage")
                                                                                : t("categories.manager.form.chooseImage")}
                                                                </label>
                                                                {formState.imagePreview && (
                                                                        <img
                                                                                src={formState.imagePreview}
                                                                                alt='معاينة الفئة'
                                                                                className='h-14 w-14 rounded-lg object-cover'
                                                                        />
                                                                )}
                                                        </div>
                                                        <p className='mt-2 text-xs text-ali-muted'>{t("categories.manager.form.imageHint")}</p>
                                                </div>
                                        </div>

                                        <div>
                                                <label className='block text-sm font-medium text-ali-ink' htmlFor='category-description'>
                                                        {t("categories.manager.form.description")}
                                                </label>
                                                <textarea
                                                        id='category-description'
                                                        rows={3}
                                                        className='mt-1 block w-full rounded-md border border-ali-card bg-white px-3 py-2 text-ali-ink focus:border-payzone-gold focus:outline-none focus:ring-2 focus:ring-payzone-indigo'
                                                        value={formState.description}
                                                        onChange={(event) => setFormState((previous) => ({
                                                                ...previous,
                                                                description: event.target.value,
                                                        }))}
                                                />
                                        </div>

                                        <button
                                                type='submit'
                                                className='inline-flex items-center justify-center gap-2 rounded-md bg-payzone-gold px-4 py-2 font-semibold text-payzone-navy transition hover:bg-[#b8873d] focus:outline-none focus:ring-2 focus:ring-payzone-indigo disabled:opacity-50'
                                                disabled={loading}
                                        >
                                                <Save className='h-4 w-4' />
                                                {selectedCategory
                                                        ? t("categories.manager.form.submitUpdate")
                                                        : t("categories.manager.form.submitCreate")}
                                        </button>
                                </form>
                        </div>

                        <div className='rounded-xl border border-ali-card bg-white p-6 shadow-lg backdrop-blur-sm'>
                                <h3 className='mb-4 text-xl font-semibold text-ali-ink'>{t("categories.manager.list.title")}</h3>
                                {categories.length === 0 ? (
                                        <p className='text-sm text-ali-muted'>{t("categories.manager.list.empty")}</p>
                                ) : (
                                        <ul className='space-y-4'>
                                                {categories.map((category) => (
                                                        <li
                                                                key={category._id}
                                                                className='flex flex-col gap-3 rounded-lg border border-ali-card bg-ali-card p-4 sm:flex-row sm:items-center sm:justify-between'
                                                        >
                                                                <div className='flex items-center gap-4'>
                                                                        <img
                                                                                src={category.imageUrl}
                                                                                alt={category.name}
                                                                                className='h-14 w-14 rounded-lg object-cover'
                                                                        />
                                                                        <div>
                                                                                <p className='text-lg font-semibold text-ali-ink'>{category.name}</p>
                                                                                {category.description && (
                                                                                        <p className='text-sm text-ali-muted'>{category.description}</p>
                                                                                )}
                                                                        </div>
                                                                </div>
                                                                <div className='flex items-center gap-2'>
                                                                        <button
                                                                                type='button'
                                                                                className='inline-flex items-center gap-1 rounded-md bg-ali-card px-3 py-1 text-sm text-ali-ink transition hover:bg-white'
                                                                                onClick={() => handleEdit(category)}
                                                                        >
                                                                                <Edit3 className='h-4 w-4' />
                                                                                {t("categories.manager.list.actions.edit")}
                                                                        </button>
                                                                        <button
                                                                                type='button'
                                                                                className='inline-flex items-center gap-1 rounded-md bg-red-100 px-3 py-1 text-sm text-red-700 transition hover:bg-red-200'
                                                                                onClick={() => handleDelete(category)}
                                                                        >
                                                                                <Trash2 className='h-4 w-4' />
                                                                                {t("categories.manager.list.actions.delete")}
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

export default CategoryManager;
