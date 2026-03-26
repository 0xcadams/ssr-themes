import {ShieldCheck} from 'lucide-react';

import {
  themeOptions,
  type ThemeValue,
} from '@/components/home/home-config';
import {ThemeTile} from '@/components/home/theme-tile';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type ThemePickerCardProps = {
  activeTheme: ThemeValue;
  systemNote: string;
  onSelect: (value: ThemeValue) => void;
};

function ThemePickerCard({
  activeTheme,
  systemNote,
  onSelect,
}: ThemePickerCardProps) {
  return (
    <Card className="min-w-0 border-border/60 bg-card/70 backdrop-blur">
      <CardHeader className="border-b border-border/60">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base">
              Theme picker
            </CardTitle>
            <CardDescription>
              Pick a palette and the UI updates
              instantly.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-5">
        <div className="grid gap-3 sm:grid-cols-2">
          {themeOptions.map(option => (
            <ThemeTile
              key={option.value}
              option={option}
              note={
                option.value === 'system'
                  ? systemNote
                  : option.note
              }
              isActive={activeTheme === option.value}
              onSelect={onSelect}
            />
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          Hydration-safe changes that sync across tabs.
        </div>
      </CardContent>
    </Card>
  );
}

export {ThemePickerCard};
