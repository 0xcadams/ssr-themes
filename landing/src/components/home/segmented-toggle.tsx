import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/ui/toggle-group';
import {cn} from '@/lib/utils';

type SegmentedToggleOption<T extends string> = {
  value: T;
  label: string;
};

type SegmentedToggleProps<T extends string> = {
  value: T;
  onValueChange: (value: T) => void;
  options: readonly SegmentedToggleOption<T>[];
  className?: string;
};

function SegmentedToggle<T extends string>({
  value,
  onValueChange,
  options,
  className,
}: SegmentedToggleProps<T>) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(nextValue: string) => {
        if (nextValue) {
          onValueChange(nextValue as T);
        }
      }}
      variant="outline"
      size="sm"
      className={cn(
        'bg-card/70 backdrop-blur',
        className,
      )}
    >
      {options.map(option => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          className="text-[0.7rem] font-medium"
        >
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

export {SegmentedToggle};
