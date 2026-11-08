import database from '../database';
import { Q } from '@nozbe/watermelondb';

const depthToLabel = (depth, direction) => {
    if (direction === 'up') {
        const letter = String.fromCharCode(64 + depth);
        return `Gen ${letter}`;
    }
    if (direction === 'down') {
        return `Gen ${depth}`;
    }
    return 'Gen 0';
};

export const calculateGenerationLabel = async (ownerId, targetId) => {
    if (ownerId === targetId) return 'Gen 0';

    const visited = new Set();
    const queue = [{ id: ownerId, depth: 0 }];

    while (queue.length > 0) {
        const { id, depth } = queue.shift();

        if (visited.has(id)) continue;
        visited.add(id);

        const parentRels = await database.collections
            .get('relationships')
            .query(Q.where('person2_id', id), Q.where('relationship_type', 'parent'))
            .fetch();

        for (const rel of parentRels) {
            const parentId = rel.person1Id;
            const newDepth = depth + 1;
            if (parentId === targetId) return depthToLabel(newDepth, 'up');
            queue.push({ id: parentId, depth: newDepth });
        }

        const childRels = await database.collections
            .get('relationships')
            .query(Q.where('person1_id', id), Q.where('relationship_type', 'parent'))
            .fetch();

        for (const rel of childRels) {
            const childId = rel.person2Id;
            const newDepth = depth + 1;
            if (childId === targetId) return depthToLabel(newDepth, 'down');
            queue.push({ id: childId, depth: newDepth });
        }
    }

    return 'Gen 0';
};