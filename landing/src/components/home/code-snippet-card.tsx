import type {ReactNode} from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type CodeSnippetCardProps = {
  title: ReactNode;
  description: ReactNode;
  html: string;
};

function CodeSnippetCard({
  title,
  description,
  html,
}: CodeSnippetCardProps) {
  return (
    <Card className="min-w-0 border-border/60 bg-card/70 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-base">
          {title}
        </CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="code-block min-w-0 pt-0">
        <div
          className="max-w-full overflow-x-auto"
          dangerouslySetInnerHTML={{
            __html: html,
          }}
        />
      </CardContent>
    </Card>
  );
}

export {CodeSnippetCard};
