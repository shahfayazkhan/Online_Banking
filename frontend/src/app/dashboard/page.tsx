'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Copy, 
  Plus, 
  Send,
  CreditCard,
  Receipt,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

import { RootState, AppDispatch } from '../../store';
import { fetchAccounts, triggerFaucet } from '../../store/slices/accountsSlice';
import { fetchTransactions } from '../../store/slices/transactionsSlice';
import { fetchCards } from '../../store/slices/cardsSlice';
import api from '../../utils/api';
import styles from '../../styles/dashboard.module.css';

interface AnalyticsData {
  netWorth: number;
  monthlyIncome: number;
  monthlyExpense: number;
  categoryBreakdown: { name: string; value: number }[];
  historyData: { month: string; income: number; expenses: number }[];
}

export default function DashboardPage() {
  const dispatch = useDispatch<AppDispatch>();
  const accounts = useSelector((state: RootState) => state.accounts.items);
  const transactions = useSelector((state: RootState) => state.transactions.items);
  const cards = useSelector((state: RootState) => state.cards.items);

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [faucetLoading, setFaucetLoading] = useState(false);
  const [showFaucet, setShowFaucet] = useState(false);
  const [faucetAmount, setFaucetAmount] = useState('5000');
  const [faucetTargetAccount, setFaucetTargetAccount] = useState('');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchAccounts());
    dispatch(fetchTransactions({ limit: 5 }));
    dispatch(fetchCards());
    fetchAnalytics();
  }, [dispatch]);

  // Set default faucet account when accounts load
  useEffect(() => {
    if (accounts.length > 0 && !faucetTargetAccount) {
      setFaucetTargetAccount(accounts[0]._id);
    }
  }, [accounts, faucetTargetAccount]);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/analytics');
      setAnalytics(response.data);
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    }
  };

  const handleFaucet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faucetTargetAccount || !faucetAmount) return;

    setFaucetLoading(true);
    try {
      await dispatch(triggerFaucet({ 
        accountId: faucetTargetAccount, 
        amount: parseFloat(faucetAmount) 
      })).unwrap();
      
      // Re-fetch transactions and dashboard stats
      dispatch(fetchTransactions({ limit: 5 }));
      fetchAnalytics();
      setShowFaucet(false);
    } catch (err) {
      console.error('Faucet failed', err);
    } finally {
      setFaucetLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Mask card number for display
  const maskCardNumber = (num: string) => {
    return `•••• •••• •••• ${num.slice(-4)}`;
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Financial Overview</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Real-time summary of your capital accounts</p>
        </div>

        <button 
          onClick={() => setShowFaucet(true)} 
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
        >
          <Plus size={16} />
          Demo Faucet
        </button>
      </div>

      {/* Main Metrics cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginTop: '2.5rem' }}>
        <div className={`glass-panel ${styles.statCard}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className={styles.statLabel}>Net Worth</span>
            <Wallet size={20} style={{ color: 'var(--accent-primary)' }} />
          </div>
          <div className={styles.statValue}>
            ${analytics?.netWorth?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Aggregate asset accounts balance</span>
        </div>

        <div className={`glass-panel ${styles.statCard}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className={styles.statLabel}>Monthly Cash Flow</span>
            <TrendingUp size={20} style={{ color: 'var(--success)' }} />
          </div>
          <div className={styles.statValueSuccess}>
            +${analytics?.monthlyIncome?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Incoming transfers & deposits this month</span>
        </div>

        <div className={`glass-panel ${styles.statCard}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className={styles.statLabel}>Monthly Expenses</span>
            <TrendingDown size={20} style={{ color: 'var(--danger)' }} />
          </div>
          <div className={styles.statValueDanger}>
            -${analytics?.monthlyExpense?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Payments & outgoing wire transfers</span>
        </div>
      </div>

      {/* Faucet Overlay Dialog */}
      {showFaucet && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
          backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: 100, display: 'flex', 
          alignItems: 'center', justifyItems: 'center', justifyContent: 'center'
        }}>
          <div className="glass-panel" style={{ width: '400px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-primary)' }}>Demo Fund Faucet</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Inject test money to simulate payments and transfers.</p>
            </div>
            
            <form onSubmit={handleFaucet} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Target Bank Account</label>
                <select 
                  className={styles.formSelect}
                  value={faucetTargetAccount}
                  onChange={(e) => setFaucetTargetAccount(e.target.value)}
                >
                  {accounts.map(acc => (
                    <option key={acc._id} value={acc._id}>
                      {acc.alias} ({acc.accountNumber}) - ${acc.balance}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Injection Amount (USD)</label>
                <input 
                  type="number"
                  className="glass-input"
                  value={faucetAmount}
                  onChange={(e) => setFaucetAmount(e.target.value)}
                  min="1"
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button 
                  type="button" 
                  onClick={() => setShowFaucet(false)} 
                  className="btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  style={{ flex: 1 }}
                  disabled={faucetLoading}
                >
                  {faucetLoading ? 'Injecting...' : 'Inject Funds'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className={styles.dashboardGrid}>
        
        {/* Left Column (Accounts & Charts) */}
        <div className={styles.accountsSection}>
          
          {/* Linked accounts */}
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>My Asset Accounts</h2>
          <div className={styles.accountsRow}>
            {accounts.map((acc) => (
              <div key={acc._id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      {acc.type.toUpperCase()}
                    </span>
                    <span style={{ 
                      fontSize: '0.7rem', 
                      background: 'rgba(16, 185, 129, 0.1)', 
                      color: 'var(--success)', 
                      padding: '0.2rem 0.5rem', 
                      borderRadius: '10px' 
                    }}>
                      Active
                    </span>
                  </div>
                  
                  <div className={styles.balanceLabel}>{acc.alias}</div>
                  <div className={styles.balanceValue}>
                    ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <div className={styles.balanceAccountNumber} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>Acc #: {acc.accountNumber}</span>
                  <button 
                    onClick={() => copyToClipboard(acc.accountNumber)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  >
                    {copiedText === acc.accountNumber ? <CheckCircle size={12} style={{ color: 'var(--success)' }} /> : <Copy size={12} />}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Recharts chart */}
          <div className="glass-panel" style={{ padding: '2rem', marginTop: '1rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem' }}>Income vs Expenses Performance</h2>
            <div style={{ width: '100%', height: '260px' }}>
              {analytics ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--success)" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="var(--success)" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--danger)" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="var(--danger)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} />
                    <YAxis stroke="var(--text-muted)" fontSize={11} />
                    <Tooltip 
                      contentStyle={{ 
                        background: 'var(--bg-secondary)', 
                        borderColor: 'var(--border-color)', 
                        borderRadius: '8px',
                        color: 'var(--text-primary)' 
                      }} 
                    />
                    <Area type="monotone" dataKey="income" stroke="var(--success)" fillOpacity={1} fill="url(#colorIncome)" name="Income" />
                    <Area type="monotone" dataKey="expenses" stroke="var(--danger)" fillOpacity={1} fill="url(#colorExpense)" name="Expenses" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                  Loading performance metrics...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (Cards & Quick Actions & Transactions) */}
        <div className={styles.actionsWidget}>
          
          {/* Card visual render */}
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>My Digital Cards</h2>
          {cards.length > 0 ? (
            <div className={`${styles.virtualCard} ${cards[0].status !== 'active' ? styles.virtualCardBlocked : ''}`}>
              <div className={styles.cardTop}>
                <span className={styles.cardBrand}>QUANTUM DEBIT</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>
                  {cards[0].status.toUpperCase()}
                </span>
              </div>
              <div className={styles.cardChip}></div>
              <div className={styles.cardNumber}>
                {maskCardNumber(cards[0].cardNumber)}
              </div>
              <div className={styles.cardBottom}>
                <div>
                  <div className={styles.cardHolder}>Card Holder</div>
                  <div className={styles.cardHolderName}>{cards[0].cardHolder}</div>
                </div>
                <div className={styles.cardExpiry}>
                  <div className={styles.cardExpiryLabel}>Expires</div>
                  <div className={styles.cardExpiryDate}>{cards[0].expiryDate}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No cards found. Go to Cards tab to issue one.
            </div>
          )}

          {/* Quick Actions Panel */}
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.5rem' }}>Quick Actions</h3>
          <div className={styles.quickActions}>
            <Link href="/dashboard/transfers" className={styles.actionButton}>
              <Send size={18} className={styles.actionIcon} />
              <span>Send</span>
            </Link>
            <Link href="/dashboard/cards" className={styles.actionButton}>
              <CreditCard size={18} className={styles.actionIcon} />
              <span>Cards</span>
            </Link>
            <Link href="/dashboard/bills" className={styles.actionButton}>
              <Receipt size={18} className={styles.actionIcon} />
              <span>Pay Bill</span>
            </Link>
            <button onClick={() => setShowFaucet(true)} className={styles.actionButton}>
              <Plus size={18} className={styles.actionIcon} />
              <span>Faucet</span>
            </button>
          </div>

          {/* Recent transactions list */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Recent Ledger Logs</h3>
            <Link href="/dashboard/transfers" style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
              View History
            </Link>
          </div>
          <div className={styles.txList}>
            {transactions.length > 0 ? (
              transactions.map((tx) => {
                const isDeposit = ['deposit', 'transfer_in'].includes(tx.type);
                return (
                  <div key={tx._id} className={styles.txRow}>
                    <div className={styles.txLeft}>
                      <div className={`${styles.txIconWrapper} ${isDeposit ? styles.txDepositIcon : styles.txWithdrawIcon}`}>
                        {isDeposit ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                      </div>
                      <div className={styles.txDetails}>
                        <span className={styles.txDesc}>{tx.description}</span>
                        <span className={styles.txMeta}>
                          {tx.category.toUpperCase()} • {new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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
              <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                No recent transactions. Use the faucet or transfer money to start.
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
