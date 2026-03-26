import * as React from 'react';

import {cn} from '@/lib/utils';

function InlineCode({
  className,
  ...props
}: React.ComponentProps<'code'>) {
  return (
    <code
      className={cn(
        'rounded-md border border-primary/20 bg-primary/10 px-1.5 py-0.5 font-mono text-[0.75rem] text-primary/90',
        className,
      )}
      {...props}
    />
  );
}

export {InlineCode};
