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
  mobileLayout?: 'row' | 'grid';
};

function SegmentedToggle<T extends string>({
  value,
  onValueChange,
  options,
  className,
  mobileLayout = 'row',
}: SegmentedToggleProps<T>) {
  const handleValueChange = (nextValue: string) => {
    if (nextValue) {
      onValueChange(nextValue as T);
    }
  };

  const renderOptions = (itemClassName: string) =>
    options.map(option => (
      <ToggleGroupItem
        key={option.value}
        value={option.value}
        className={itemClassName}
      >
        {option.label}
      </ToggleGroupItem>
    ));

  if (mobileLayout === 'grid') {
    return (
      <>
        <ToggleGroup
          type="single"
          value={value}
          onValueChange={handleValueChange}
          variant="outline"
          size="sm"
          spacing={2}
          className={cn(
            'grid w-full grid-cols-3 gap-2 rounded-none bg-transparent shadow-none sm:hidden',
            className,
          )}
        >
          {renderOptions(
            'h-auto w-full min-w-0 shrink whitespace-normal bg-card/70 px-3 py-2 text-center text-[0.7rem] leading-tight font-medium backdrop-blur',
          )}
        </ToggleGroup>
        <ToggleGroup
          type="single"
          value={value}
          onValueChange={handleValueChange}
          variant="outline"
          size="sm"
          className={cn(
            'hidden bg-card/70 backdrop-blur sm:flex',
            className,
          )}
        >
          {renderOptions('text-[0.7rem] font-medium')}
        </ToggleGroup>
      </>
    );
  }

  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={handleValueChange}
      variant="outline"
      size="sm"
      className={cn(
        'bg-card/70 backdrop-blur',
        className,
      )}
    >
      {renderOptions('text-[0.7rem] font-medium')}
    </ToggleGroup>
  );
}

export {SegmentedToggle};
