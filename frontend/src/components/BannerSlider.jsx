import { useEffect, useMemo, useRef, useState } from "react";
import { useSliderStore } from "../stores/useSliderStore";

const BannerSlider = () => {
        const [current, setCurrent] = useState(0);
        const touchStartX = useRef(null);
        const { slides, fetchSlides } = useSliderStore();
        const FALLBACK_IMAGE =
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1600' height='600' viewBox='0 0 1600 600'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' x2='1' y1='0' y2='1'%3E%3Cstop stop-color='%23dbeafe' offset='0'/%3E%3Cstop stop-color='%23bfdbfe' offset='1'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1600' height='600' fill='url(%23g)'/%3E%3Ctext x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%2325466b' font-family='Arial' font-size='48'%3ESlider%20image%20placeholder%3C/text%3E%3C/svg%3E";

        const resolveImageUrl = (value) => {
                if (typeof value !== "string") return "";

                const trimmed = value.trim();
                if (!trimmed) return "";

                if (/^data:image\//i.test(trimmed)) return trimmed;
                if (/^https?:\/\//i.test(trimmed)) return trimmed;

                if (trimmed.startsWith("//")) {
                        const protocol = typeof window !== "undefined" ? window.location.protocol : "https:";
                        return `${protocol}${trimmed}`;
                }

                const baseOrigin = typeof window !== "undefined" ? window.location.origin : "";
                if (trimmed.startsWith("/")) return `${baseOrigin}${trimmed}`;

                return `${baseOrigin}/${trimmed}`;
        };

        useEffect(() => {
                fetchSlides();
        }, [fetchSlides]);

        const sliderItems = useMemo(() => {
                if (!Array.isArray(slides) || slides.length === 0) return [];

                return [...slides]
                        .map((slide, index) => {
                                const rawImageUrl =
                                        slide?.imageUrl ?? slide?.image ?? slide?.url ?? slide?.image?.url ?? "";
                                const resolvedUrl = resolveImageUrl(rawImageUrl);

                                const parsedOrder = Number(slide?.order);
                                const normalizedOrder = Number.isInteger(parsedOrder) ? parsedOrder : index;

                                return {
                                        key: slide?._id || index,
                                        imageUrl: resolvedUrl,
                                        title: slide?.title || "",
                                        subtitle: slide?.subtitle || "",
                                        order: normalizedOrder,
                                };
                        })
                        .filter((slide) => slide.imageUrl !== "")
                        .sort((a, b) => a.order - b.order);
        }, [slides]);

        const totalSlides = sliderItems.length;
        // Keep the number of visible slides within the available count to avoid empty frames
        const effectiveSlidesPerView = 1;
        const maxIndex = Math.max(totalSlides - effectiveSlidesPerView, 0);

        useEffect(() => {
                if (!totalSlides) return undefined;

                const interval = setInterval(() => {
                        setCurrent((prev) => (prev + 1) % (maxIndex + 1 || 1));
                }, 5000);

                return () => clearInterval(interval);
        }, [maxIndex, totalSlides]);

        useEffect(() => {
                setCurrent(0);
        }, [totalSlides, effectiveSlidesPerView]);

        const goTo = (index) => {
                if (!totalSlides) return;
                const safeIndex = Math.min(Math.max(index, 0), maxIndex);
                setCurrent(safeIndex);
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
                                                style={{ transform: `translateX(-${current * (100 / effectiveSlidesPerView)}%)` }}
                                                onTouchStart={handleTouchStart}
                                                onTouchEnd={handleTouchEnd}
                                        >
                                                {sliderItems.map((slide) => (
                                                        <div
                                                                key={slide.key}
                                                                className='relative w-full flex-shrink-0'
                                                                style={{
                                                                        maxWidth: `${100 / effectiveSlidesPerView}%`,
                                                                        flexBasis: `${100 / effectiveSlidesPerView}%`,
                                                                }}
                                                        >
                                                                <img
                                                                        src={slide.imageUrl}
                                                                        alt={slide.title}
                                                                        className='h-[220px] w-full object-cover sm:h-[320px]'
                                                                        onError={(event) => {
                                                                                if (event.currentTarget.src !== FALLBACK_IMAGE) {
                                                                                        event.currentTarget.src = FALLBACK_IMAGE;
                                                                                }
                                                                        }}
                                                                />
                                                                <div className='pointer-events-none absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent' />
                                                                <div className='pointer-events-none absolute inset-y-0 flex h-full w-full items-center px-5 sm:px-10'>
                                                                        <div className='max-w-xl text-white drop-shadow'>
                                                                                <h3 className='text-2xl font-bold sm:text-3xl'>{slide.title}</h3>
                                                                                <p className='mt-2 text-sm sm:text-base'>{slide.subtitle}</p>
                                                                        </div>
                                                                </div>
                                                        </div>
                                                ))}
                                        </div>
                                </>
                        ) : (
                                <div className='h-[220px] w-full sm:h-[320px]' aria-hidden='true' />
                        )}
                </div>
        );
};

export default BannerSlider;
