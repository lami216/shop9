import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Pencil, Save, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import useTranslation from "../hooks/useTranslation";
import { useSliderStore } from "../stores/useSliderStore";

const SliderManager = () => {
        const { slides, fetchSlides, createSlide, updateSlide, deleteSlide, reorderSlides, loading } = useSliderStore();
        const { t } = useTranslation();
        const [selectedSlide, setSelectedSlide] = useState(null);
        const [formState, setFormState] = useState({
                title: "",
                subtitle: "",
                image: "",
                preview: "",
                imageChanged: false,
                order: "",
                isActive: true,
        });

        useEffect(() => {
                fetchSlides();
        }, [fetchSlides]);

        useEffect(() => {
                if (!selectedSlide) {
                        setFormState({
                                title: "",
                                subtitle: "",
                                image: "",
                                preview: "",
                                imageChanged: false,
                                order: "",
                                isActive: true,
                        });
                        return;
                }

                setFormState({
                        title: selectedSlide.title ?? "",
                        subtitle: selectedSlide.subtitle ?? "",
                        image: "",
                        preview: selectedSlide.imageUrl ?? "",
                        imageChanged: false,
                        order:
                                selectedSlide.order !== undefined && selectedSlide.order !== null
                                        ? String(selectedSlide.order)
                                        : "",
                        isActive: Boolean(selectedSlide.isActive),
                });
        }, [selectedSlide]);

        const sortedSlides = useMemo(
                () => [...slides].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
                [slides]
        );

        const handleImageChange = (event) => {
                const file = event.target.files?.[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onloadend = () => {
                        const result = typeof reader.result === "string" ? reader.result : "";
                        setFormState((previous) => ({
                                ...previous,
                                image: result,
                                preview: result,
                                imageChanged: true,
                        }));
                };
                reader.readAsDataURL(file);
                event.target.value = "";
        };

        const resetForm = () => {
                setSelectedSlide(null);
                setFormState({
                        title: "",
                        subtitle: "",
                        image: "",
                        preview: "",
                        imageChanged: false,
                        order: "",
                        isActive: true,
                });
        };

        const handleSubmit = async (event) => {
                event.preventDefault();
                const payload = {
                        title: formState.title.trim(),
                        subtitle: formState.subtitle.trim(),
                        isActive: formState.isActive,
                };

                if (selectedSlide) {
                        const numericOrder = formState.order === "" ? null : Number(formState.order);
                        if (!Number.isNaN(numericOrder) && numericOrder !== null) {
                                payload.order = numericOrder;
                        }
                }

                if (!selectedSlide && !formState.image) {
                        toast.error(t("slider.form.imageRequired"));
                        return;
                }

                if (formState.image && (formState.imageChanged || !selectedSlide)) {
                        payload.image = formState.image;
                }

                try {
                        if (selectedSlide) {
                                await updateSlide(selectedSlide._id, payload);
                        } else {
                                await createSlide(payload);
                        }
                        resetForm();
                } catch (error) {
                        console.error("Saving slider item failed", error);
                }
        };

        const handleEdit = (slide) => setSelectedSlide(slide);

        const handleDelete = (slide) => {
                if (globalThis.window?.confirm(t("slider.confirmDelete"))) {
                        deleteSlide(slide._id);
                }
        };

        const moveSlide = async (fromIndex, direction) => {
                const targetIndex = fromIndex + direction;
                if (targetIndex < 0 || targetIndex >= sortedSlides.length) return;

                const updated = [...sortedSlides];
                const [removed] = updated.splice(fromIndex, 1);
                updated.splice(targetIndex, 0, removed);

                try {
                        await reorderSlides(updated);
                } catch (error) {
                        console.error("Reordering slides failed", error);
                }
        };

        return (
                <div className='space-y-6'>
                        <div className='rounded-xl border border-ali-card bg-gradient-to-br from-white to-ali-card/60 p-6 shadow-lg'>
                                <div className='mb-6 flex items-center justify-between'>
                                        <div>
                                                <h2 className='text-2xl font-bold text-ali-ink'>{t("slider.title")}</h2>
                                                <p className='text-sm text-ali-muted'>{t("slider.subtitle")}</p>
                                        </div>
                                        {selectedSlide && (
                                                <button
                                                        type='button'
                                                        onClick={resetForm}
                                                        className='inline-flex items-center gap-2 rounded-md bg-ali-card px-4 py-2 text-sm text-ali-ink transition hover:bg-white'
                                                >
                                                        <X className='h-4 w-4' />
                                                        {t("slider.cancelEdit")}
                                                </button>
                                        )}
                                </div>

                                <form onSubmit={handleSubmit} className='space-y-5'>
                                        <div className='grid gap-5 md:grid-cols-2'>
                                                <div>
                                                        <label className='block text-sm font-medium text-ali-ink' htmlFor='slider-title'>
                                                                {t("slider.form.title")}
                                                        </label>
                                                        <input
                                                                id='slider-title'
                                                                type='text'
                                                                className='mt-1 block w-full rounded-md border border-ali-card bg-white px-3 py-2 text-ali-ink focus:border-payzone-gold focus:outline-none focus:ring-2 focus:ring-payzone-indigo'
                                                                value={formState.title}
                                                                onChange={(event) =>
                                                                        setFormState((previous) => ({
                                                                                ...previous,
                                                                                title: event.target.value,
                                                                        }))
                                                                }
                                                        />
                                                </div>
                                                <div>
                                                        <label className='block text-sm font-medium text-ali-ink' htmlFor='slider-subtitle'>
                                                                {t("slider.form.subtitle")}
                                                        </label>
                                                        <input
                                                                id='slider-subtitle'
                                                                type='text'
                                                                className='mt-1 block w-full rounded-md border border-ali-card bg-white px-3 py-2 text-ali-ink focus:border-payzone-gold focus:outline-none focus:ring-2 focus:ring-payzone-indigo'
                                                                value={formState.subtitle}
                                                                onChange={(event) =>
                                                                        setFormState((previous) => ({
                                                                                ...previous,
                                                                                subtitle: event.target.value,
                                                                        }))
                                                                }
                                                        />
                                                </div>
                                        </div>

                                        <div className='grid gap-5 md:grid-cols-2'>
                                                {selectedSlide && (
                                                        <div>
                                                                <label className='block text-sm font-medium text-ali-ink' htmlFor='slider-order'>
                                                                        {t("slider.form.order")}
                                                                </label>
                                                                <input
                                                                        id='slider-order'
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
                                                )}
                                                <div className='flex flex-col gap-2'>
                                                        <span className='text-sm font-medium text-ali-ink'>{t("slider.form.isActive")}</span>
                                                        <label className='inline-flex items-center gap-2 text-sm text-ali-muted'>
                                                                <input
                                                                        type='checkbox'
                                                                        checked={formState.isActive}
                                                                        onChange={(event) =>
                                                                                setFormState((previous) => ({
                                                                                        ...previous,
                                                                                        isActive: event.target.checked,
                                                                                }))
                                                                        }
                                                                        className='h-4 w-4 rounded border-ali-card text-payzone-indigo focus:ring-payzone-indigo'
                                                                />
                                                                <span>{formState.isActive ? t("slider.form.active") : t("slider.form.inactive")}</span>
                                                        </label>
                                                </div>
                                        </div>

                                        <div>
                                                <label className='block text-sm font-medium text-ali-ink'>{t("slider.form.image")}</label>
                                                <div className='mt-1 flex items-center gap-3'>
                                                        <label className='inline-flex cursor-pointer items-center gap-2 rounded-md bg-payzone-indigo px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-payzone-gold hover:text-ali-ink'>
                                                                <ImagePlus className='h-4 w-4' />
                                                                {t("slider.form.upload")}
                                                                <input type='file' accept='image/*' className='hidden' onChange={handleImageChange} />
                                                        </label>
                                                        {formState.preview && (
                                                                <img
                                                                        src={formState.preview}
                                                                        alt={formState.title || "slider-preview"}
                                                                        className='h-16 w-28 rounded-lg object-cover ring-1 ring-ali-card'
                                                                />
                                                        )}
                                                </div>
                                                <p className='mt-1 text-xs text-ali-muted'>{t("slider.form.imageHint")}</p>
                                        </div>

                                        <div className='flex flex-wrap items-center gap-3'>
                                                <button
                                                        type='submit'
                                                        disabled={loading}
                                                        className='inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-ali-red to-ali-rose px-5 py-2 font-semibold text-white shadow-md transition hover:shadow-lg disabled:opacity-60'
                                                >
                                                        <Save className='h-4 w-4' />
                                                        {selectedSlide ? t("slider.form.submitUpdate") : t("slider.form.submitCreate")}
                                                </button>
                                                {selectedSlide && (
                                                        <button
                                                                type='button'
                                                                onClick={resetForm}
                                                                className='inline-flex items-center gap-2 rounded-md border border-ali-card px-4 py-2 text-sm text-ali-ink shadow-sm transition hover:bg-white'
                                                        >
                                                                <X className='h-4 w-4' />
                                                                {t("slider.cancelEdit")}
                                                        </button>
                                                )}
                                        </div>
                                </form>
                        </div>

                        <div className='rounded-xl border border-ali-card bg-white p-6 shadow-lg'>
                                <div className='mb-4 flex items-center justify-between'>
                                        <h3 className='text-xl font-semibold text-ali-ink'>{t("slider.list.title")}</h3>
                                        <p className='text-sm text-ali-muted'>
                                                {sortedSlides.length ? t("slider.list.reorderHint") : t("slider.list.empty")}
                                        </p>
                                </div>
                                <div className='grid gap-4 md:grid-cols-2'>
                                        {sortedSlides.map((slide, index) => (
                                                <div key={slide._id} className='flex gap-4 rounded-lg border border-ali-card bg-ali-card/40 p-4 shadow-sm'>
                                                        <img
                                                                src={slide.imageUrl}
                                                                alt={slide.title || `slide-${index + 1}`}
                                                                className='h-24 w-32 rounded-lg object-cover shadow'
                                                        />
                                                        <div className='flex flex-1 flex-col justify-between gap-2'>
                                                                <div>
                                                                        <h4 className='text-lg font-semibold text-ali-ink'>
                                                                                {slide.title || t("slider.list.fallbackTitle", { index: index + 1 })}
                                                                        </h4>
                                                                        {slide.subtitle && <p className='text-sm text-ali-muted'>{slide.subtitle}</p>}
                                                                        <p className='text-xs text-ali-muted'>
                                                                                {t("slider.list.order")}: {slide.order ?? "-"}
                                                                        </p>
                                                                </div>
                                                                <div className='flex flex-wrap items-center gap-2'>
                                                                        <button
                                                                                type='button'
                                                                                onClick={() => moveSlide(index, -1)}
                                                                                className='inline-flex items-center gap-1 rounded-md border border-ali-card px-3 py-1 text-sm text-ali-ink transition hover:bg-white'
                                                                                aria-label={t("slider.actions.moveUp")}
                                                                        >
                                                                                <ArrowUp className='h-4 w-4' />
                                                                                {t("slider.actions.up")}
                                                                        </button>
                                                                        <button
                                                                                type='button'
                                                                                onClick={() => moveSlide(index, 1)}
                                                                                className='inline-flex items-center gap-1 rounded-md border border-ali-card px-3 py-1 text-sm text-ali-ink transition hover:bg-white'
                                                                                aria-label={t("slider.actions.moveDown")}
                                                                        >
                                                                                <ArrowDown className='h-4 w-4' />
                                                                                {t("slider.actions.down")}
                                                                        </button>
                                                                        <button
                                                                                type='button'
                                                                                onClick={() => handleEdit(slide)}
                                                                                className='inline-flex items-center gap-1 rounded-md bg-ali-card px-3 py-1 text-sm text-ali-ink transition hover:bg-white'
                                                                        >
                                                                                <Pencil className='h-4 w-4' />
                                                                                {t("slider.actions.edit")}
                                                                        </button>
                                                                        <button
                                                                                type='button'
                                                                                onClick={() => handleDelete(slide)}
                                                                                className='inline-flex items-center gap-1 rounded-md bg-white px-3 py-1 text-sm text-ali-red shadow-sm transition hover:bg-ali-rose/10'
                                                                        >
                                                                                <Trash2 className='h-4 w-4' />
                                                                                {t("slider.actions.delete")}
                                                                        </button>
                                                                </div>
                                                        </div>
                                                </div>
                                        ))}
                                        {!sortedSlides.length && (
                                                <div className='col-span-full rounded-lg border border-dashed border-ali-card bg-ali-card/40 p-6 text-center text-ali-muted'>
                                                        {t("slider.list.empty")}
                                                </div>
                                        )}
                                </div>
                        </div>
                </div>
        );
};

export default SliderManager;
