'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div style={{ padding: '20px', textAlign: 'center', color: '#fff' }}>
            <h2>Something went wrong!</h2>
            <p>{error.message}</p>
            <button
                onClick={() => reset()}
                style={{
                    padding: '10px 20px',
                    background: '#FFF',
                    color: '#000',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    marginTop: '10px'
                }}
            >
                Try again
            </button>
        </div>
    );
}
