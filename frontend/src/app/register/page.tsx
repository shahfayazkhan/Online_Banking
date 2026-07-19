'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { Wallet } from 'lucide-react';
import { registerUser, clearError } from '../../store/slices/authSlice';
import { RootState, AppDispatch } from '../../store';
import styles from '../../styles/auth.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { status, error, token } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (token) {
      router.push('/dashboard');
    }
  }, [token, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) return;
    dispatch(registerUser(formData));
  };

  return (
    <div className={styles.authScreen}>
      <div className={styles.authCard} style={{ maxWidth: '500px' }}>
        <div className={styles.logoArea}>
          <Wallet className={styles.logoIcon} size={32} />
          <span className={styles.logoText}>QUANTUM VAULT</span>
        </div>

        <h1 className={styles.title}>Register Account</h1>
        <p className={styles.subtitle}>Get started with premium digital banking today</p>

        {error && (
          <div className={`${styles.alert} ${styles.alertError}`}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="firstName">First Name</label>
              <input 
                id="firstName"
                type="text"
                placeholder="John"
                value={formData.firstName}
                onChange={handleChange}
                className="glass-input"
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="lastName">Last Name</label>
              <input 
                id="lastName"
                type="text"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleChange}
                className="glass-input"
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="email">Email Address</label>
            <input 
              id="email"
              type="email"
              placeholder="john.doe@example.com"
              value={formData.email}
              onChange={handleChange}
              className="glass-input"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="password">Password (min 6 chars)</label>
            <input 
              id="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="glass-input"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="phone">Phone Number (Optional)</label>
            <input 
              id="phone"
              type="text"
              placeholder="+1 (555) 019-2834"
              value={formData.phone}
              onChange={handleChange}
              className="glass-input"
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="address">Residential Address (Optional)</label>
            <input 
              id="address"
              type="text"
              placeholder="123 Financial Way, NY"
              value={formData.address}
              onChange={handleChange}
              className="glass-input"
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary"
            disabled={status === 'loading'}
            style={{ width: '100%', marginTop: '1rem' }}
          >
            {status === 'loading' ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p className={styles.footerText}>
          Already have an account? 
          <Link href="/login" className={styles.footerLink}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
