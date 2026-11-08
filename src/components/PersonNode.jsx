import { Handle, Position } from '@xyflow/react';

const genderStyles = {
    male: { background: '#4a90d9', border: '2px solid #2c6fad' },
    female: { background: '#d96a9e', border: '2px solid #ad4a7a' },
    unknown: { background: '#8e8e8e', border: '2px solid #666666' },
};

export default function PersonNode({ data, onEditPerson, onViewDetails }) {
    const style = genderStyles[data.gender] || genderStyles.unknown;

    return (
        <div
            style={{
                ...style,
                width: '180px',
                minHeight: '80px',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                color: 'white',
                padding: '8px 10px',
                textAlign: 'center',
                boxSizing: 'border-box',
                position: 'relative',
                outline: data.role === 'centre' ? '3px solid white' : 'none',
                boxShadow: data.role === 'centre' ? '0 0 0 5px rgba(0,0,0,0.3)' : 'none',
            }}
        >
            {/* Top — receives connection from union node above */}
            <Handle
                type="target"
                position={Position.Top}
                id="top"
                style={{ visibility: data.showTop ? 'visible' : 'hidden' }}
            />

            {/* Left — source to union node on the left */}
            <Handle
                type="source"
                position={Position.Left}
                id="left"
                style={{ visibility: 'visible' }}
            />

            {/* Owner crown */}
            {data.isOwner && (
                <div style={{
                    position: 'absolute',
                    top: '4px',
                    left: '6px',
                    fontSize: '12px',
                    lineHeight: 1,
                }}>
                    👑
                </div>
            )}

            {/* Action buttons */}
            <div style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                display: 'flex',
                gap: '4px',
            }}>
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        if (onViewDetails) onViewDetails(data.personId);
                    }}
                    title="View details"
                    style={{ cursor: 'pointer', fontSize: '13px', opacity: 0.7, lineHeight: 1 }}
                >
                    🔍
                </div>
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        if (onEditPerson) onEditPerson(data.personId);
                    }}
                    title="Edit person"
                    style={{ cursor: 'pointer', fontSize: '14px', opacity: 0.7, lineHeight: 1 }}
                >
                    ✎
                </div>
            </div>

            {/* Name */}
            <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '4px' }}>
                {data.label}
            </div>

            {/* Date of birth */}
            {data.bornAt && (
                <div style={{ fontSize: '11px', opacity: 0.9 }}>
                    🎂 {new Date(data.bornAt).toLocaleDateString()}
                </div>
            )}

            {/* Place of birth */}
            {data.birthPlace && (
                <div style={{ fontSize: '11px', opacity: 0.9 }}>
                    📍 {data.birthPlace}
                </div>
            )}

            {/* Right — source to union node on the right */}
            <Handle
                type="source"
                position={Position.Right}
                id="right"
                style={{ visibility: 'visible' }}
            />

            {/* Bottom — source to children below */}
            <Handle
                type="source"
                position={Position.Bottom}
                id="bottom"
                style={{ visibility: data.showBottom ? 'visible' : 'hidden' }}
            />
        </div>
    );
}