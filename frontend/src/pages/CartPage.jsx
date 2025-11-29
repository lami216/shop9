import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { useCartStore } from "../stores/useCartStore";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import useTranslation from "../hooks/useTranslation";
import CartItem from "../components/CartItem";
import OrderSummary from "../components/OrderSummary";
import GiftCouponCard from "../components/GiftCouponCard";

const CartPage = () => {
        const { cart } = useCartStore();
        const { t } = useTranslation();
        const leadText = t("cart.summary.lead");

        return (
                <div className='min-h-screen bg-ali-bg py-10 text-ali-ink sm:py-16' dir='rtl'>
                        <div className='mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8'>
                                <header className='space-y-2 text-center md:text-right'>
                                        <h1 className='text-[clamp(2rem,4vw,2.6rem)] font-bold text-ali-ink'>{t("cart.title")}</h1>
                                        {leadText && <p className='text-sm text-ali-muted'>{leadText}</p>}
                                </header>

                                <section className='mt-8 space-y-5'>
                                        {cart.length === 0 ? (
                                                <EmptyCartUI t={t} />
                                        ) : (
                                                <div className='space-y-4'>
                                                        {cart.map((item) => (
                                                                <CartItem key={item._id} item={item} />
                                                        ))}
                                                </div>
                                        )}
                                </section>

                                {cart.length > 0 && (
                                        <div className='mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)] xl:grid-cols-[1fr,0.9fr]'>
                                                <GiftCouponCard />
                                                <OrderSummary />
                                        </div>
                                )}
                        </div>
                </div>
        );
};
export default CartPage;

const EmptyCartUI = ({ t }) => (
        <motion.div
                className='flex flex-col items-center justify-center space-y-4 rounded-3xl bg-white px-8 py-16 text-center shadow-sm ring-1 ring-ali-card'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
        >
                <ShoppingCart className='h-20 w-20 text-ali-red' />
                <h3 className='text-[clamp(1.5rem,3vw,1.9rem)] font-semibold text-ali-ink'>{t("cart.empty.title")}</h3>
                <p className='max-w-md text-sm text-ali-muted'>{t("cart.empty.description")}</p>
                <Link
                        className='mt-4 inline-flex min-h-[3rem] min-w-[12rem] items-center justify-center rounded-full bg-gradient-to-r from-ali-red to-ali-rose px-6 text-sm font-semibold text-white shadow transition duration-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ali-rose focus-visible:ring-offset-2 focus-visible:ring-offset-white'
                        to='/'
                >
                        {t("cart.empty.cta")}
                </Link>
        </motion.div>
);

EmptyCartUI.propTypes = {
        t: PropTypes.func.isRequired,
};
