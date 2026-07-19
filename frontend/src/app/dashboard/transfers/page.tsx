'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeftRight, CheckCircle2, XCircle, Search, Calendar, Filter } from 'lucide-react';
import { RootState, AppDispatch } from '../../../store';
import { fetchAccounts } from '../../../store/slices/accountsSlice';
import { executeTransfer, fetchTransactions, resetTransferStatus } from '../../../store/slices/transactionsSlice';
import styles from '../../../styles/dashboard.module.css';

export default function TransfersPage() {
  const dispatch = useDispatch<AppDispatch>();
  const accounts = useSelector((state: RootState) => state.accounts.items);
  const { items: transactions, transferStatus, transferError } = useSelector((state: RootState) => state.transactions);

  const [activeTab, setActiveTab] = useState<'internal' | 'external'>('internal');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Form states
  const [fromAccount, setFromAccount] = useState('');
  const [toAccountNumber, setToAccountNumber] = useState('');
  const [toAccountInternal, setToAccountInternal] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    dispatch(fetchAccounts());
    dispatch(fetchTransactions({}));
    return () => {
      dispatch(resetTransferStatus());
    };
  }, [dispatch]);

  // Set default checking/savings account
  useEffect(() => {
    if (accounts.length > 0) {
      if (!fromAccount) setFromAccount(accounts[0]._id);
      
      const alternative = accounts.find(a => a._id !== accounts[0]._id);
      if (alternative && !toAccountInternal) setToAccountInternal(alternative.accountNumber);
    }
  }, [accounts, fromAccount, toAccountInternal]);

  useEffect(() => {
    if (transferStatus === 'succeeded') {
      setSuccessMessage('Transfer executed successfully! Ledgers updated.');
      setAmount('');
      setDescription('');
      // Refresh balances and history
      dispatch(fetchAccounts());
      dispatch(fetchTransactions({ category: filterCategory, search: searchQuery }));
      // Clear message after 4s
      const timer = setTimeout(() => {
        setSuccessMessage('');
        dispatch(resetTransferStatus());
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [transferStatus, dispatch, filterCategory, searchQuery]);

  const handleFilterChange = (cat: string) => {
    setFilterCategory(cat);
    dispatch(fetchTransactions({ category: cat, search: searchQuery }));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(fetchTransactions({ category: filterCategory, search: searchQuery }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    dispatch(resetTransferStatus());

    const targetAccountNum = activeTab === 'internal' ? toAccountInternal : toAccountNumber;
    if (!fromAccount || !targetAccountNum || !amount) return;

    dispatch(executeTransfer({
      fromAccountId: fromAccount,
      toAccountNumber: targetAccountNum,
      amount: parseFloat(amount),
      description: description || (activeTab === 'internal' ? 'Internal Account Transfer' : 'External Wire Transfer'),
      category: 'transfer',
    }));
  };

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Funds Transfers</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2.5rem' }}>
        Move funds instantly between checking/savings or wire money to external account numbers.
      </p>

      <div className={styles.dashboardGrid}>
        
        {/* Left Column: Transfer Form Panel */}
        <div>
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div className={styles.tabs}>
              <div 
                className={`${styles.tab} ${activeTab === 'internal' ? styles.tabActive : ''}`}
                onClick={() => {
                  setActiveTab('internal');
                  dispatch(resetTransferStatus());
                }}
              >
                Internal Transfer
              </div>
              <div 
                className={`${styles.tab} ${activeTab === 'external' ? styles.tabActive : ''}`}
                onClick={() => {
                  setActiveTab('external');
                  dispatch(resetTransferStatus());
                }}
              >
                Third-Party Wire
              </div>
            </div>

            {successMessage && (
              <div className={`${styles.formMessage} ${styles.formMessageSuccess}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px' }}>
                <CheckCircle2 size={16} />
                <span>{successMessage}</span>
              </div>
            )}

            {transferError && (
              <div className={`${styles.formMessage} ${styles.formMessageError}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px' }}>
                <XCircle size={16} />
                <span>{transferError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Source Account</label>
                <select 
                  className={styles.formSelect}
                  value={fromAccount}
                  onChange={(e) => setFromAccount(e.target.value)}
                >
                  {accounts.map(acc => (
                    <option key={acc._id} value={acc._id}>
                      {acc.alias} ({acc.accountNumber}) - ${acc.balance.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              {activeTab === 'internal' ? (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Recipient Account</label>
                  <select 
                    className={styles.formSelect}
                    value={toAccountInternal}
                    onChange={(e) => setToAccountInternal(e.target.value)}
                  >
                    {accounts.map(acc => (
                      <option key={acc._id} value={acc.accountNumber} disabled={acc._id === fromAccount}>
                        {acc.alias} ({acc.accountNumber}) - ${acc.balance.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Recipient Account Number (10 Digits)</label>
                  <input 
                    type="text"
                    className="glass-input"
                    placeholder="e.g. 8394019284"
                    value={toAccountNumber}
                    onChange={(e) => setToAccountNumber(e.target.value)}
                    maxLength={10}
                    required
                  />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    Tip: You can register another account, copy its account number, and wire funds to it to simulate multi-user wire transfers!
                  </span>
                </div>
              )}

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Amount (USD)</label>
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

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Reference / Description</label>
                <input 
                  type="text"
                  className="glass-input"
                  placeholder="Rent, dining out, savings, etc."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                style={{ width: '100%', marginTop: '1rem', display: 'flex', gap: '0.5rem' }}
                disabled={transferStatus === 'loading'}
              >
                <ArrowLeftRight size={18} />
                {transferStatus === 'loading' ? 'Executing Wire...' : 'Transfer Funds'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Full Ledger Logs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Transaction History</h2>
          
          {/* Filters */}
          <div className="glass-panel" style={{ padding: '1rem' }}>
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <input 
                type="text" 
                placeholder="Search description..." 
                className="glass-input"
                style={{ flex: 1, padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                <Search size={16} />
              </button>
            </form>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Filter size={14} style={{ color: 'var(--text-secondary)' }} />
              <select 
                className={styles.formSelect} 
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', background: 'transparent' }}
                value={filterCategory}
                onChange={(e) => handleFilterChange(e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="transfer">Transfers</option>
                <option value="utilities">Utility Bills</option>
                <option value="income">Income / Faucets</option>
                <option value="shopping">Shopping</option>
                <option value="food">Food</option>
              </select>
            </div>
          </div>

          {/* Ledger Lists */}
          <div className={styles.txList} style={{ maxHeight: '420px', overflowY: 'auto' }}>
            {transactions.length > 0 ? (
              transactions.map((tx) => {
                const isDeposit = ['deposit', 'transfer_in'].includes(tx.type);
                return (
                  <div key={tx._id} className={styles.txRow}>
                    <div className={styles.txLeft}>
                      <div className={`${styles.txIconWrapper} ${isDeposit ? styles.txDepositIcon : styles.txWithdrawIcon}`}>
                        <ArrowLeftRight size={16} />
                      </div>
                      <div className={styles.txDetails}>
                        <span className={styles.txDesc}>{tx.description}</span>
                        <span className={styles.txMeta}>
                          {tx.category.toUpperCase()} • {new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <div className={styles.txRight}>
                      <span className={`${styles.txAmount} ${isDeposit ? styles.txAmountPos : styles.txAmountNeg}`}>
                        {isDeposit ? '+' : '-'}${tx.amount.toFixed(2)}
                      </span>
                      <div className={styles.txRef}>{tx.referenceId}</div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No transaction logs match filters.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
