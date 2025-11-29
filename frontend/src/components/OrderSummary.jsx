import { motion } from "framer-motion";
import { useCartStore } from "../stores/useCartStore";
import { useNavigate } from "react-router-dom";
import useTranslation from "../hooks/useTranslation";
import { formatMRU } from "../lib/formatMRU";
import { formatNumberEn } from "../lib/formatNumberEn";

const OrderSummary = () => {
        const { cart, total, discountedSubtotal, coupon, totalDiscountAmount, isCouponApplied } =
                useCartStore();
        const navigate = useNavigate();
        const { t } = useTranslation();

        const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
        const isDisabled = totalQuantity === 0;
        const couponSavings = Math.max(
                Number.isFinite(totalDiscountAmount) ? totalDiscountAmount : 0,
                discountedSubtotal - total,
                0
        );
        const hasCouponSavings = Boolean(coupon?.code) && couponSavings > 0 && isCouponApplied;

        const handleCheckout = () => {
                if (isDisabled) return;
                navigate("/checkout");
        };

        return (
                <motion.section
                        className='space-y-5 rounded-3xl bg-white p-6 text-ali-ink shadow-sm ring-1 ring-ali-card'
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        dir='rtl'
                >
                        <h2 className='text-[clamp(1.4rem,3.2vw,1.7rem)] font-semibold text-right'>
                                {t("cart.summary.title")}
                        </h2>

                        <div className='space-y-3 rounded-2xl bg-ali-card p-5 text-[clamp(0.95rem,2.4vw,1rem)] text-ali-muted shadow-inner ring-1 ring-ali-card'>
                                <div className='flex items-center justify-between'>
                                        <span>{t("cart.summary.productsCount")}</span>
                                        <span className='text-[clamp(1.05rem,2.6vw,1.2rem)] font-semibold text-ali-ink'>
                                                {formatNumberEn(totalQuantity)}
                                        </span>
                                </div>
                                <div className='flex items-center justify-between border-t border-ali-card pt-3'>
                                        <span>{t("cart.summary.discountedSubtotal")}</span>
                                        <span className='text-[clamp(1.05rem,2.6vw,1.2rem)] font-semibold text-ali-ink'>
                                                {formatMRU(discountedSubtotal)}
                                        </span>
                                </div>
                                {hasCouponSavings && (
                                        <div className='flex items-center justify-between border-t border-ali-card pt-3 text-sm text-ali-red'>
                                                <span>{t("cart.summary.couponSavings")}</span>
                                                <span>-{formatMRU(couponSavings)}</span>
                                        </div>
                                )}
                                <div className='flex items-center justify-between border-t border-ali-card pt-3 text-[clamp(1.1rem,2.8vw,1.3rem)] font-semibold'>
                                        <span className='text-ali-ink'>{t("cart.summary.grandTotal")}</span>
                                        <span className='text-ali-ink'>{formatMRU(total)}</span>
                                </div>
                        </div>

                        <motion.button
                                type='button'
                                className='w-full rounded-full bg-gradient-to-r from-ali-red to-ali-rose px-6 py-3 text-sm font-semibold text-white shadow transition-colors duration-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ali-rose focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60 md:w-1/2 md:self-end'
                                whileHover={isDisabled ? undefined : { scale: 1.02 }}
                                whileTap={isDisabled ? undefined : { scale: 0.97 }}
                                onClick={handleCheckout}
                                disabled={isDisabled}
                        >
                                {t("cart.summary.proceed")}
                        </motion.button>
                </motion.section>
        );
};
export default OrderSummary;
