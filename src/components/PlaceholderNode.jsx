export default function PlaceholderNode({ data }) {
    return (
        <div
            onClick={data.onClick}
            style={{
                width: '180px',
                height: '60px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#aaaaaa',
                padding: '0 10px',
                textAlign: 'center',
                boxSizing: 'border-box',
                background: 'var(--bg-elevated)',
                border: '2px dashed #555555',
                cursor: 'pointer',
            }}
        >
            <span>{data.label}</span>
        </div>
    );
}