import { Activity, Menu, Moon, Sun, WifiOff, X } from 'lucide-react';
import { useState } from 'react';

interface NavbarProps {
  account: string | null;
  status: string;
  canTransact: boolean;
  hasWallet: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

function short(value: string) {
  if (!value || value.length < 12) return value;
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

export default function Navbar({
  account, status, canTransact, onConnect, onDisconnect, theme, onToggleTheme,
}: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const ledColor = canTransact ? '#22c55e' : account ? '#f59e0b' : '#ef4444';
  const ledLabel = canTransact ? 'LIVE' : account ? 'SETUP' : 'OFFLINE';
  const ledGlow = canTransact
    ? '0 0 6px 2px rgba(34,197,94,0.7)'
    : account
      ? '0 0 6px 2px rgba(245,158,11,0.7)'
      : '0 0 6px 2px rgba(239,68,68,0.7)';

  const navLinks = [
    { label: 'Dashboard', href: '#dashboard' },
    { label: 'Mint NFT', href: '#mint' },
    { label: 'Lifecycle', href: '#lifecycle' },
    { label: 'Docs', href: 'https://docs.iota.org/', target: '_blank' },
  ];

  return (
    <>
      <nav className="iota-navbar">
        {/* ── Logo ── */}
        <div className="navbar-logo">
          <div className="navbar-logo-icon">
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="15" cy="15" r="14" stroke="#ff4757" strokeWidth="1.5" />
              <circle cx="15" cy="15" r="4.5" fill="#ff4757" />
              <line x1="15" y1="1" x2="15" y2="8" stroke="#ff4757" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="15" y1="22" x2="15" y2="29" stroke="#ff4757" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="1" y1="15" x2="8" y2="15" stroke="#ff4757" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="22" y1="15" x2="29" y2="15" stroke="#ff4757" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="5" y1="5" x2="9.5" y2="9.5" stroke="#ff4757" strokeWidth="1" strokeLinecap="round" opacity="0.45" />
              <line x1="20.5" y1="20.5" x2="25" y2="25" stroke="#ff4757" strokeWidth="1" strokeLinecap="round" opacity="0.45" />
              <line x1="25" y1="5" x2="20.5" y2="9.5" stroke="#ff4757" strokeWidth="1" strokeLinecap="round" opacity="0.45" />
              <line x1="9.5" y1="20.5" x2="5" y2="25" stroke="#ff4757" strokeWidth="1" strokeLinecap="round" opacity="0.45" />
            </svg>
          </div>
          <div className="navbar-logo-text">
            <span className="navbar-logo-title">IOTA DApp</span>
            <span className="navbar-logo-sub">NFT LIFECYCLE</span>
          </div>
        </div>

        {/* ── Desktop nav links ── */}
        <div className="navbar-links">
          {navLinks.map(({ label, href, target }) => (
            <a
              key={label}
              href={href}
              target={target}
              rel={target ? 'noopener noreferrer' : undefined}
              className="navbar-link"
            >
              {label}
            </a>
          ))}
        </div>

        {/* ── Right controls ── */}
        <div className="navbar-controls">
          {/* LED */}
          <div className="navbar-led-group">
            <div
              className="navbar-led"
              style={{ background: ledColor, boxShadow: ledGlow }}
            />
            <span className="navbar-led-label">{ledLabel}</span>
          </div>

          {/* Wallet button */}
          <button
            className={`navbar-wallet-btn ${account ? 'connected' : 'disconnected'}`}
            onClick={account ? onDisconnect : onConnect}
            title={status}
          >
            {account ? (
              <>
                <Activity size={12} strokeWidth={2} />
                {short(account)}
              </>
            ) : (
              <>
                <WifiOff size={12} strokeWidth={2} />
                Connect
              </>
            )}
          </button>

          {/* Theme toggle */}
          <button
            className="navbar-theme-btn"
            onClick={onToggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Hamburger */}
          <button
            className="navbar-hamburger"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* ── Mobile dropdown ── */}
      <div className={`navbar-mobile-menu ${menuOpen ? 'open' : ''}`}>
        {navLinks.map(({ label, href, target }) => (
          <a
            key={label}
            href={href}
            target={target}
            rel={target ? 'noopener noreferrer' : undefined}
            className="navbar-mobile-link"
            onClick={() => setMenuOpen(false)}
          >
            {label}
          </a>
        ))}
        <div className="navbar-mobile-status">
          <div
            className="navbar-led"
            style={{ background: ledColor, boxShadow: ledGlow }}
          />
          <span className="navbar-led-label">{status}</span>
        </div>
      </div>
    </>
  );
}
