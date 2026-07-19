'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  CreditCard, 
  Receipt, 
  User, 
  LogOut, 
  Wallet 
} from 'lucide-react';
import { logout } from '../store/slices/authSlice';
import styles from '../styles/dashboard.module.css';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Transfers', path: '/dashboard/transfers', icon: ArrowLeftRight },
    { name: 'Cards', path: '/dashboard/cards', icon: CreditCard },
    { name: 'Bills', path: '/dashboard/bills', icon: Receipt },
    { name: 'Profile & Security', path: '/dashboard/profile', icon: User },
  ];

  return (
    <aside className={styles.sidebar}>
      <div>
        <div className={styles.logoArea}>
          <Wallet className={styles.logoIcon} size={28} />
          <span className={styles.logoText}>QUANTUM VAULT</span>
        </div>
        
        <nav className={styles.navLinks}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <button onClick={handleLogout} className={styles.logoutBtn}>
        <LogOut size={20} />
        <span>Log Out</span>
      </button>
    </aside>
  );
}
