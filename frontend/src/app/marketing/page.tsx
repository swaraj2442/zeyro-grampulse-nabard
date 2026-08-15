"use client";
import React from 'react';
import RomanScrollytelling from '@/components/Home/RomanScrollytelling';
import styles from './page.module.css';

export default function BusinessPage() {
    return (
        <div className={styles.page}>
            <RomanScrollytelling />
        </div>
    );
}
