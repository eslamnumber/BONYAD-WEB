import { type ComponentProps } from 'react';

export default function Link({ href, children, ...rest }: ComponentProps<'a'>) {
  return <a href={typeof href === 'string' ? href : String(href)} {...rest}>{children}</a>;
}
