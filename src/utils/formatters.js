export const formatDate = (timestamp) =>
    timestamp ? new Date(timestamp).toLocaleDateString('en-GB') : '—';

export const formatPlace = (town, country) => {
    const parts = [town, country].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : '—';
};
export const formatAddress = (street, town, country, code) => {
    const parts = [street, town, country, code].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : '—';
};

export const findReligionKey = (value, religionDictionary) => {
    if (!value) return null;
    // search through all languages to find a matching key
    for (const lang of Object.values(religionDictionary)) {
        for (const [key, label] of Object.entries(lang)) {
            if (label.toLowerCase() === value.toLowerCase()) return key;
        }
    }
    return null;
};