import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import useTranslation from "../hooks/useTranslation";

const CategoryItem = ({ category }) => {
        const { t } = useTranslation();
        return (
                <Link
                        to={`/category/${category.slug}`}
                        className='group block overflow-hidden rounded-2xl bg-ali-card shadow-sm transition hover:-translate-y-1 hover:shadow-md'
                >
                        <div className='relative aspect-square w-full overflow-hidden bg-white'>
                                <img
                                        src={category.imageUrl}
                                        alt={category.name}
                                        className='h-full w-full object-cover transition duration-500 group-hover:scale-105'
                                        loading='lazy'
                                />
                                <div className='absolute inset-x-2 top-2 rounded-full bg-ali-card/80 px-3 py-1 text-xs font-semibold text-ali-muted shadow-sm backdrop-blur'>
                                        {t("categories.explore", { category: category.name })}
                                </div>
                        </div>
                        <div className='bg-gradient-to-r from-ali-red to-ali-rose px-4 py-2 text-center text-sm font-bold text-white'>
                                {category.name}
                        </div>
                </Link>
        );
};

export default CategoryItem;

CategoryItem.propTypes = {
        category: PropTypes.shape({
                _id: PropTypes.string,
                slug: PropTypes.string.isRequired,
                name: PropTypes.string.isRequired,
                imageUrl: PropTypes.string,
        }).isRequired,
};
