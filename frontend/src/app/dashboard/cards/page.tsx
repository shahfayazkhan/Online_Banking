'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CreditCard, Eye, EyeOff, ShieldCheck, Lock, Unlock, Sliders, CheckCircle, Plus } from 'lucide-react';
import { RootState, AppDispatch } from '../../../store';
import { fetchCards, toggleCardBlock, updateCardLimits, updateCardPin, orderNewCard } from '../../../store/slices/cardsSlice';
import { fetchAccounts } from '../../../store/slices/accountsSlice';
import styles from '../../../styles/dashboard.module.css';

export default function CardsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const cards = useSelector((state: RootState) => state.cards.items);
  const accounts = useSelector((state: RootState) => state.accounts.items);

  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const [showPin, setShowPin] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [newSpendLimit, setNewSpendLimit] = useState('');
  const [newWithdrawLimit, setNewWithdrawLimit] = useState('');

  // Order Card states
  const [orderAccountId, setOrderAccountId] = useState('');
  const [orderCardType, setOrderCardType] = useState<'debit' | 'credit'>('debit');

  const [notification, setNotification] = useState('');

  useEffect(() => {
    dispatch(fetchCards());
    dispatch(fetchAccounts());
  }, [dispatch]);

  // Set default selection
  useEffect(() => {
    if (cards.length > 0 && !selectedCardId) {
      setSelectedCardId(cards[0]._id);
      setNewSpendLimit(cards[0].dailySpendLimit.toString());
      setNewWithdrawLimit(cards[0].dailyWithdrawLimit.toString());
    }
  }, [cards, selectedCardId]);

  useEffect(() => {
    if (accounts.length > 0 && !orderAccountId) {
      setOrderAccountId(accounts[0]._id);
    }
  }, [accounts, orderAccountId]);

  const selectedCard = cards.find(c => c._id === selectedCardId);

  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  const handleToggleBlock = async () => {
    if (!selectedCardId) return;
    try {
      await dispatch(toggleCardBlock(selectedCardId)).unwrap();
      triggerNotification('Card lock status toggled successfully.');
    } catch (err: any) {
      triggerNotification(err || 'Failed to toggle card lock state.');
    }
  };

  const handleUpdateLimits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCardId || !newSpendLimit || !newWithdrawLimit) return;
    try {
      await dispatch(updateCardLimits({
        cardId: selectedCardId,
        dailySpendLimit: parseFloat(newSpendLimit),
        dailyWithdrawLimit: parseFloat(newWithdrawLimit)
      })).unwrap();
      triggerNotification('Daily limits updated successfully.');
    } catch (err: any) {
      triggerNotification(err || 'Failed to update daily limits.');
    }
  };

  const handleUpdatePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCardId || !newPin) return;
    try {
      await dispatch(updateCardPin({
        cardId: selectedCardId,
        pin: newPin
      })).unwrap();
      setNewPin('');
      triggerNotification('Card security PIN updated successfully.');
    } catch (err: any) {
      triggerNotification(err || 'Failed to change security PIN.');
    }
  };

  const handleOrderCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderAccountId || !orderCardType) return;
    try {
      await dispatch(orderNewCard({
        accountId: orderAccountId,
        type: orderCardType
      })).unwrap();
      triggerNotification(`New ${orderCardType} card issued successfully!`);
    } catch (err: any) {
      triggerNotification(err || 'Failed to issue card.');
    }
  };

  const maskCardNumber = (num: string) => {
    return `${num.slice(0, 4)} ${num.slice(4, 8)} ${num.slice(8, 12)} ${num.slice(12)}`;
  };

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Manage Digital Cards</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2.5rem' }}>
        Change spending limits, block cards temporarily, change PIN numbers, and order new cards.
      </p>

      {notification && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', 
          padding: '0.75rem 1rem', background: 'rgba(16, 185, 129, 0.1)', 
          border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', color: 'var(--success)'
        }}>
          <CheckCircle size={16} />
          <span>{notification}</span>
        </div>
      )}

      <div className={styles.dashboardGrid}>
        
        {/* Left Column: Cards Visual and Limits */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Card Select Tab */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Choose Card</label>
            <select 
              className={styles.formSelect}
              value={selectedCardId}
              onChange={(e) => {
                setSelectedCardId(e.target.value);
                const c = cards.find(item => item._id === e.target.value);
                if (c) {
                  setNewSpendLimit(c.dailySpendLimit.toString());
                  setNewWithdrawLimit(c.dailyWithdrawLimit.toString());
                }
              }}
            >
              {cards.map(c => (
                <option key={c._id} value={c._id}>
                  {c.type.toUpperCase()} Card ending in {c.cardNumber.slice(-4)} ({c.status})
                </option>
              ))}
            </select>
          </div>

          {selectedCard ? (
            <>
              {/* Visual Card Card */}
              <div 
                className={`${styles.virtualCard} ${selectedCard.status !== 'active' ? styles.virtualCardBlocked : ''}`}
                style={{ 
                  background: selectedCard.type === 'credit' 
                    ? 'linear-gradient(135deg, #1e3a8a 0%, #1e1b4b 50%, #020617 100%)' 
                    : 'linear-gradient(135deg, #581c87 0%, #3b0764 50%, #020617 100%)',
                  transform: 'scale(1)',
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)'
                }}
              >
                <div className={styles.cardTop}>
                  <span className={styles.cardBrand}>QUANTUM {selectedCard.type.toUpperCase()}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>
                    {selectedCard.status.toUpperCase()}
                  </span>
                </div>
                <div className={styles.cardChip}></div>
                <div className={styles.cardNumber}>
                  {maskCardNumber(selectedCard.cardNumber)}
                </div>
                <div className={styles.cardBottom}>
                  <div>
                    <div className={styles.cardHolder}>Card Holder</div>
                    <div className={styles.cardHolderName}>{selectedCard.cardHolder}</div>
                  </div>
                  <div className={styles.cardExpiry}>
                    <div className={styles.cardExpiryLabel}>Expires</div>
                    <div className={styles.cardExpiryDate}>{selectedCard.expiryDate}</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ fontWeight: 700 }}>Card Status Lock</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {selectedCard.status === 'active' ? 'Freeze card to block authorization codes.' : 'Activate card to restore transaction abilities.'}
                  </p>
                </div>
                <button 
                  onClick={handleToggleBlock} 
                  className={selectedCard.status === 'active' ? 'btn-secondary' : 'btn-primary'}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
                >
                  {selectedCard.status === 'active' ? (
                    <>
                      <Lock size={16} />
                      Lock Card
                    </>
                  ) : (
                    <>
                      <Unlock size={16} />
                      Unlock Card
                    </>
                  )}
                </button>
              </div>

              {/* Limits Configuration */}
              <div className="glass-panel" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sliders size={18} style={{ color: 'var(--accent-primary)' }} />
                  Card Spend Limits
                </h3>

                <form onSubmit={handleUpdateLimits} className={styles.form}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Daily Transaction Limit (USD)</label>
                    <input 
                      type="number"
                      className="glass-input"
                      value={newSpendLimit}
                      onChange={(e) => setNewSpendLimit(e.target.value)}
                      min="1"
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Daily Cash Withdrawal Limit (USD)</label>
                    <input 
                      type="number"
                      className="glass-input"
                      value={newWithdrawLimit}
                      onChange={(e) => setNewWithdrawLimit(e.target.value)}
                      min="1"
                      required
                    />
                  </div>
                  <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                    Save Card Limits
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Loading cards details...
            </div>
          )}
        </div>

        {/* Right Column: Security Pin Reset and Issue New Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Card PIN Reset */}
          {selectedCard && (
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={18} style={{ color: 'var(--accent-primary)' }} />
                Update Security PIN
              </h3>

              <form onSubmit={handleUpdatePin} className={styles.form}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>New 4-Digit Card PIN</label>
                  <input 
                    type="password"
                    className="glass-input"
                    placeholder="••••"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    maxLength={4}
                    required
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                  Update PIN Code
                </button>
              </form>
            </div>
          )}

          {/* Issue New Card */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={18} style={{ color: 'var(--accent-primary)' }} />
              Issue New Card
            </h3>

            <form onSubmit={handleOrderCard} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Linked Asset Account</label>
                <select 
                  className={styles.formSelect}
                  value={orderAccountId}
                  onChange={(e) => setOrderAccountId(e.target.value)}
                >
                  {accounts.map(acc => (
                    <option key={acc._id} value={acc._id}>
                      {acc.alias} ({acc.accountNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Card Product Type</label>
                <select 
                  className={styles.formSelect}
                  value={orderCardType}
                  onChange={(e) => setOrderCardType(e.target.value as 'debit' | 'credit')}
                >
                  <option value="debit">Visa Debit Card</option>
                  <option value="credit">Visa Credit Card</option>
                </select>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                Issue Card Instantly
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
