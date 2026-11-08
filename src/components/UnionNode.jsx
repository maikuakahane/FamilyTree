import { Handle, Position } from '@xyflow/react';

const STATUS_COLOURS = {
    engaged: '#f0c040',
    cohabiting: '#a0c0f0',
    married: '#e8a838',
    divorced: '#e05555',
    widowed: '#8e8e8e',
};

export default function UnionNode({ data }) {
    const colour = data.status ? STATUS_COLOURS[data.status] || '#e8a838' : '#888';
    const label = data.status
        ? data.status.charAt(0).toUpperCase() + data.status.slice(1)
        : null;

    return (
        <div
            style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: colour,
                border: `2px solid ${colour}`,
                boxSizing: 'border-box',
                position: 'relative',
            }}
        >
            {/* Left — from left spouse/parent */}
            <Handle
                type="target"
                position={Position.Left}
                id="left"
                style={{ background: 'transparent', border: 'none' }}
            />
            {/* Right — from right spouse/parent */}
            <Handle
                type="target"
                position={Position.Right}
                id="right"
                style={{ background: 'transparent', border: 'none' }}
            />
            {/* Bottom — to children */}
            <Handle
                type="source"
                position={Position.Bottom}
                id="bottom"
                style={{ background: 'transparent', border: 'none' }}
            />
            {/* Top — single parent above */}
            <Handle
                type="source"
                position={Position.Top}
                id="top"
                style={{ background: 'transparent', border: 'none' }}
            />

            {label && (
                <div style={{
                    position: 'absolute',
                    top: '-24px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    whiteSpace: 'nowrap',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    color: colour,
                    background: 'var(--bg-elevated)',
                    padding: '1px 5px',
                    borderRadius: '3px',
                    border: `1px solid ${colour}`,
                    pointerEvents: 'none',
                }}>
                    {label}
                </div>
            )}
        </div>
    );
}