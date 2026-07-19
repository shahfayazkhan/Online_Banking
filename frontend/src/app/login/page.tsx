'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { Wallet } from 'lucide-react';
import { loginUser, clearError } from '../../store/slices/authSlice';
import { RootState, AppDispatch } from '../../store';
import styles from '../../styles/auth.module.css';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { status, error, token } = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    // Clear auth errors when mounting login page
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    // Redirect if already logged in
    if (token) {
      router.push('/dashboard');
    }
  }, [token, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    dispatch(loginUser({ email, password }));
  };

  return (
    <div className={styles.authScreen}>
      <div className={styles.authCard}>
        <div className={styles.logoArea}>
          <Wallet className={styles.logoIcon} size={32} />
          <span className={styles.logoText}>QUANTUM VAULT</span>
        </div>

        <h1 className={styles.title}>Secure Login</h1>
        <p className={styles.subtitle}>Enter credentials to access your account</p>

        {error && (
          <div className={`${styles.alert} ${styles.alertError}`}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="email">Email Address</label>
            <input 
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="glass-input"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="password">Password</label>
            <input 
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="glass-input"
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary styles.submitBtn"
            disabled={status === 'loading'}
            style={{ width: '100%', marginTop: '1rem' }}
          >
            {status === 'loading' ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p className={styles.footerText}>
          Don&apos;t have an account? 
          <Link href="/register" className={styles.footerLink}>
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}
