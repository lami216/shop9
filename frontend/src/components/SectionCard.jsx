import PropTypes from "prop-types";
import { Link } from "react-router-dom";

const SectionCard = ({ section }) => {
        return (
                <Link
                        to={`/sections/${section.slug}`}
                        className='group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-ali-card/70 transition hover:-translate-y-1 hover:shadow-md'
                >
                        <div className='relative aspect-square w-full overflow-hidden'>
                                <img
                                        src={section.imageUrl}
                                        alt={section.name}
                                        className='h-full w-full object-cover transition duration-500 group-hover:scale-105'
                                        loading='lazy'
                                />
                                {section.description && (
                                        <div className='absolute left-2 right-2 top-2 rounded-full bg-white/85 px-3 py-1 text-[11px] font-semibold text-ali-muted shadow-sm backdrop-blur'>
                                                {section.description}
                                        </div>
                                )}
                        </div>
                        <div className='w-full bg-gradient-to-r from-ali-red to-ali-rose px-4 py-2 text-center text-sm font-bold text-white shadow-lg shadow-ali-rose/40'>
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
