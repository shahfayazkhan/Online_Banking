'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { User, ShieldAlert, Lock, CheckCircle2, Save } from 'lucide-react';
import { RootState, AppDispatch } from '../../../store';
import { updateProfile } from '../../../store/slices/authSlice';
import styles from '../../../styles/dashboard.module.css';

export default function ProfilePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
  });

  const [twoFactor, setTwoFactor] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        address: user.address || '',
      });
      setTwoFactor(user.twoFactorEnabled || false);
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setLoading(true);
    try {
      await dispatch(updateProfile(formData)).unwrap();
      setSuccessMessage('Profile details updated successfully!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTwoFactor = async () => {
    const nextState = !twoFactor;
    setTwoFactor(nextState);
    try {
      await dispatch(updateProfile({ twoFactorEnabled: nextState })).unwrap();
      setSuccessMessage(`2FA security status ${nextState ? 'enabled' : 'disabled'}!`);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setTwoFactor(!nextState); // rollback
      console.error(err);
    }
  };

  if (!user) return <div style={{ color: 'var(--text-secondary)' }}>Loading account profile...</div>;

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Profile & Security</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2.5rem' }}>
        Modify your personal details and configure multi-factor auth simulation settings.
      </p>

      {successMessage && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', color: 'var(--success)', fontSize: '0.85rem' }}>
          <CheckCircle2 size={16} />
          <span>{successMessage}</span>
        </div>
      )}

      <div className={styles.dashboardGrid}>
        
        {/* Left Column: Personal info form */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={20} />
            Personal Details
          </h2>

          <form onSubmit={handleSubmitProfile} className={styles.form}>
            <div className={styles.twoColGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="firstName">First Name</label>
                <input 
                  id="firstName"
                  type="text"
                  className="glass-input"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="lastName">Last Name</label>
                <input 
                  id="lastName"
                  type="text"
                  className="glass-input"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Email Address (Read-only)</label>
              <input 
                type="email"
                className="glass-input"
                value={user.email}
                disabled
                style={{ opacity: 0.5, cursor: 'not-allowed' }}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="phone">Phone Number</label>
              <input 
                id="phone"
                type="text"
                className="glass-input"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="address">Residential Address</label>
              <input 
                id="address"
                type="text"
                className="glass-input"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem', display: 'flex', gap: '0.5rem' }} disabled={loading}>
              <Save size={16} />
              {loading ? 'Saving details...' : 'Save Profile Details'}
            </button>
          </form>
        </div>

        {/* Right Column: Security configs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={20} />
              MFA Simulation
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Enhance your account safety by locking authentication channels. When active, transaction approvals will demand token simulation verification codes.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                <div>
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, display: 'block' }}>2-Factor Authentication (2FA)</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status: {twoFactor ? 'ENABLED' : 'DISABLED'}</span>
                </div>

                <div 
                  onClick={handleToggleTwoFactor}
                  style={{
                    width: '50px', height: '26px', borderRadius: '13px',
                    background: twoFactor ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                    padding: '3px', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: twoFactor ? 'flex-end' : 'flex-start',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Security Compliance</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              This platform adheres to PCI-DSS transaction schemas and AES-256 visual hashing definitions. Linked credit/debit card numbers are masked inside our API responses.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
