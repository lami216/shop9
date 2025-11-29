import { ShoppingCart, UserPlus, LogIn, LogOut, Lock, Menu, Globe } from "lucide-react";
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
                        className='relative group flex items-center gap-2 rounded-full bg-gradient-to-r from-ali-red to-ali-rose px-4 py-2 text-sm font-semibold text-white shadow-lg transition duration-300 ease-in-out hover:shadow-xl'
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
                                className={`mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-2 sm:px-6 sm:py-3 ${
                                        isArabic ? "justify-end" : "justify-between"
                                }`}
                        >
                                <Link
                                        to='/'
                                        className={`flex items-center gap-2 text-ali-ink ${isArabic ? "order-1" : "order-1"}`}
                                >
                                        <img
                                                src='/logo.png'
                                                alt='شعار علي ستور'
                                                className='h-9 w-9 rounded-full object-cover shadow'
                                        />
                                        <span className='text-lg font-bold leading-none sm:text-xl'>
                                                {t("common.appName")}
                                        </span>
                                </Link>

                                <button
                                        type='button'
                                        className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-ali-card bg-white text-ali-ink shadow-sm transition hover:shadow ${
                                                isArabic ? "order-2" : "order-4"
                                        }`}
                                        aria-label='فتح القائمة'
                                >
                                        <Menu size={20} />
                                </button>

                                {cartLink && (
                                        <div className={isArabic ? "order-3" : "order-5"}>{cartLink}</div>
                                )}

                                <div
                                        className={`flex items-center gap-2 rounded-full border border-ali-card bg-white px-3 py-1.5 text-ali-muted shadow-sm ${
                                                isArabic ? "order-4" : "order-2"
                                        }`}
                                >
                                        <Globe size={16} />
                                        <select
                                                aria-label='language'
                                                className='bg-transparent text-sm font-semibold outline-none'
                                                defaultValue={i18n.language}
                                                onChange={(event) => i18n.changeLanguage(event.target.value)}
                                        >
                                                <option value='ar'>العربية</option>
                                                <option value='en'>English</option>
                                        </select>
                                </div>

                                <div className={`flex items-center gap-3 ${isArabic ? "order-5" : "order-6"}`}>
                                        {user ? (
                                                <button
                                                        className='flex items-center gap-2 rounded-full bg-ali-card px-4 py-2 text-ali-ink shadow-sm transition duration-300 ease-in-out hover:shadow'
                                                        onClick={logout}
                                                >
                                                        <LogOut size={18} />
                                                        <span className='hidden sm:inline'>{t("nav.logout")}</span>
                                                </button>
                                        ) : (
                                                <>
                                                        <Link
                                                                to={'/signup'}
                                                                className='flex items-center gap-2 rounded-full bg-white px-4 py-2 font-semibold text-ali-ink shadow-sm ring-1 ring-ali-card transition duration-300 ease-in-out hover:shadow'
                                                        >
                                                                <UserPlus size={18} />
                                                                {t("nav.signup")}
                                                        </Link>
                                                        <Link
                                                                to={'/login'}
                                                                className='flex items-center gap-2 rounded-full bg-gradient-to-r from-ali-red to-ali-rose px-4 py-2 text-white shadow-lg transition duration-300 ease-in-out hover:shadow-xl'
                                                        >
                                                                <LogIn size={18} />
                                                                {t("nav.login")}
                                                        </Link>
                                                </>
                                        )}
                                </div>

                                <nav
                                        className={`flex items-center gap-3 text-sm font-medium text-ali-muted ${
                                                isArabic ? "order-6 w-full justify-start sm:order-3 sm:w-auto" : "order-3"
                                        }`}
                                >
                                        <Link
                                                to={'/'}
                                                className='rounded-full px-3 py-2 transition duration-300 ease-in-out hover:bg-ali-card hover:text-ali-ink'
                                        >
                                                {t("nav.home")}
                                        </Link>
                                        {isAdmin && (
                                                <Link
                                                        className='flex items-center gap-2 rounded-full bg-ali-card px-3 py-2 text-ali-ink transition duration-300 ease-in-out hover:bg-ali-rose/20'
                                                        to={'/secret-dashboard'}
                                                >
                                                        <Lock className='inline-block' size={18} />
                                                        <span className='hidden sm:inline'>{t("nav.dashboard")}</span>
                                                </Link>
                                        )}
                                </nav>
                        </div>
                </header>
        );
};
export default Navbar;
