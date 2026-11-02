import { SURFACE_SHADOWS, COLORS, FILTER_TABS } from '../constants/messages.constants';
import type { FilterTab } from '../types/messages.types';

interface FilterTabsProps {
  activeTab: FilterTab;
  onTabChange: (tab: FilterTab) => void;
  totalCount: number;
  unreadCount: number;
}

export function FilterTabs({ activeTab, onTabChange, totalCount, unreadCount }: FilterTabsProps) {
  const getCount = (key: FilterTab) => {
    if (key === 'all') return totalCount;
    if (key === 'unread') return unreadCount;
    return undefined;
  };

  return (
    <div
      className="p-2 rounded-2xl mb-8 inline-flex flex-wrap gap-2"
      style={{
        backgroundColor: COLORS.background,
        boxShadow: SURFACE_SHADOWS.inset,
      }}
    >
      {FILTER_TABS.map((tab) => {
        const count = getCount(tab.key);
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className="relative py-3 px-4 sm:px-6 rounded-xl font-medium transition-all duration-200 text-sm sm:text-base"
            style={{
              backgroundColor: activeTab === tab.key ? COLORS.background : 'transparent',
              boxShadow: activeTab === tab.key ? SURFACE_SHADOWS.extrudedSm : 'none',
              color: activeTab === tab.key ? COLORS.accent : COLORS.muted,
            }}
          >
            <span className="flex items-center gap-2">
              {tab.label}
              {count !== undefined && (
                <span
                  className="px-2 py-0.5 rounded-full text-xs"
                  style={{
                    backgroundColor:
                      activeTab === tab.key ? `${COLORS.accent}20` : `${COLORS.muted}20`,
                    color: activeTab === tab.key ? COLORS.accent : COLORS.muted,
                  }}
                >
                  {count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
