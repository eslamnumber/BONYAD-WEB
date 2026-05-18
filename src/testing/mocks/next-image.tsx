import { type ComponentProps } from 'react';

type NextImageProps = ComponentProps<'img'> & {
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
};

export default function Image({ src, alt, fill: _fill, priority: _priority, sizes: _sizes, ...rest }: NextImageProps) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={typeof src === 'string' ? src : 'mocked'} alt={alt} {...rest} />;
}
