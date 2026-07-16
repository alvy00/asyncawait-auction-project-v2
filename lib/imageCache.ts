const loadedImages = new Set<string>();

export function preloadImage(src: string): Promise<void> {
    if (loadedImages.has(src)) return Promise.resolve();
    return new Promise((resolve, reject) => {
        const img = new window.Image();
        img.onload = () => {
            loadedImages.add(src);
            resolve();
        };
        img.onerror = reject;
        img.src = src;
    });
}

export function isImageLoaded(src: string) {
    return loadedImages.has(src);
}
