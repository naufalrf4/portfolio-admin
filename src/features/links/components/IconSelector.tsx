import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ICON_OPTIONS } from '../constants/links.constants';
import { getIconData } from '../utils/links.utils';

interface IconSelectorProps {
  value: string;
  onChange: (value: string) => void;
  labelText?: string;
  urlValue?: string;
}

export function IconSelector({ value, onChange, labelText, urlValue }: IconSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="icon">Platform Icon</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select a platform icon" />
        </SelectTrigger>
        <SelectContent>
          {ICON_OPTIONS.map((option) => {
            const Icon = option.icon;
            return (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center border border-line-strong text-white"
                    style={{ backgroundColor: option.color }}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span>{option.label}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      <p className="text-xs text-[var(--text-secondary)]">
        Choose a platform icon or leave empty for custom links
      </p>

      {value && (
        <div
          className="flex items-center gap-4 p-4 rounded-2xl"
          style={{
            boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center border border-line-strong text-white"
            style={{ backgroundColor: getIconData(value).color }}
          >
            {(() => {
              const { icon: Icon } = getIconData(value);
              return <Icon className="h-6 w-6" />;
            })()}
          </div>
          <div>
            <p className="font-medium text-[var(--text-primary)]">{labelText || 'Link Label'}</p>
            <p className="text-sm text-[var(--text-secondary)] truncate max-w-[200px]">
              {urlValue || 'https://...'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
