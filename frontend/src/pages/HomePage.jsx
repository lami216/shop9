import { useEffect } from "react";
import useTranslation from "../hooks/useTranslation";
import CategoryItem from "../components/CategoryItem";
import { useProductStore } from "../stores/useProductStore";
import FeaturedProducts from "../components/FeaturedProducts";
import { useCategoryStore } from "../stores/useCategoryStore";
import BannerSlider from "../components/BannerSlider";

const HomePage = () => {
        const { fetchFeaturedProducts, products, loading: productsLoading } = useProductStore();
        const { categories, fetchCategories, loading: categoriesLoading } = useCategoryStore();
        const { t } = useTranslation();

        useEffect(() => {
                fetchFeaturedProducts();
        }, [fetchFeaturedProducts]);

        useEffect(() => {
                fetchCategories();
        }, [fetchCategories]);

        return (
                <div className='relative min-h-screen overflow-hidden bg-ali-bg text-ali-ink'>
                        <div className='relative z-10 mx-auto max-w-5xl px-4 pb-16 pt-6 sm:px-6 lg:px-8'>
                                <div className='mb-6 space-y-4'>
                                        <BannerSlider />
                                        <div className='rounded-2xl bg-white p-4 text-center text-lg font-semibold text-ali-ink shadow-sm sm:p-5'>
                                                مرحباً بكم في علي ستور
                                        </div>
                                </div>

                                <div className='space-y-4'>
                                        <div className='flex items-center justify-between'>
                                                <h2 className='text-xl font-bold text-ali-ink sm:text-2xl'>
                                                        {t("home.titleLine1")} <span className='bg-gradient-to-r from-ali-red to-ali-rose bg-clip-text text-transparent'>{t("home.titleHighlight")}</span>
                                                </h2>
                                        </div>
                                        <div className='grid grid-cols-2 gap-4 sm:grid-cols-3'>
                                                {categories.length === 0 && !categoriesLoading && (
                                                        <div className='col-span-full text-center text-ali-muted'>
                                                                {t("categories.manager.list.empty")}
                                                        </div>
                                                )}
                                                {categories.map((category) => (
                                                        <CategoryItem category={category} key={category._id} />
                                                ))}
                                        </div>
                                </div>

                                {!productsLoading && products.length > 0 && (
                                        <div className='mt-10 rounded-2xl bg-white p-4 shadow-sm sm:p-6'>
                                                <FeaturedProducts featuredProducts={products} />
                                        </div>
                                )}
                        </div>
                </div>
        );
};
export default HomePage;
