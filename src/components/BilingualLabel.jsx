import { getLabel } from '../utils/i18n';

export default function BilingualLabel({ labelKey, language, style }) {
    if (language === 'both') {
        const { en, cs } = getLabel(labelKey, 'both');
        return (
            <td style={style}>
                <div>{en}</div>
                <div style={{ color: '#888', fontWeight: 'normal' }}>{cs}</div>
            </td>
        );
    }

    return (
        <td style={style}>{getLabel(labelKey, language)}</td>
    );
}