import { ShoppingCart } from "lucide-react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import useTranslation from "../hooks/useTranslation";
import { useCartStore } from "../stores/useCartStore";
import { formatMRU } from "../lib/formatMRU";
import { getProductPricing } from "../lib/getProductPricing";

const ProductCard = ({ product }) => {
        const { addToCart } = useCartStore();
        const { t } = useTranslation();
        const { price, discountedPrice, isDiscounted, discountPercentage } = getProductPricing(product);
        const productForCart = {
                ...product,
                discountedPrice,
                isDiscounted,
                discountPercentage,
        };
        let coverImage = product.image;

        if (!coverImage && Array.isArray(product.images) && product.images.length > 0) {
                const [firstImage] = product.images;

                if (typeof firstImage === "string") {
                        coverImage = firstImage;
                } else {
                        coverImage = firstImage?.url || "";
                }
        }

        const handleAddToCart = () => {
                addToCart(productForCart);
        };

        return (
                <div className='group relative flex w-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-ali-card transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:aspect-[3/4] lg:aspect-square'>
                        <div className='relative aspect-square w-full overflow-hidden'>
                                <Link
                                        to={`/products/${product._id}`}
                                        className='block h-full w-full'
                                        aria-label={t("product.viewDetails", { name: product.name })}
                                >
                                        {isDiscounted && (
                                                <span className='absolute left-3 top-3 z-10 rounded-full bg-ali-orange px-3 py-1 text-xs font-semibold text-white shadow'>
                                                        -{discountPercentage}%
                                                </span>
                                        )}
                                        <span className='absolute right-3 top-3 z-10 rounded-full bg-ali-orange px-3 py-1 text-xs font-semibold text-white shadow'>
                                                {formatMRU(isDiscounted ? discountedPrice : price)}
                                        </span>
                                        {coverImage ? (
                                                <img
                                                        className='h-full w-full object-cover transition duration-500 group-hover:scale-105'
                                                        src={coverImage}
                                                        alt={product.name}
                                                />
                                        ) : (
                                                <div className='flex h-full w-full items-center justify-center bg-ali-card text-sm font-medium text-ali-muted'>
                                                        {t("common.status.noImage")}
                                                </div>
                                        )}
                                </Link>
                        </div>

                        <div className='flex flex-1 flex-col justify-between bg-ali-card px-4 pb-4 pt-3'>
                                <button
                                        className='flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-ali-red to-ali-rose px-4 py-2 text-sm font-bold text-white shadow transition duration-300 hover:shadow-md'
                                        onClick={handleAddToCart}
                                >
                                        <ShoppingCart size={18} />
                                        <span className='truncate'>{product.name}</span>
                                </button>
                        </div>
                </div>
        );
};
export default ProductCard;

ProductCard.propTypes = {
        product: PropTypes.shape({
                _id: PropTypes.string.isRequired,
                id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
                name: PropTypes.string.isRequired,
                image: PropTypes.string,
                images: PropTypes.arrayOf(
                        PropTypes.oneOfType([
                                PropTypes.string,
                                PropTypes.shape({
                                        url: PropTypes.string,
                                }),
                        ])
                ),
                price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
                discountedPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
                isDiscounted: PropTypes.bool,
                discountPercentage: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        }).isRequired,
};
