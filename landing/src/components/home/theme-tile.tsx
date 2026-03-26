import type {
  ThemeOption,
  ThemeValue,
} from '@/components/home/home-config';

type ThemeTileProps = {
  option: ThemeOption;
  note: string;
  isActive: boolean;
  onSelect: (value: ThemeValue) => void;
};

function ThemeTile({
  option,
  note,
  isActive,
  onSelect,
}: ThemeTileProps) {
  return (
    <button
      type="button"
      className="theme-tile"
      data-active={isActive}
      aria-pressed={isActive}
      onClick={() => onSelect(option.value)}
    >
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">
          {option.label}
        </span>
        <span className="text-xs text-muted-foreground">
          {note}
        </span>
      </div>
      <div
        className={`theme-preview ${option.previewClass}`}
      />
      <div className="flex items-center text-xs text-muted-foreground">
        <span>{option.caption}</span>
      </div>
    </button>
  );
}

export {ThemeTile};
