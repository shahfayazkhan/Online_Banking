'use client';

import React from 'react';
import Link from 'next/link';
import { Wallet, ShieldCheck, ArrowRight, Activity, Zap, Cpu } from 'lucide-react';
import styles from '../styles/auth.module.css';

export default function LandingPage() {
  return (
    <div className={styles.authScreen} style={{ flexDirection: 'column', gap: '3rem', padding: '3rem 2rem' }}>
      
      {/* Navbar Area */}
      <header style={{
        width: '100%', maxWidth: '1200px', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', position: 'absolute', top: '2rem', padding: '0 2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Wallet className={styles.logoIcon} size={28} />
          <span className={styles.logoText} style={{ fontSize: '1.25rem' }}>QUANTUM VAULT</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/login" className="btn-secondary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
            Sign In
          </Link>
          <Link href="/register" className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
            Register
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
        maxWidth: '800px', marginTop: '6rem', gap: '1.5rem', zIndex: 2
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem', 
          background: 'rgba(0, 240, 255, 0.08)', border: '1px solid rgba(0, 240, 255, 0.15)',
          padding: '0.4rem 1rem', borderRadius: '30px', color: 'var(--accent-primary)',
          fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em'
        }}>
          <Cpu size={14} className="pulse-glow" />
          Quantum Banking Core Active
        </div>

        <h1 style={{
          fontSize: '3.2rem', fontWeight: 800, lineHeight: 1.15,
          fontFamily: 'var(--font-display)', letterSpacing: '-0.03em',
          background: 'linear-gradient(135deg, #ffffff 0%, var(--text-secondary) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Secure, Autonomous <br />
          <span style={{
            background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Digital Wealth Control
          </span>
        </h1>

        <p style={{
          color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', 
          lineHeight: '1.6', fontFamily: 'var(--font-sans)', fontWeight: 400
        }}>
          Quantum Vault bridges advanced Mongoose ledger databases with Redux-cached client interfaces, producing instantaneous ledger transfers, card switches, and compliance statistics.
        </p>

        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem' }}>
          <Link href="/register" className="btn-primary" style={{ padding: '0.85rem 2rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            Open Free Account
            <ArrowRight size={18} />
          </Link>
          <Link href="/login" className="btn-secondary" style={{ padding: '0.85rem 2rem' }}>
            Access Vault
          </Link>
        </div>
      </main>

      {/* Features Grid */}
      <section style={{
        width: '100%', maxWidth: '1200px', display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', zIndex: 2, marginTop: '2rem'
      }}>
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{
            width: '45px', height: '45px', borderRadius: '12px', background: 'rgba(0, 240, 255, 0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)'
          }}>
            <Zap size={22} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Real-time Transfers</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Deduct from source checking/savings and inject into destination targets in real-time, outputting dual ledger items.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{
            width: '45px', height: '45px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-secondary)'
          }}>
            <ShieldCheck size={22} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Smart Cards Control</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Configure daily spends limits, lock cards immediately, and modify PIN numbers with instant database reflections.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{
            width: '45px', height: '45px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)'
          }}>
            <Activity size={22} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Intelligent Charts</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Gather cashflow ratios and category spending indices, plotted cleanly via interactive vector Area Charts.
          </p>
        </div>
      </section>

      {/* Footer Area */}
      <footer style={{
        fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center',
        borderTop: '1px solid var(--border-color)', width: '100%', maxWidth: '1200px',
        padding: '2rem 0 1rem 0', marginTop: '3rem'
      }}>
        © 2026 Quantum Vault Inc. All Rights Reserved. Built with Next.js, Redux Toolkit, and NestJS Core.
      </footer>

    </div>
  );
}
