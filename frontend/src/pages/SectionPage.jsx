import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import useTranslation from "../hooks/useTranslation";
import CategoryItem from "../components/CategoryItem";
import { useSectionStore } from "../stores/useSectionStore";

const SectionPage = () => {
        const { slug } = useParams();
        const { fetchSectionBySlug, loading, error } = useSectionStore();
        const { t } = useTranslation();
        const [section, setSection] = useState(null);
        const [categories, setCategories] = useState([]);

        useEffect(() => {
                const loadSection = async () => {
                        try {
                                const data = await fetchSectionBySlug(slug);
                                setSection(data.section);
                                setCategories(data.categories || []);
                        } catch {
                                setSection(null);
                                setCategories([]);
                        }
                };

                loadSection();
        }, [fetchSectionBySlug, slug]);

        return (
                <div className='min-h-screen bg-ali-bg text-ali-ink'>
                        <div className='relative z-10 mx-auto max-w-5xl px-4 pb-16 pt-10 sm:px-6 lg:px-8'>
                                {error && (
                                        <div className='mb-6 rounded-2xl border border-ali-orange/40 bg-ali-orange/10 p-4 text-center text-sm text-ali-ink'>
                                                {error}
                                        </div>
                                )}

                                {loading && (
                                        <div className='mb-6 flex justify-center'>
                                                <motion.div
                                                        className='rounded-full border-4 border-ali-rose/30 border-t-ali-red p-6'
                                                        animate={{ rotate: 360 }}
                                                        transition={{ repeat: Infinity, ease: "linear", duration: 1 }}
                                                />
                                        </div>
                                )}

                                {section && (
                                        <div className='mb-8 space-y-2 text-center'>
                                                <motion.h1
                                                        className='text-3xl font-extrabold text-ali-ink sm:text-4xl'
                                                        initial={{ opacity: 0, y: -20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ duration: 0.8 }}
                                                >
                                                        {section.name}
                                                </motion.h1>
                                                {section.description && (
                                                        <p className='text-ali-muted'>{section.description}</p>
                                                )}
                                        </div>
                                )}

                                {categories.length === 0 && !loading ? (
                                        <div className='rounded-2xl bg-white p-6 text-center text-ali-muted shadow-sm'>
                                                {t("sections.empty")}
                                                <div className='mt-4'>
                                                        <Link
                                                                to='/'
                                                                className='rounded-md bg-payzone-gold px-4 py-2 text-sm font-semibold text-payzone-navy shadow-sm transition hover:bg-[#b8873d]'
                                                        >
                                                                {t("sections.backToHome")}
                                                        </Link>
                                                </div>
                                        </div>
                                ) : (
                                        <motion.div
                                                className='grid grid-cols-2 gap-4 sm:grid-cols-3'
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.6 }}
                                        >
                                                {categories.map((category) => (
                                                        <CategoryItem category={category} key={category._id} />
                                                ))}
                                        </motion.div>
                                )}
                        </div>
                </div>
        );
};

export default SectionPage;
