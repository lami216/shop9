import { useEffect, useMemo, useState } from "react";
import { ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import useTranslation from "../hooks/useTranslation";
import { useCartStore } from "../stores/useCartStore";
import { formatMRU } from "../lib/formatMRU";
import { getProductPricing } from "../lib/getProductPricing";

const FeaturedProducts = ({ featuredProducts }) => {
        const [currentIndex, setCurrentIndex] = useState(0);
        const [itemsPerPage, setItemsPerPage] = useState(4);

        const { addToCart } = useCartStore();
        const { t } = useTranslation();

        const products = useMemo(
                () => (Array.isArray(featuredProducts) ? featuredProducts : []),
                [featuredProducts]
        );
        const totalItems = products.length;

        useEffect(() => {
                const handleResize = () => {
                        if (window.innerWidth < 640) setItemsPerPage(1);
                        else if (window.innerWidth < 1024) setItemsPerPage(2);
                        else if (window.innerWidth < 1280) setItemsPerPage(3);
                        else setItemsPerPage(4);
                };

                handleResize();
                window.addEventListener("resize", handleResize);
                return () => window.removeEventListener("resize", handleResize);
        }, []);

        useEffect(() => {
                setCurrentIndex((previous) =>
                        Math.min(previous, Math.max(totalItems - itemsPerPage, 0))
                );
        }, [totalItems, itemsPerPage]);

        const nextSlide = () => {
                setCurrentIndex((prevIndex) =>
                        Math.min(prevIndex + itemsPerPage, Math.max(totalItems - itemsPerPage, 0))
                );
        };

        const prevSlide = () => {
                setCurrentIndex((prevIndex) => Math.max(prevIndex - itemsPerPage, 0));
        };

        const isStartDisabled = currentIndex === 0;
        const isEndDisabled = currentIndex >= Math.max(totalItems - itemsPerPage, 0);

        return (
                <div className='py-6'>
                        <div className='mx-auto px-2 sm:px-4'>
                                <h2 className='mb-6 text-center text-2xl font-extrabold text-ali-ink sm:text-3xl'>
                                        <span className='bg-gradient-to-r from-ali-red to-ali-rose bg-clip-text text-transparent'>
                                                {t("home.featuredTitle")}
                                        </span>
                                </h2>
                                <div className='relative'>
                                        <div className='overflow-hidden'>
                                                <div
                                                        className='flex transition-transform duration-300 ease-in-out'
                                                        style={{ transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)` }}
                                                >
                                                        {products.map((product) => {
                                                                const { price, discountedPrice, isDiscounted, discountPercentage } =
                                                                        getProductPricing(product);
                                                                const enrichedProduct = {
                                                                        ...product,
                                                                        discountedPrice,
                                                                        isDiscounted,
                                                                        discountPercentage,
                                                                };
                                                                return (
                                                                        <div key={product._id} className='w-full flex-shrink-0 px-2 sm:w-1/2 lg:w-1/3 xl:w-1/4'>
                                                                                <div className='group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-ali-card transition duration-300 hover:-translate-y-1 hover:shadow-lg'>
                                                                                        <div className='relative overflow-hidden'>
                                                                                                {isDiscounted && (
                                                                                                        <span className='absolute right-3 top-3 z-10 rounded-full bg-ali-orange px-3 py-1 text-xs font-semibold text-white shadow'>
                                                                                                                -{discountPercentage}%
                                                                                                        </span>
                                                                                                )}
                                                                                                <img
                                                                                                        src={product.image}
                                                                                                        alt={product.name}
                                                                                                        className='h-48 w-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105'
                                                                                                />
                                                                                        </div>
                                                                                        <div className='flex flex-1 flex-col justify-between bg-ali-card px-4 py-4'>
                                                                                                <h3 className='mb-2 line-clamp-2 text-lg font-semibold text-ali-ink'>{product.name}</h3>
                                                                                                <div className='mb-4 flex flex-wrap items-baseline gap-2 text-ali-ink'>
                                                                                                        {isDiscounted ? (
                                                                                                                <>
                                                                                                                        <span className='max-w-full break-words text-sm text-ali-muted line-through'>
                                                                                                                                {formatMRU(price)}
                                                                                                                        </span>
                                                                                                                        <span className='max-w-full break-words text-lg font-bold text-ali-red'>
                                                                                                                                {formatMRU(discountedPrice)}
                                                                                                                        </span>
                                                                                                                </>
                                                                                                        ) : (
                                                                                                                <span className='max-w-full break-words text-lg font-semibold leading-tight text-ali-red'>
                                                                                                                        {formatMRU(price)}
                                                                                                                </span>
                                                                                                        )}
                                                                                                </div>
                                                                                                <button
                                                                                                        onClick={() => addToCart(enrichedProduct)}
                                                                                                        className='flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-ali-red to-ali-rose py-2 px-4 font-semibold text-white shadow transition duration-300 hover:shadow-md'
                                                                                                >
                                                                                                        <ShoppingCart className='h-5 w-5' />
                                                                                                        {t("common.actions.addToCart")}
                                                                                                </button>
                                                                                        </div>
                                                                                </div>
                                                                        </div>
                                                                );
                                                        })}
                                                </div>
                                        </div>
                                        <button
                                                onClick={prevSlide}
                                                disabled={isStartDisabled}
                                                className={`absolute top-1/2 -right-4 hidden -translate-y-1/2 transform items-center justify-center rounded-full p-2 transition-colors duration-300 sm:flex ${
                                                        isStartDisabled
                                                                ? "cursor-not-allowed bg-ali-card text-ali-muted/60"
                                                                : "bg-white text-ali-ink shadow hover:bg-ali-card"
                                                }`}
                                        >
                                                <ChevronRight className='h-6 w-6' />
                                        </button>

                                        <button
                                                onClick={nextSlide}
                                                disabled={isEndDisabled}
                                                className={`absolute top-1/2 -left-4 hidden -translate-y-1/2 transform items-center justify-center rounded-full p-2 transition-colors duration-300 sm:flex ${
                                                        isEndDisabled
                                                                ? "cursor-not-allowed bg-ali-card text-ali-muted/60"
                                                                : "bg-white text-ali-ink shadow hover:bg-ali-card"
                                                }`}
                                        >
                                                <ChevronLeft className='h-6 w-6' />
                                        </button>
                                </div>
                        </div>
                </div>
        );
};
export default FeaturedProducts;
