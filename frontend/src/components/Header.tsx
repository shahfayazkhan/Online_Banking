'use client';

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState, AppDispatch } from '../store';
import { fetchProfile } from '../store/slices/authSlice';
import styles from '../styles/dashboard.module.css';

export default function Header() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user, token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!token) {
      router.push('/login');
    } else if (!user) {
      dispatch(fetchProfile());
    }
  }, [token, user, dispatch, router]);

  if (!user) {
    return (
      <header className={styles.header}>
        <div className={styles.headerTitle}>Loading secure session...</div>
      </header>
    );
  }

  const initials = `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase();

  // Format today's date nicely for a premium look
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className={styles.header}>
      <div className={styles.headerTitle}>
        Welcome back, <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{user.firstName}</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '1rem' }}>{today}</span>
      </div>
      
      <div className={styles.userInfo}>
        <div className={styles.userMeta}>
          <div className={styles.userName}>{user.firstName} {user.lastName}</div>
          <div className={styles.userEmail}>{user.email}</div>
        </div>
        <div className={styles.avatar}>
          {initials || 'U'}
        </div>
      </div>
    </header>
  );
}
