import React from 'react';
import styles from './AdminMainCard.module.css';

const SubmissionDeadlineCard = ({ data, timestamp }) => {
    return (
        <div className={styles.card}>
            <h3 className={styles.title}>
                서류 제출 마감 <span className={styles.timestamp}>{timestamp}</span>
            </h3>
            <table className={styles.table}>
                <tbody>
                {data.map((item, idx) => (
                    <tr key={idx}>
                        <td>{item.title}</td>
                        <td>{item.deadline}</td>
                        <td>{item.status}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default SubmissionDeadlineCard;
