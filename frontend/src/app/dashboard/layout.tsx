import React from 'react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import styles from '../../styles/dashboard.module.css';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.contentArea}>
        <Header />
        <main className={styles.main}>
          {children}
        </main>
      </div>
    </div>
  );
}
