"use client";

import { useState } from "react";
import Image from "next/image";
import { ZoomIn, X } from "lucide-react";

interface ImageGalleryProps {
    images: string[];
    productName: string;
}

const ImageGallery = ({ images = [], productName }: ImageGalleryProps) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);

    // Guard against empty image array
    if (!images || images.length === 0) {
        return (
            <div className="w-full aspect-square rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center text-white/40 text-sm">
                No images available
            </div>
        );
    }

    const currentImage = images[currentImageIndex] || "/placeholder.svg";

    return (
        <>
            <div className="flex flex-col-reverse md:flex-row gap-4 w-full">
                {/* Thumbnails Sidebar */}
                <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-none">
                    {images.map((src, index) => (
                        <button
                            key={index}
                            type="button"
                            className={`relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 overflow-hidden rounded-xl border transition-all duration-300 cursor-pointer focus:outline-none ${
                                currentImageIndex === index
                                    ? "border-[#ef863f] ring-2 ring-[#ef863f]/30"
                                    : "border-white/10 hover:border-white/30 bg-white/5"
                            }`}
                            onClick={() => setCurrentImageIndex(index)}
                        >
                            <Image
                                src={src || "/placeholder.svg"}
                                alt={`${productName} - Thumbnail ${index + 1}`}
                                fill
                                sizes="(max-width: 768px) 64px, 80px"
                                className="object-cover w-full h-full"
                            />
                        </button>
                    ))}
                </div>

                {/* Main Image Stage */}
                <div className="relative flex-1 aspect-square rounded-2xl overflow-hidden border border-white/10 bg-[#010915]/50 group">
                    <Image
                        src={currentImage}
                        alt={`${productName} - Main view`}
                        fill
                        priority
                        sizes="(max-width: 1024px) 100vw, 600px"
                        className="object-cover w-full h-full transition-all duration-500 cursor-zoom-in"
                        onClick={() => setIsZoomed(true)}
                    />

                    {/* Top-Right Zoom Utility */}
                    <button
                        type="button"
                        onClick={() => setIsZoomed(true)}
                        className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white p-2.5 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer shadow-lg"
                        aria-label="Zoom image"
                    >
                        <ZoomIn className="h-4 w-4" />
                    </button>

                    {/* Bottom Dot Indicators (Mobile pagination visualizer) */}
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center p-2 pointer-events-none md:hidden">
                        <div className="flex gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/5">
                            {images.map((_, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    className={`pointer-events-auto w-2 h-2 rounded-full transition-all duration-300 ${
                                        currentImageIndex === index
                                            ? "bg-[#ef863f] w-4"
                                            : "bg-white/30 hover:bg-white/55"
                                    }`}
                                    onClick={() => setCurrentImageIndex(index)}
                                    aria-label={`Go to slide ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modern Lightbox Overlay */}
            {isZoomed && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl transition-all duration-300"
                    onClick={() => setIsZoomed(false)}
                >
                    {/* Close Button */}
                    <button
                        type="button"
                        className="absolute top-6 right-6 text-white/70 hover:text-white p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200 cursor-pointer"
                        onClick={() => setIsZoomed(false)}
                    >
                        <X className="h-6 w-6" />
                    </button>

                    {/* Fullscreen Image Container */}
                    <div
                        className="relative w-[90vw] h-[80vh] max-w-5xl"
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image itself
                    >
                        <Image
                            src={currentImage}
                            alt={productName}
                            fill
                            className="object-contain"
                            sizes="100vw"
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default ImageGallery;
