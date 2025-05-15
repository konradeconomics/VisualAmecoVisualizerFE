import React, { useEffect } from 'react';
import { useThemeStore } from '../../store/themeStore'; // Adjust path as needed

export interface LegendPayloadItem {
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
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    layout?: 'horizontal' | 'vertical';
    align?: 'left' | 'center' | 'right';
    onPayloadUpdate?: (payload: LegendPayloadItem[] | undefined) => void;
}

export const CustomTopLegend: React.FC<CustomLegendProps> = (props) => {
    const {
        payload,
        x = 0,
        y = 0,
        width = 0,
        height = 50,
        layout = 'horizontal',
        align = 'center',
        onPayloadUpdate
    } = props;

    const { theme } = useThemeStore();

    useEffect(() => {
        if (onPayloadUpdate) {
            onPayloadUpdate(payload);
        }
    }, [payload, onPayloadUpdate]);

    if (!payload || payload.length === 0) {
        return null;
    }

    const itemHeight = 20;
    const symbolWidth = 20;
    const symbolMarginRight = 6;
    const textFontSize = 12;
    const itemPaddingHorizontal = 15;
    const itemPaddingVertical = 5;
    const textColor = theme === 'dark' ? '#E2E8F0' : '#374151';

    const legendItems = [];
    let currentX = 0;
    let currentY = itemHeight / 2;
    let maxLineWidth = 0;

    let totalContentWidth = 0;
    if (layout === 'horizontal') {
        payload.forEach(entry => {
            const textWidth = (entry.value?.length || 0) * textFontSize * 0.6;
            totalContentWidth += symbolWidth + symbolMarginRight + textWidth + itemPaddingHorizontal;
        });
        totalContentWidth -= itemPaddingHorizontal;
    }

    let startXOffset = 0;
    if (layout === 'horizontal' && align === 'center' && width > 0) {
        startXOffset = Math.max(0, (width - Math.min(totalContentWidth, width)) / 2);
    } else if (layout === 'horizontal' && align === 'right' && width > 0) {
        startXOffset = Math.max(0, width - Math.min(totalContentWidth, width));
    }

    currentX = startXOffset;

    for (let i = 0; i < payload.length; i++) {
        const entry = payload[i];
        const textWidth = (entry.value?.length || 0) * textFontSize * 0.6;
        const currentItemTotalWidth = symbolWidth + symbolMarginRight + textWidth;

        if (layout === 'horizontal' && width > 0 && (currentX + currentItemTotalWidth) > (startXOffset + width) && currentX > startXOffset) {
            maxLineWidth = Math.max(maxLineWidth, currentX - startXOffset - itemPaddingHorizontal);
            currentX = startXOffset;
            currentY += itemHeight + itemPaddingVertical;
        }

        if (currentY + itemHeight / 2 > height) {
            break;
        }

        legendItems.push(
            <g
                key={`legend-item-${i}-${entry.id}`} // Ensure unique key
                transform={`translate(${currentX}, ${currentY})`}
                style={{ cursor: 'pointer' }}
            >
                <line
                    x1="0"
                    y1="0"
                    x2={symbolWidth}
                    y2="0"
                    stroke={entry.color}
                    strokeWidth="2.5"
                    strokeDasharray={entry.payload?.strokeDasharray}
                />
                <text
                    x={symbolWidth + symbolMarginRight}
                    y="0"
                    dy="0.35em"
                    fill={textColor}
                    fontSize={textFontSize}
                    fontFamily="Arial, sans-serif"
                    textAnchor="start"
                    style={{ userSelect: 'none' }}
                >
                    {entry.value}
                </text>
            </g>
        );
        currentX += currentItemTotalWidth + itemPaddingHorizontal;
    }
    maxLineWidth = Math.max(maxLineWidth, currentX - startXOffset - itemPaddingHorizontal);

    return (
        <g
            id="custom-legend-root-reverted" // Keeping the ID for consistency if needed
            transform={`translate(${x}, ${y})`}
        >
            {legendItems}
        </g>
    );
};