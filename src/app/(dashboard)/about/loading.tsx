import { User } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageWrapper } from '@/components/layout/PageWrapper';

export default function AboutLoading() {
  return (
    <PageWrapper>
      <PageHeader
        title="About Me"
        description="Manage your personal information, bio, skills, experience, and social links"
        icon={<User />}
      />

      <div className="mt-6">
        {}
        <div className="mb-6 flex gap-2 flex-wrap">
          {['Personal Info', 'Bio', 'Skills', 'Experience'].map((tab) => (
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
          className="rounded-[var(--radius-container)] p-8 animate-pulse"
          style={{
            background: 'var(--bg-elevated)',
            boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div className="space-y-6">
            {}
            <div
              className="h-6 w-48 rounded"
              style={{
                background: 'var(--text-secondary)',
              }}
            />

            {}
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div
                  className="h-4 w-24 rounded"
                  style={{
                    background: 'var(--text-secondary)',
                  }}
                />
                <div
                  className="h-12 w-full rounded-2xl"
                  style={{
                    background: 'var(--bg-elevated)',
                    boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
                  }}
                />
              </div>
            ))}

            {}
            <div
              className="h-12 w-32 rounded-2xl"
              style={{
                background: 'var(--teal)',
                boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
              }}
            />
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
