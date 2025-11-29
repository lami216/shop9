import PropTypes from "prop-types";
import { Link } from "react-router-dom";

const SectionCard = ({ section }) => {
        return (
                <Link
                        to={`/sections/${section.slug}`}
                        className='group relative overflow-hidden rounded-2xl bg-ali-card shadow-sm transition hover:-translate-y-1 hover:shadow-md'
                >
                        <div className='relative aspect-[4/3] w-full overflow-hidden'>
                                <img
                                        src={section.imageUrl}
                                        alt={section.name}
                                        className='h-full w-full object-cover transition duration-500 group-hover:scale-105'
                                        loading='lazy'
                                />
                                {section.description && (
                                        <div className='absolute left-0 right-0 top-2 mx-2 rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold text-ali-muted shadow-sm backdrop-blur'>
                                                {section.description}
                                        </div>
                                )}
                        </div>
                        <div className='absolute inset-x-3 bottom-3 rounded-xl bg-gradient-to-r from-ali-red to-ali-rose px-4 py-2 text-center text-sm font-bold text-white shadow-lg shadow-ali-rose/40'>
                                {section.name}
                        </div>
                </Link>
        );
};

SectionCard.propTypes = {
        section: PropTypes.shape({
                _id: PropTypes.string,
                slug: PropTypes.string.isRequired,
                name: PropTypes.string.isRequired,
                imageUrl: PropTypes.string,
                description: PropTypes.string,
        }).isRequired,
};

export default SectionCard;
