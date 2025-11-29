import { useEffect, useMemo } from "react";
import { useProductStore } from "../stores/useProductStore";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import useTranslation from "../hooks/useTranslation";
import ProductCard from "../components/ProductCard";
import { useCategoryStore } from "../stores/useCategoryStore";
import SearchBar from "../components/SearchBar";
import { useSearchStore } from "../stores/useSearchStore";

const CategoryPage = () => {
        const { fetchProductsByCategory, products } = useProductStore();
        const { categories, fetchCategories } = useCategoryStore();
        const { category } = useParams();
        const { t } = useTranslation();
        const {
                query: searchQuery,
                results: searchResults,
                loading: searchLoading,
                error: searchError,
                category: activeSearchCategory,
                setQuery,
                setCategory,
        } = useSearchStore((state) => ({
                query: state.query,
                results: state.results,
                loading: state.loading,
                error: state.error,
                category: state.category,
                setQuery: state.setQuery,
                setCategory: state.setCategory,
        }));
        const [searchParams] = useSearchParams();

        useEffect(() => {
                fetchProductsByCategory(category);
        }, [fetchProductsByCategory, category]);

        useEffect(() => {
                if (!categories.length) {
                        fetchCategories();
                }
        }, [categories.length, fetchCategories]);

        useEffect(() => {
                const nextQuery = searchParams.get("q") ?? "";
                const nextCategory = searchParams.get("category");

                setQuery(nextQuery);
                if (nextCategory) {
                        setCategory(nextCategory);
                } else {
                        setCategory(category);
                }
        }, [searchParams, setQuery, setCategory, category]);

        const activeCategory = useMemo(
                () => categories.find((item) => item.slug === category),
                [categories, category]
        );

        const categoryName = useMemo(() => {
                if (activeCategory) {
                        return activeCategory.name;
                }
                const fallback = category ? category.charAt(0).toUpperCase() + category.slice(1) : "";
                return fallback;
        }, [activeCategory, category]);

        const categorySection = activeCategory?.section || null;

        const isFilteringCurrentCategory = Boolean(searchQuery.trim()) && activeSearchCategory === category;
        const displayedProducts = isFilteringCurrentCategory ? searchResults : products;
        const showSearchEmptyState =
                isFilteringCurrentCategory && !searchLoading && !searchError && searchResults.length === 0;

        return (
                <div className='min-h-screen bg-ali-bg text-ali-ink'>
                        <div className='relative z-10 mx-auto max-w-5xl px-4 pb-16 pt-10 sm:px-6 lg:px-8'>
                                <div className='mb-6 rounded-2xl bg-white p-4 shadow-sm sm:p-6'>
                                        <SearchBar variant='category' categorySlug={category} />
                                </div>
                                {categorySection && (
                                        <div className='mb-3 flex flex-wrap items-center justify-center gap-2 text-sm text-ali-muted'>
                                                <Link
                                                        to={`/sections/${categorySection.slug || "general-services"}`}
                                                        className='font-semibold text-ali-ink transition hover:text-ali-red'
                                                >
                                                        {categorySection.name}
                                                </Link>
                                                <span className='text-ali-muted'>›</span>
                                                <span className='font-semibold text-ali-ink'>{categoryName}</span>
                                        </div>
                                )}

                                <motion.h1
                                        className='mb-6 text-center text-3xl font-extrabold text-ali-ink sm:text-4xl'
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.8 }}
                                >
                                        {categoryName}
                                </motion.h1>

                                {searchError && isFilteringCurrentCategory && (
                                        <div className='mb-6 rounded-2xl border border-ali-orange/40 bg-ali-orange/10 p-4 text-center text-sm text-ali-ink'>
                                                {searchError}
                                        </div>
                                )}

                                {searchLoading && isFilteringCurrentCategory && (
                                        <div className='mb-6 flex justify-center'>
                                                <motion.div
                                                        className='rounded-full border-4 border-ali-rose/30 border-t-ali-red p-6'
                                                        animate={{ rotate: 360 }}
                                                        transition={{ repeat: Infinity, ease: "linear", duration: 1 }}
                                                />
                                        </div>
                                )}

                                {showSearchEmptyState && (
                                        <div className='mb-6 rounded-2xl border border-ali-card bg-white p-6 text-center text-lg text-ali-muted'>
                                                {t("search.noResults", { query: searchQuery.trim() })}
                                        </div>
                                )}

                                <motion.div
                                        className='grid grid-cols-2 gap-4 justify-items-center sm:gap-6 lg:grid-cols-3'
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.8, delay: 0.2 }}
                                >
                                        {!isFilteringCurrentCategory && displayedProducts?.length === 0 && (
                                                <h2 className='col-span-full text-center text-xl font-semibold text-ali-muted'>
                                                        {t("categoryPage.noProducts")}
                                                </h2>
                                        )}

                                        {displayedProducts?.map((product) => (
                                                <ProductCard key={product._id} product={product} />
                                        ))}
                                </motion.div>
                        </div>
                </div>
        );
};
export default CategoryPage;
