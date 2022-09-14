/* eslint-disable @next/next/no-img-element */

interface ImageProps {
    src: string;
    alt: string;
    className?: string;
}

const Image = ({ src, alt, ...props }: ImageProps) => {
    return <img src={src} alt={alt} {...props} />;
};

export { Image };
