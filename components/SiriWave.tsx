import React from 'react';

const SiriWave: React.FC = () => {
    const colors = ['#6050DC', '#D52DB7', '#FF2E7E', '#FF6B45', '#FFAB05'];
    
    return (
        <div className="flex justify-center items-center space-x-1 h-16 w-64">
            {Array.from({ length: 40 }).map((_, i) => (
                <div
                    key={i}
                    className="w-1 rounded-full bg-current"
                    style={{
                        animation: `siri-wave 1.5s ease-in-out ${i * 0.05}s infinite`,
                        '--wave-color': colors[i % colors.length]
                    } as React.CSSProperties}
                />
            ))}
            <style>{`
                @keyframes siri-wave {
                    0%, 100% {
                        height: 4px;
                        background-color: var(--wave-color);
                        opacity: 0.4;
                    }
                    50% {
                        height: 64px;
                        background-color: var(--wave-color);
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );
};

export default SiriWave;
