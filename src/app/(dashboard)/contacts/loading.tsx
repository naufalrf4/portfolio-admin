import { Send } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageWrapper } from '@/components/layout/PageWrapper';

export default function ContactsLoading() {
  return (
    <PageWrapper>
      <PageHeader
        title="Contact Management"
        description="Manage contact form submissions and settings"
        icon={<Send />}
      />

      <div className="mt-6 space-y-6">
        {}
        <div className="flex gap-2 flex-wrap">
          {['Submissions', 'Settings'].map((tab) => (
            <div
              key={tab}
              className="h-10 px-4 rounded-2xl animate-pulse"
              style={{
                background: 'var(--bg-elevated)',
                boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
              }}
            >
              <div className="h-full flex items-center">
                <div
                  className="h-4 w-20 rounded"
                  style={{
                    background: 'var(--text-secondary)',
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {}
        <div
          className="rounded-[var(--radius-container)] p-6 animate-pulse"
          style={{
            background: 'var(--bg-elevated)',
            boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div className="space-y-4">
            {}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-4 border-b border-line">
              {['Name', 'Email', 'Subject', 'Date'].map((col) => (
                <div
                  key={col}
                  className="h-4 rounded"
                  style={{
                    background: 'var(--text-secondary)',
                  }}
                />
              ))}
            </div>

            {}
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4">
                {[1, 2, 3, 4].map((j) => (
                  <div
                    key={j}
                    className="h-4 rounded"
                    style={{
                      background: 'var(--border)',
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {}
        <div className="flex justify-between items-center">
          <div
            className="h-4 w-32 rounded"
            style={{
              background: 'var(--text-secondary)',
            }}
          />
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-10 w-10 rounded-2xl"
                style={{
                  background: 'var(--bg-elevated)',
                  boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
