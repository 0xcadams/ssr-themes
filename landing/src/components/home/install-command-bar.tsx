import {useEffect, useState} from 'react';
import {Check, Copy} from 'lucide-react';

import {Button} from '@/components/ui/button';

type InstallCommandBarProps = {
  command: string;
};

function InstallCommandBar({
  command,
}: InstallCommandBarProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setCopied(false);
    }, 1500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex">
      <div className="flex items-center gap-2 rounded-md border border-border/70 bg-card/70 px-3 py-2 shadow-xs">
        <code className="font-mono text-[0.75rem] text-foreground/80">
          {command}
        </code>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={handleCopy}
          aria-label="Copy install command"
          title={copied ? 'Copied' : 'Copy'}
        >
          {copied ? (
            <Check className="size-3.5" />
          ) : (
            <Copy className="size-3.5" />
          )}
        </Button>
      </div>
    </div>
  );
}

export {InstallCommandBar};
