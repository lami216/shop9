import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSliderStore } from "../stores/useSliderStore";
import useTranslation from "../hooks/useTranslation";

const BannerSlider = () => {
        const [current, setCurrent] = useState(0);
        const touchStartX = useRef(null);
        const { slides, fetchSlides } = useSliderStore();
        const { i18n } = useTranslation();
        const isArabic = i18n.language === "ar";

        useEffect(() => {
                fetchSlides(true);
        }, [fetchSlides]);

        const sliderItems = useMemo(() => {
                if (Array.isArray(slides) && slides.length > 0) {
                        return [...slides]
                                .filter((slide) => slide?.imageUrl)
                                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                                .map((slide, index) => ({
                                        key: slide._id || index,
                                        image: slide.imageUrl,
                                        title: slide.title || "",
                                        subtitle: slide.subtitle || "",
                                }));
                }

                return [];
        }, [slides]);

        const totalSlides = sliderItems.length;

        useEffect(() => {
                if (!totalSlides) return undefined;

                const interval = setInterval(() => {
                        setCurrent((prev) => (prev + 1) % totalSlides);
                }, 5000);

                return () => clearInterval(interval);
        }, [totalSlides]);

        useEffect(() => {
                setCurrent(0);
        }, [totalSlides]);

        const goTo = (index) => {
                if (!totalSlides) return;
                setCurrent((index + totalSlides) % totalSlides);
        };

        const handleTouchStart = (event) => {
                touchStartX.current = event.touches[0].clientX;
        };

        const handleTouchEnd = (event) => {
                if (touchStartX.current === null) return;
                const delta = event.changedTouches[0].clientX - touchStartX.current;
                if (Math.abs(delta) > 50) {
                        goTo(current + (delta > 0 ? -1 : 1));
                }
                touchStartX.current = null;
        };

        return (
                <div className='relative w-full overflow-hidden rounded-3xl bg-white shadow-lg'>
                        {totalSlides > 0 ? (
                                <>
                                        <div
                                                className='flex transition-transform duration-500 ease-in-out'
                                                style={{ transform: `translateX(-${current * 100}%)` }}
                                                onTouchStart={handleTouchStart}
                                                onTouchEnd={handleTouchEnd}
                                        >
                                                {sliderItems.map((slide) => (
                                                        <div key={slide.key} className='relative w-full flex-shrink-0'>
                                                                <img
                                                                        src={slide.image}
                                                                        alt={slide.title}
                                                                        className='h-[220px] w-full object-cover sm:h-[320px]'
                                                                />
                                                                <div className='absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent' />
                                                                <div className='absolute inset-y-0 flex h-full w-full items-center px-5 sm:px-10'>
                                                                        <div className='max-w-xl text-white drop-shadow'>
                                                                                <h3 className='text-2xl font-bold sm:text-3xl'>{slide.title}</h3>
                                                                                <p className='mt-2 text-sm sm:text-base'>{slide.subtitle}</p>
                                                                        </div>
                                                                </div>
                                                                <div className='absolute bottom-3 left-0 right-0 flex justify-center gap-2'>
                                                                        {sliderItems.map((_, dotIndex) => (
                                                                                <button
                                                                                        key={dotIndex}
                                                                                        type='button'
                                                                                        aria-label={`الانتقال إلى الشريحة ${dotIndex + 1}`}
                                                                                        className={`h-2 w-2 rounded-full transition ${
                                                                                                dotIndex === current ? "w-6 bg-white" : "bg-white/70"
                                                                                        }`}
                                                                                        onClick={() => goTo(dotIndex)}
                                                                                />
                                                                        ))}
                                                                </div>
                                                        </div>
                                                ))}
                                        </div>

                                        <button
                                                type='button'
                                                className='absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ali-ink shadow hover:bg-white sm:left-4'
                                                onClick={() => goTo(current - 1)}
                                                aria-label='الشريحة السابقة'
                                        >
                                                {isArabic ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                                        </button>
                                        <button
                                                type='button'
                                                className='absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ali-ink shadow hover:bg-white sm:right-4'
                                                onClick={() => goTo(current + 1)}
                                                aria-label='الشريحة التالية'
                                        >
                                                {isArabic ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                                        </button>
                                </>
                        ) : (
                                <div className='h-[220px] w-full sm:h-[320px]' aria-hidden='true' />
                        )}
                </div>
        );
};

export default BannerSlider;
