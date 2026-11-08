import { BaseEdge, EdgeLabelRenderer, getStraightPath } from '@xyflow/react';

const STATUS_COLOURS = {
    engaged: '#f0c040',
    cohabiting: '#a0c0f0',
    married: '#e8a838',
    divorced: '#e05555',
    widowed: '#8e8e8e',
};

export default function MarriageEdge({
    id, sourceX, sourceY, targetX, targetY,
    data, onEditMarriage,
}) {
    const [edgePath, labelX, labelY] = getStraightPath({
        sourceX, sourceY, targetX, targetY,
    });

    const colour = STATUS_COLOURS[data?.status] || '#e8a838';
    const label = data?.status
        ? data.status.charAt(0).toUpperCase() + data.status.slice(1)
        : 'Spouse';

    return (
        <>
            <BaseEdge
                id={id}
                path={edgePath}
                style={{ stroke: colour, strokeWidth: 2 }}
            />
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
                        pointerEvents: 'all',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: 'var(--bg-elevated)',
                        border: `1px solid ${colour}`,
                        borderRadius: '4px',
                        padding: '2px 8px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        color: colour,
                        cursor: 'default',
                        zIndex: 1000,
                    }}
                    className="nodrag nopan"
                >
                    <span>{label}</span>
                    {data?.marriageId && (
                        <span
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                onEditMarriage(data.marriageId);
                            }}
                            title="Edit marriage"
                            style={{
                                cursor: 'pointer',
                                opacity: 0.8,
                                fontSize: '13px',
                                userSelect: 'none',
                            }}
                        >
                            ✎
                        </span>
                    )}
                </div>
            </EdgeLabelRenderer>
        </>
    );
}