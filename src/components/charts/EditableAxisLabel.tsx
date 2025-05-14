import React, { useState, useEffect, useCallback } from 'react';

interface EditableAxisLabelProps {
    x?: number;
    y?: number;
    payload?: { value?: string; coordinate?: number };
    viewBox?: { x?: number; y?: number; width?: number; height?: number };

    // Custom props
    yAxisId: string;
    defaultLabel: string;
    customLabel?: string;
    onSave: (yAxisId: string, newLabel: string) => void;
    axisColor: string;

    // Styling props
    angle?: number;
    dy?: number;
    dx?: number;
    textAnchor?: string;
    fontSize?: number | string;
}

export const EditableAxisLabel: React.FC<EditableAxisLabelProps> = (props) => {
    const {
        viewBox = { x: 0, y: 0, width: 0, height: 0 },
        payload,

        yAxisId,
        defaultLabel,
        customLabel,
        onSave,
        axisColor,
        angle = 0,
        dy = 0,
        dx = 0,
        textAnchor = 'middle',
        fontSize = 12,
    } = props;

    const [isEditing, setIsEditing] = useState(false);
    const effectiveDefaultLabel = payload?.value || defaultLabel;
    const [editText, setEditText] = useState(customLabel || effectiveDefaultLabel);

    console.log(`EditableAxisLabel (${yAxisId}): isEditing = ${isEditing}, editText = ${editText}`); // Log current state


    useEffect(() => {
        setEditText(customLabel || effectiveDefaultLabel);
    }, [customLabel, effectiveDefaultLabel]);

    const handleSave = useCallback(() => {
        const trimmedEditText = editText.trim();
        if (trimmedEditText === effectiveDefaultLabel.trim() || trimmedEditText === '') {
            onSave(yAxisId, '');
        } else {
            onSave(yAxisId, trimmedEditText);
        }
        setIsEditing(false);
    }, [editText, onSave, yAxisId, effectiveDefaultLabel]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') handleSave();
        else if (event.key === 'Escape') {
            setEditText(customLabel || effectiveDefaultLabel);
            setIsEditing(false);
        }
    };

    const handleBlur = () => {
        setTimeout(() => { if (isEditing) handleSave(); }, 100);
    };

    const currentDisplayLabel = (customLabel && customLabel.trim() !== '') ? customLabel : effectiveDefaultLabel;

    const finalX = (viewBox.x || 0) + ((viewBox.width || 0) / 2) + dx;
    const finalY = (viewBox.y || 0) + dy;


    const inputWidth = 100;
    const inputHeight = 25;
    const foreignObjectX = (viewBox.x || 0) + ((viewBox.width || 0) / 2) - (inputWidth / 2) + dx;
    const foreignObjectY = (viewBox.y || 0) + dy - (inputHeight / 2) - (typeof fontSize === 'number' ? fontSize/3 : 5) ;


    if (isEditing) {
        return (
            <foreignObject x={foreignObjectX} y={foreignObjectY} width={inputWidth} height={inputHeight}>
                {/* @ts-ignore ts(2322) */}
                <div xmlns="http://www.w3.org/1999/xhtml" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', backgroundColor: 'white' }}>
                    <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        style={{
                            fontSize: typeof fontSize === 'number' ? `${fontSize}px` : fontSize,
                            padding: '2px 4px', border: '1px solid #ccc', borderRadius: '3px',
                            textAlign: 'center', width: '100%', boxSizing: 'border-box', color: '#000',
                        }}
                        className="nodrag"
                    />
                </div>
            </foreignObject>
        );
    }

    return (
        <text
            x={finalX}
            y={finalY}
            transform={angle && finalX !== undefined && finalY !== undefined ? `rotate(${angle}, ${finalX}, ${finalY})` : undefined}
            textAnchor={textAnchor}
            fontSize={typeof fontSize === 'number' ? `${fontSize}px` : fontSize}
            fill={axisColor}
            onClick={() => setIsEditing(true)}
            style={{ cursor: 'pointer', userSelect: 'none', WebkitUserSelect: 'none' }}
            className="recharts-text recharts-label"
        >
            {currentDisplayLabel}
        </text>
    );
};