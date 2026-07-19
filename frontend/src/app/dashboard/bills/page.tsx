'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Receipt, CheckCircle2, XCircle, Clock, Calendar } from 'lucide-react';
import { RootState, AppDispatch } from '../../../store';
import { fetchAccounts } from '../../../store/slices/accountsSlice';
import { fetchBillers, fetchPaymentHistory, payBiller, resetPayStatus } from '../../../store/slices/billsSlice';
import styles from '../../../styles/dashboard.module.css';

export default function BillsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const accounts = useSelector((state: RootState) => state.accounts.items);
  const { billers, history, payStatus, payError } = useSelector((state: RootState) => state.bills);

  // Form states
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [selectedBillerCode, setSelectedBillerCode] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    dispatch(fetchAccounts());
    dispatch(fetchBillers());
    dispatch(fetchPaymentHistory());
    return () => {
      dispatch(resetPayStatus());
    };
  }, [dispatch]);

  // Set defaults when lists load
  useEffect(() => {
    if (accounts.length > 0 && !selectedAccountId) {
      setSelectedAccountId(accounts[0]._id);
    }
  }, [accounts, selectedAccountId]);

  useEffect(() => {
    if (billers.length > 0 && !selectedBillerCode) {
      setSelectedBillerCode(billers[0].code);
    }
  }, [billers, selectedBillerCode]);

  useEffect(() => {
    if (payStatus === 'succeeded') {
      setSuccessMessage('Utility bill paid successfully! Ledger logs created.');
      setReferenceNumber('');
      setAmount('');
      dispatch(fetchAccounts()); // Refresh balances
      dispatch(resetPayStatus());
      const timer = setTimeout(() => setSuccessMessage(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [payStatus, dispatch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    dispatch(resetPayStatus());

    if (!selectedAccountId || !selectedBillerCode || !referenceNumber || !amount) return;

    dispatch(payBiller({
      accountId: selectedAccountId,
      billerCode: selectedBillerCode,
      referenceNumber,
      amount: parseFloat(amount)
    }));
  };

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Utility & Service Payments</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2.5rem' }}>
        Pay electric, water, internet, and health insurance bills directly from checking or savings balances.
      </p>

      <div className={styles.dashboardGrid}>
        
        {/* Left Column: Biller payment form */}
        <div>
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Receipt size={20} />
              Pay New Bill
            </h2>

            {successMessage && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', color: 'var(--success)', fontSize: '0.85rem' }}>
                <CheckCircle2 size={16} />
                <span>{successMessage}</span>
              </div>
            )}

            {payError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', color: 'var(--danger)', fontSize: '0.85rem' }}>
                <XCircle size={16} />
                <span>{payError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
              
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Select Asset Account</label>
                <select 
                  className={styles.formSelect}
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                >
                  {accounts.map(acc => (
                    <option key={acc._id} value={acc._id}>
                      {acc.alias} ({acc.accountNumber}) - ${acc.balance.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Registered Biller</label>
                <select 
                  className={styles.formSelect}
                  value={selectedBillerCode}
                  onChange={(e) => setSelectedBillerCode(e.target.value)}
                >
                  {billers.map(b => (
                    <option key={b.code} value={b.code}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Biller Reference / Account Number</label>
                <input 
                  type="text"
                  className="glass-input"
                  placeholder="e.g. 100-293-849-0"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  required
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Enter the unique account identifier printed on your paper invoice statement.
                </span>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Payment Amount (USD)</label>
                <input 
                  type="number"
                  className="glass-input"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                style={{ width: '100%', marginTop: '1rem', display: 'flex', gap: '0.5rem' }}
                disabled={payStatus === 'loading'}
              >
                <Receipt size={18} />
                {payStatus === 'loading' ? 'Processing Payment...' : 'Pay Bill'}
              </button>

            </form>
          </div>
        </div>

        {/* Right Column: Payment Ledger History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Biller Payment Ledger</h2>
          <div className={styles.txList} style={{ maxHeight: '480px', overflowY: 'auto' }}>
            {history.length > 0 ? (
              history.map((item) => (
                <div key={item._id} className={styles.txRow}>
                  <div className={styles.txLeft}>
                    <div className={`${styles.txIconWrapper} ${styles.txWithdrawIcon}`}>
                      <Receipt size={16} />
                    </div>
                    <div className={styles.txDetails}>
                      <span className={styles.txDesc}>{item.billerName}</span>
                      <span className={styles.txMeta}>
                        Ref: {item.referenceNumber} • {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  <div className={styles.txRight}>
                    <span className={`${styles.txAmount} ${styles.txAmountNeg}`}>
                      -${item.amount.toFixed(2)}
                    </span>
                    <div style={{ 
                      fontSize: '0.65rem', 
                      background: 'rgba(16, 185, 129, 0.1)', 
                      color: 'var(--success)', 
                      padding: '0.1rem 0.4rem', 
                      borderRadius: '5px',
                      display: 'inline-block',
                      marginTop: '0.2rem'
                    }}>
                      {item.status.toUpperCase()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                No bill payments logs found.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
