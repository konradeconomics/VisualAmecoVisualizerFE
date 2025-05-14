import React from 'react';

interface LegendPayloadItem {
    value: string;
    type: string;
    id: string;
    color: string;
    payload?: {
        strokeDasharray?: string | number;
    }
}

interface CustomLegendProps {
    payload?: LegendPayloadItem[];
}

export const CustomTopLegend: React.FC<CustomLegendProps> = ({ payload }) => {
    if (!payload || payload.length === 0) {
        return null;
    }

    return (
        <div
            style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',

                width: 'fit-content',
                margin: '0 auto',

                height: '100%',
                maxHeight: '100%',
                overflowY: 'auto',
                boxSizing: 'border-box',
                paddingBottom: '10px',
            }}
        >
            {payload.map((entry, index) => (
                <div
                    key={`item-${index}`}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginRight: '15px',
                        marginBottom: '5px',
                        cursor: 'pointer',
                        pointerEvents: 'auto',
                    }}
                >
                    <svg width="14" height="14" style={{ marginRight: '5px' }}>
                        <line
                            x1="0" y1="7" x2="14" y2="7"
                            stroke={entry.color}
                            strokeWidth="2"
                            strokeDasharray={entry.payload?.strokeDasharray}
                        />
                    </svg>
                    <span style={{ color: entry.color, fontSize: '12px' }}>
                        {entry.value}
                    </span>
                </div>
            ))}
        </div>
    );
};