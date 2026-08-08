import { useState, useEffect, useCallback } from 'react';
import type { FC, MouseEvent } from 'react';
import { X, ChevronLeft, ChevronRight, Maximize2, Image as ImageIcon } from 'lucide-react';

export interface MediaItem {
  path: string;
  filename: string;
  metadata: {
    src: string;
    width: number;
    height: number;
    format: string;
  };
}

interface AlbumSliderProps {
  images: MediaItem[];
  title: string;
}

export const AlbumSlider: FC<AlbumSliderProps> = ({ images, title }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openSlider = (e: MouseEvent) => {
    e.preventDefault();
    if (images.length === 0) return;
    setIsOpen(true);
    setCurrentIndex(0);
  };

  const closeSlider = useCallback(() => {
    setIsOpen(false);
  }, []);

  const nextSlide = useCallback((e?: MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevSlide = useCallback((e?: MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSlider();
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeSlider, nextSlide, prevSlide]);

  if (images.length === 0) {
    return (
      <div className="py-12 px-6 rounded-2xl bg-gradient-to-r from-ink-950 to-white/[0.01] border border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
        <div>
          <span className="font-display text-xl text-text font-semibold block">{title} — Photo Gallery</span>
          <span className="font-mono text-xs text-muted mt-1 block">
            Photos for this event will be available shortly.
          </span>
        </div>
        <div className="w-12 h-12 rounded-full border border-gold-500/20 flex items-center justify-center text-gold-400/60 font-mono text-lg shrink-0">
          ❖
        </div>
      </div>
    );
  }

  const coverImage = images[0];

  return (
    <>
      {/* Cover View */}
      <button 
        onClick={openSlider}
        className="w-full text-left group relative rounded-2xl overflow-hidden bg-ink-950 border border-white/[0.08] aspect-video md:aspect-[21/9] shadow-lg hover:shadow-xl transition-all duration-500 block focus:outline-none focus:ring-2 focus:ring-gold-500"
      >
        <img 
          src={coverImage.metadata?.src || (typeof coverImage.metadata === 'string' ? coverImage.metadata : '')} 
          alt={`${title} cover`} 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
          loading="lazy"
        />
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors duration-500 flex flex-col items-center justify-center backdrop-blur-[2px] opacity-0 group-hover:opacity-100">
          <div className="bg-ink-900/80 backdrop-blur-md border border-white/10 text-white rounded-full px-6 py-3 flex items-center gap-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
            <Maximize2 className="w-5 h-5 text-gold-400" />
            <span className="font-mono font-semibold tracking-wider text-sm uppercase">Open Album ({images.length} Photos)</span>
          </div>
        </div>
        
        {/* Permanent Badges */}
        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md border border-white/10 rounded-full px-3 py-1.5 flex items-center gap-2 group-hover:opacity-0 transition-opacity duration-500">
          <ImageIcon className="w-4 h-4 text-gold-400" />
          <span className="text-white text-xs font-mono font-bold">{images.length}</span>
        </div>
      </button>

      {/* Fullscreen Lightbox Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col focus:outline-none" style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0 }} role="dialog" aria-modal="true" aria-label={`Photo album for ${title}`}>
          
          {/* Main Content */}
          <div className="flex-1 flex items-center justify-center p-2 sm:p-12 w-full h-full overflow-hidden">
            
            <div className="relative inline-flex items-center justify-center max-w-full max-h-full">
              <img 
                key={currentIndex}
                src={images[currentIndex].metadata?.src || (typeof images[currentIndex].metadata === 'string' ? images[currentIndex].metadata : '')} 
                alt={`${title} photo ${currentIndex + 1}`}
                className="max-w-full object-contain rounded-lg shadow-2xl transition-opacity duration-300"
                style={{ maxHeight: '85vh' }}
              />

              {/* Close Button pinned to the top-right of the image */}
              <button 
                onClick={closeSlider}
                className="absolute top-2 right-2 sm:top-4 sm:right-4 flex items-center justify-center p-2 sm:px-4 sm:py-2 bg-black/60 hover:bg-black/90 backdrop-blur-md text-white rounded-full border border-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-gold-500 shadow-2xl z-50"
                aria-label="Close album"
              >
                <span className="hidden sm:inline font-mono text-xs font-semibold uppercase tracking-wider mr-2">Close</span>
                <X className="w-6 h-6 sm:w-5 sm:h-5 text-white" />
              </button>

              {/* Counter pinned to the bottom-left of the image */}
              <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 font-mono text-xs tracking-wider text-white bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 z-50 shadow-xl">
                <span className="text-gold-400 font-bold">{currentIndex + 1}</span> / <span className="text-white/70">{images.length}</span>
              </div>
            </div>

          </div>

          {/* Navigation Buttons (Floating center left/right for mobile ease) */}
          {images.length > 1 && (
            <>
              <button 
                onClick={prevSlide}
                className="absolute left-1 sm:left-6 top-1/2 -translate-y-1/2 p-3 sm:p-5 bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/20 rounded-full text-white transition-all focus:outline-none focus:ring-2 focus:ring-gold-500 group z-50 shadow-2xl"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8 group-hover:-translate-x-1 transition-transform" />
              </button>

              <button 
                onClick={nextSlide}
                className="absolute right-1 sm:right-6 top-1/2 -translate-y-1/2 p-3 sm:p-5 bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/20 rounded-full text-white transition-all focus:outline-none focus:ring-2 focus:ring-gold-500 group z-50 shadow-2xl"
                aria-label="Next photo"
              >
                <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 group-hover:translate-x-1 transition-transform" />
              </button>
            </>
          )}
          
          {/* Bottom Title Bar (Optional) */}
          <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
            <span className="bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full font-mono text-xs text-white/80 tracking-widest uppercase">
              {title}
            </span>
          </div>

        </div>
      )}
    </>
  );
};
