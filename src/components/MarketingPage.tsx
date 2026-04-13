import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home as HomeIcon } from 'lucide-react';

interface Crumb {
  to?: string;
  label: string;
}

interface Props {
  eyebrow?: string;
  icon?: React.ElementType;
  title: string;
  titleHighlight?: string;
  subtitle?: string;
  breadcrumbs?: Crumb[];
  children: ReactNode;
}

export default function MarketingPage({
  eyebrow,
  icon: Icon,
  title,
  titleHighlight,
  subtitle,
  breadcrumbs = [],
  children,
}: Props) {
  return (
    <div className="flex-1">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 ocean-gradient-light" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-14 lg:pt-14 lg:pb-20">
          <nav className="flex items-center gap-1.5 text-sm text-abyss-500 mb-6 flex-wrap" aria-label="Breadcrumb">
            <Link to="/" className="flex items-center gap-1 hover:text-ocean-700 transition-colors">
              <HomeIcon className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            {breadcrumbs.map((c) => (
              <span key={c.label} className="flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-abyss-300" />
                {c.to ? (
                  <Link to={c.to} className="hover:text-ocean-700 transition-colors">
                    {c.label}
                  </Link>
                ) : (
                  <span className="text-abyss-700 font-medium">{c.label}</span>
                )}
              </span>
            ))}
          </nav>

          <div className="max-w-3xl">
            {eyebrow && (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-ocean-100 text-ocean-700 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border border-ocean-200">
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {eyebrow}
              </div>
            )}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-abyss-900 tracking-tight leading-[1.15] mb-4">
              {title}
              {titleHighlight && (
                <>
                  {' '}
                  <span className="gradient-text">{titleHighlight}</span>
                </>
              )}
            </h1>
            {subtitle && (
              <p className="text-lg text-abyss-600 leading-relaxed max-w-2xl">{subtitle}</p>
            )}
          </div>
        </div>
      </section>

      <section className="bg-white py-12 lg:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
      </section>
    </div>
  );
}

export function InfoCard({
  icon: Icon,
  title,
  children,
  accent,
}: {
  icon?: React.ElementType;
  title: string;
  children: ReactNode;
  accent?: 'ocean' | 'amber' | 'emerald' | 'coral';
}) {
  const accentStyles = {
    ocean:   { iconBg: 'bg-ocean-100',  iconText: 'text-ocean-600',   border: 'border-ocean-100' },
    amber:   { iconBg: 'bg-amber-100',  iconText: 'text-amber-600',   border: 'border-amber-100' },
    emerald: { iconBg: 'bg-emerald-100',iconText: 'text-emerald-600', border: 'border-emerald-100' },
    coral:   { iconBg: 'bg-coral-100',  iconText: 'text-coral-600',   border: 'border-coral-100' },
  }[accent ?? 'ocean'];

  return (
    <div className={`bg-white rounded-2xl border ${accentStyles.border} p-6 hover:shadow-lg transition-shadow`}>
      <div className="flex items-start gap-4">
        {Icon && (
          <div className={`w-11 h-11 ${accentStyles.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-5 h-5 ${accentStyles.iconText}`} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-abyss-900 mb-2">{title}</h3>
          <div className="text-abyss-600 text-sm leading-relaxed space-y-2">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-8">
      {eyebrow && (
        <p className="text-xs font-bold text-ocean-600 uppercase tracking-widest mb-2">{eyebrow}</p>
      )}
      <h2 className="text-2xl sm:text-3xl font-bold text-abyss-900 mb-2">{title}</h2>
      {subtitle && <p className="text-abyss-500">{subtitle}</p>}
    </div>
  );
}
