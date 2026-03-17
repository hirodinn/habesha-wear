import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Shows a single image or a scrollable carousel when there are multiple images.
 * Uses sliding animation when changing images.
 */
const ProductImageCarousel = ({
  images = [],
  alt = "",
  className = "",
  imageClassName = "",
  placeholder = null,
  onImageClick,
}) => {
  const [index, setIndex] = useState(0);
  const list = Array.isArray(images) && images.length > 0 ? images : [];
  const single = list.length <= 1;

  const go = (e, next) => {
    e.stopPropagation();
    setIndex((i) => {
      if (next) return i + 1 >= list.length ? 0 : i + 1;
      return i - 1 < 0 ? list.length - 1 : i - 1;
    });
  };

  if (list.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-[var(--bg-main)] ${className}`}>
        {placeholder}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div
        className="flex h-full transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {list.map((src, i) => (
          <div key={i} className="flex-shrink-0 w-full h-full">
            <img
              src={src}
              alt={`${alt} ${i + 1}`}
              className={imageClassName}
              loading="lazy"
              onClick={onImageClick}
            />
          </div>
        ))}
      </div>
      {!single && list.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => go(e, false)}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-opacity z-10"
            aria-label="Previous image"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={(e) => go(e, true)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-opacity z-10"
            aria-label="Next image"
          >
            <ChevronRight size={18} />
          </button>
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10">
            {list.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIndex(i);
                }}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === index ? "bg-white" : "bg-white/50 hover:bg-white/70"
                }`}
                aria-label={`Image ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ProductImageCarousel;
