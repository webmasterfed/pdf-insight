import { ThemeSwitch } from './ThemeSwitch.tsx';

export function PageHeader() {
  return (
    <header className="page-header">
      <div className="brand">
        <svg className="brand__logo" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
          <rect width="32" height="32" rx="7" fill="currentColor" />
          <path d="M10 7h8.5L23 11.5V25H10z" fill="#ffffff" />
          <path
            d="M13 16h7M13 19h7M13 22h4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
        <h1>PDF Insight</h1>
        <ThemeSwitch />
      </div>
      <p className="page-header__lead">
        Wgraj PDF i w kilka sekund otrzymaj streszczenie oraz dane w formacie JSON.
      </p>
    </header>
  );
}
