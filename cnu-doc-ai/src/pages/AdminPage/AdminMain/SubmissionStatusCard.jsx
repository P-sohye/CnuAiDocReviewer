import React from 'react';
import styles from './AdminMainCard.module.css';

const SubmissionStatusCard = ({ data, timestamp }) => {
    return (
        <div className={styles.card}>
            <h3 className={styles.title}>
                서류 제출 현황 <span className={styles.timestamp}>{timestamp}</span>
            </h3>
            <table className={styles.table}>
                <tbody>
                {data.map((item, idx) => (
                    <tr key={idx}>
                        <td>{item.department}</td>
                        <td>{item.count}건</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default SubmissionStatusCard;
