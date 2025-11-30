import { ShoppingCart, UserPlus, LogIn, LogOut, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import useTranslation from "../hooks/useTranslation";
import { useUserStore } from "../stores/useUserStore";
import { useCartStore } from "../stores/useCartStore";

const Navbar = () => {
        const { user, logout } = useUserStore();
        const isAdmin = user?.role === "admin";
        const { cart } = useCartStore();
        const cartItemCount = cart.reduce((total, item) => total + (item.quantity ?? 0), 0);
        const { t, i18n } = useTranslation();
        const isArabic = i18n.language === "ar";

        const cartLink = (
                <Link
                        to={'/cart'}
                        className='relative group flex items-center gap-2 rounded-full bg-gradient-to-r from-ali-red to-ali-rose px-3 py-0 text-sm font-semibold text-white shadow-lg transition duration-300 ease-in-out hover:shadow-xl sm:px-4 sm:py-1'
                >
                        <ShoppingCart size={18} />
                        <span className='hidden sm:inline'>{t("nav.cart")}</span>
                        {cartItemCount > 0 && (
                                <span className='absolute -top-2 -right-2 rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-ali-red shadow-sm transition duration-300 ease-in-out group-hover:bg-ali-card'>
                                        {cartItemCount}
                                </span>
                        )}
                </Link>
        );

        return (
                <header
                        dir={isArabic ? "rtl" : "ltr"}
                        className='fixed top-0 right-0 z-40 w-full border-b border-ali-card/80 bg-white/90 backdrop-blur-xl shadow-md transition-all duration-300'
                >
                        <div
                                className={`mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-1 sm:px-6 ${
                                        isArabic ? "flex-row-reverse" : "flex-row"
                                }`}
                        >
                                <div
                                        className={`flex flex-1 items-center gap-4 ${
                                                isArabic ? "flex-row-reverse justify-end" : "flex-row justify-start"
                                        }`}
                                >
                                        <Link to='/' className='flex items-center gap-2 text-ali-ink'>
                                                <img
                                                        src='/logo.png'
                                                        alt='شعار علي ستور'
                                                        className='h-7 w-7 rounded-full object-cover shadow sm:h-9 sm:w-9'
                                                />
                                                <span className='text-lg font-bold leading-none sm:text-xl'>
                                                        {t("common.appName")}
                                                </span>
                                        </Link>

                                        <nav className='flex items-center gap-3 text-sm font-medium text-ali-muted'>
                                                <Link
                                                        to={'/'}
                                                        className='rounded-full px-3 py-0.5 transition duration-300 ease-in-out hover:bg-ali-card hover:text-ali-ink sm:py-1.5'
                                                >
                                                        {t("nav.home")}
                                                </Link>
                                                {isAdmin && (
                                                        <Link
                                                                className='flex items-center gap-2 rounded-full bg-ali-card px-3 py-0.5 text-ali-ink transition duration-300 ease-in-out hover:bg-ali-rose/20 sm:py-2'
                                                                to={'/secret-dashboard'}
                                                        >
                                                                <Lock className='inline-block' size={18} />
                                                                <span className='hidden sm:inline'>{t("nav.dashboard")}</span>
                                                        </Link>
                                                )}
                                        </nav>
                                </div>

                                <div className={`flex items-center gap-2 sm:gap-3 ${isArabic ? "flex-row" : "flex-row"}`}>
                                        {cartLink && <div>{cartLink}</div>}

                                        <div className='flex items-center gap-2 sm:gap-3'>
                                                {user ? (
                                                        <button
                                                                className='flex items-center gap-2 rounded-full bg-ali-card px-3 py-0 text-ali-ink shadow-sm transition duration-300 ease-in-out hover:shadow sm:px-4 sm:py-1'
                                                                onClick={logout}
                                                        >
                                                                <LogOut size={18} />
                                                                <span className='hidden sm:inline'>{t("nav.logout")}</span>
                                                        </button>
                                                ) : (
                                                        <>
                                                                <Link
                                                                        to={'/signup'}
                                                                        className='flex items-center gap-2 rounded-full bg-white px-3 py-0 font-semibold text-ali-ink shadow-sm ring-1 ring-ali-card transition duration-300 ease-in-out hover:shadow sm:px-4 sm:py-1'
                                                                >
                                                                        <UserPlus size={18} />
                                                                        {t("nav.signup")}
                                                                </Link>
                                                                <Link
                                                                        to={'/login'}
                                                                        className='flex items-center gap-2 rounded-full bg-gradient-to-r from-ali-red to-ali-rose px-3 py-0 text-white shadow-lg transition duration-300 ease-in-out hover:shadow-xl sm:px-4 sm:py-1'
                                                                >
                                                                        <LogIn size={18} />
                                                                        {t("nav.login")}
                                                                </Link>
                                                        </>
                                                )}
                                        </div>
                                </div>
                        </div>
                </header>
        );
};
export default Navbar;
