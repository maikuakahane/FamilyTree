import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { withObservables } from '@nozbe/watermelondb/react';
import database from '../database';
import PersonNode from './PersonNode';
import PlaceholderNode from './PlaceholderNode';
import AddPersonFromTree from './AddPersonFromTree';
import PersonForm from './PersonForm';
import MarriageEdge from './MarriageEdge';
import MarriageModal from './MarriageModal';
import PersonDetailModal from './PersonDetailModal';
import UnionNode from './UnionNode';

function buildTree(centrePersonId, people, relationships, marriages, onPlaceholderClick, ancestorLimit, descendantLimit) {
    const nodes = [];
    const edges = [];

    const W = 180;
    const H = 80;
    const UNION_SIZE = 20;
    const Y_GAP = 220;

    const n = (ancestorLimit === null || ancestorLimit === undefined) ? 3 : ancestorLimit;

    // Distance from person centre to their couple union centre at each generation
    // gen 0 = focus, gen -1 = parents, gen -2 = grandparents etc.
    const personToUnion = (gen) => W * Math.pow(2, gen + n);

    const personMap = {};
    people.forEach(p => (personMap[p.id] = p));

    const marriageMap = {};
    marriages.forEach(m => {
        marriageMap[`${m.person1Id}-${m.person2Id}`] = m;
        marriageMap[`${m.person2Id}-${m.person1Id}`] = m;
    });

    const focus = personMap[centrePersonId];
    if (!focus) return { nodes, edges };

    // ── Helpers ──
    const getSpouses = (personId) =>
        relationships
            .filter(r => r.relationshipType === 'spouse' &&
                (r.person1Id === personId || r.person2Id === personId))
            .map(r => personMap[r.person1Id === personId ? r.person2Id : r.person1Id])
            .filter(Boolean);

    const getParents = (personId) =>
        relationships
            .filter(r => r.relationshipType === 'parent' && r.person2Id === personId)
            .map(r => personMap[r.person1Id])
            .filter(Boolean);

    const getChildren = (personId) =>
        relationships
            .filter(r => r.relationshipType === 'parent' && r.person1Id === personId)
            .map(r => personMap[r.person2Id])
            .filter(Boolean);

    const getSiblings = (personId) => {
        const parents = getParents(personId);
        if (parents.length === 0) return [];
        const siblingIds = new Set();
        parents.forEach(parent => {
            getChildren(parent.id).forEach(child => {
                if (child.id !== personId) siblingIds.add(child.id);
            });
        });
        return [...siblingIds].map(id => personMap[id]).filter(Boolean);
    };

    const getMarriage = (id1, id2) =>
        marriageMap[`${id1}-${id2}`] || marriageMap[`${id2}-${id1}`] || null;

    const sortByAge = (arr) =>
        [...arr].sort((a, b) => {
            if (a.bornAt && b.bornAt) return a.bornAt - b.bornAt;
            if (a.bornAt) return -1;
            if (b.bornAt) return 1;
            return 0;
        });

    const isMaleOrUnknown = (person) => person?.gender !== 'female';
    const genderStroke = (person) => person?.gender === 'female' ? '#d96a9e' : '#4a90d9';

    // ── Node builders ──
    const addedNodeIds = new Set();

    const addUnionNode = (unionId, cx, cy, status) => {
        if (addedNodeIds.has(unionId)) return;
        addedNodeIds.add(unionId);
        nodes.push({
            id: unionId,
            type: 'unionNode',
            data: { status },
            position: { x: cx - UNION_SIZE / 2, y: cy - UNION_SIZE / 2 },
        });
    };

    const addPersonNode = (person, cx, cy, role) => {
        if (addedNodeIds.has(person.id)) return;
        addedNodeIds.add(person.id);
        nodes.push({
            id: person.id,
            type: 'personNode',
            data: {
                label: `${person.firstName} ${person.lastName}`,
                role,
                gender: person.gender || 'unknown',
                bornAt: person.bornAt || null,
                birthPlace: person.birthPlace || null,
                isOwner: person.isOwner || false,
                personId: person.id,
                showTop: true,
                showBottom: true,
            },
            position: { x: cx - W / 2, y: cy - H / 2 },
        });
    };

    const addPlaceholder = (id, label, cx, cy, onClick) => {
        if (addedNodeIds.has(id)) return;
        addedNodeIds.add(id);
        nodes.push({
            id,
            type: 'placeholderNode',
            data: { label, onClick },
            position: { x: cx - W / 2, y: cy - H / 2 },
        });
    };

    const addedEdgeIds = new Set();
    const addEdge = (id, source, sourceHandle, target, targetHandle, style = {}) => {
        if (addedEdgeIds.has(id)) return;
        addedEdgeIds.add(id);
        edges.push({ id, source, sourceHandle, target, targetHandle, style });
    };

    const connectToUnion = (nodeId, unionId, isLeft, style) => {
        addEdge(
            `edge-${nodeId}-to-${unionId}`,
            nodeId, isLeft ? 'right' : 'left',
            unionId, isLeft ? 'left' : 'right',
            style
        );
    };

    // ── Couple builder ──
    // Renders a couple union at (unionCX, unionCY)
    // person is on left if male, right if female
    // dist = distance from person centre to union centre
    const buildCouple = (personId, spouseId, unionCX, unionCY, dist, personRole, spouseRole) => {
        const person = personMap[personId];
        const spouse = spouseId ? personMap[spouseId] : null;
        if (!person) return;

        const marriage = spouse ? getMarriage(personId, spouseId) : null;
        const unionId = spouse
            ? `union-${[personId, spouseId].sort().join('-')}`
            : `union-${personId}-nospouse`;

        addUnionNode(unionId, unionCX, unionCY, marriage?.status || null);

        const personLeft = isMaleOrUnknown(person);
        const personCX = personLeft ? unionCX - dist : unionCX + dist;
        const spouseCX = personLeft ? unionCX + dist : unionCX - dist;

        addPersonNode(person, personCX, unionCY, personRole);
        connectToUnion(personId, unionId, personLeft, { stroke: genderStroke(person) });

        if (spouse) {
            addPersonNode(spouse, spouseCX, unionCY, spouseRole);
            connectToUnion(spouseId, unionId, !personLeft, { stroke: genderStroke(spouse) });
        } else {
            const placeholderId = `placeholder-spouse-${personId}`;
            addPlaceholder(
                placeholderId,
                `+ Add ${person.firstName}'s Spouse`,
                spouseCX, unionCY,
                () => onPlaceholderClick('spouse', personId, 'unknown')
            );
            connectToUnion(placeholderId, unionId, !personLeft,
                { stroke: '#555', strokeDasharray: '5 5' });
        }

        return { unionId, personCX, spouseCX, personLeft };
    };

    // ── Parent row builder ──
    // Builds father + mother (or placeholders) above a child
    // childX = X of the child (parent union sits directly above at childX)
    // dist = personToUnion distance at parent generation level
    const buildParentRow = (childPersonId, childX, rowY, dist, genLabel) => {
        const child = personMap[childPersonId];
        if (!child) return null;

        const parents = getParents(childPersonId);
        const father = parents.find(p => p.gender === 'male') ||
            parents.find(p => !p.gender || p.gender === 'unknown');
        const mother = parents.find(p => p.gender === 'female');
        const marriage = father && mother ? getMarriage(father.id, mother.id) : null;
        const unionId = `union-parents-${childPersonId}`;

        // Parent union sits directly above child at same X
        addUnionNode(unionId, childX, rowY, marriage?.status || null);

        // Connect parent union → child (straight down)
        addEdge(
            `edge-${unionId}-to-${childPersonId}`,
            unionId, 'bottom',
            childPersonId, 'top',
            { stroke: '#8e8e8e' }
        );

        // Father (left) or placeholder
        if (father) {
            addPersonNode(father, childX - dist, rowY, 'parent');
            addEdge(
                `edge-${father.id}-to-${unionId}`,
                father.id, 'right',
                unionId, 'left',
                { stroke: '#4a90d9' }
            );
        } else {
            const fatherId = `placeholder-father-${childPersonId}`;
            addPlaceholder(
                fatherId,
                `+ Add ${child.firstName}'s Father`,
                childX - dist, rowY,
                () => onPlaceholderClick('parent', childPersonId, 'male')
            );
            addEdge(
                `edge-${fatherId}-to-${unionId}`,
                fatherId, 'right',
                unionId, 'left',
                { stroke: '#555', strokeDasharray: '5 5' }
            );
        }

        // Mother (right) or placeholder
        if (mother) {
            addPersonNode(mother, childX + dist, rowY, 'parent');
            addEdge(
                `edge-${mother.id}-to-${unionId}`,
                mother.id, 'left',
                unionId, 'right',
                { stroke: '#d96a9e' }
            );
        } else {
            const motherId = `placeholder-mother-${childPersonId}`;
            addPlaceholder(
                motherId,
                `+ Add ${child.firstName}'s Mother`,
                childX + dist, rowY,
                () => onPlaceholderClick('parent', childPersonId, 'female')
            );
            addEdge(
                `edge-${motherId}-to-${unionId}`,
                motherId, 'left',
                unionId, 'right',
                { stroke: '#555', strokeDasharray: '5 5' }
            );
        }

        return {
            unionId,
            fatherId: father?.id || null,
            motherId: mother?.id || null,
            fatherX: childX - dist,
            motherX: childX + dist,
        };
    };

    // ── Recursive ancestor builder ──
    // Builds ancestors up to ancestorLimit generations
    // personX = X position of the person whose ancestors we're building
    // currentGen = generation of that person (0 = focus, -1 = parent, etc.)
    const buildAncestors = (personId, personX, personGen) => {
        const depth = personGen + n; // depth from highest gen (0 = highest)
        const parentGen = personGen - 1;
        const parentDepth = depth - 1;

        // Stop if we've reached the ancestor limit
        if (ancestorLimit !== null && ancestorLimit !== undefined && -parentGen > ancestorLimit) return;

        const dist = personToUnion(parentGen); // = W * 2^parentDepth
        const parentY = personGen * Y_GAP - Y_GAP;

        const result = buildParentRow(personId, personX, parentY, dist, parentGen);
        if (!result) return;

        // Recursively build ancestors for father and mother
        if (result.fatherId && personMap[result.fatherId]) {
            buildAncestors(result.fatherId, result.fatherX, parentGen);
        }
        if (result.motherId && personMap[result.motherId]) {
            buildAncestors(result.motherId, result.motherX, parentGen);
        }
    };

    // ── LAYOUT ──

    // ── Gen 0: Focus couple ──
    const focusUnionX = 0;
    const focusUnionY = 0;
    const dist0 = personToUnion(0); // = W * 2^n

    const focusSpouses = getSpouses(centrePersonId);
    const focusSpouse = focusSpouses[0] || null;

    const focusResult = buildCouple(
        centrePersonId,
        focusSpouse?.id || null,
        focusUnionX, focusUnionY,
        dist0,
        'centre', 'spouse'
    );

    const focusPersonX = focusResult.personCX;
    const focusSpouseX = focusResult.spouseCX;

    // ── Ancestors of focus person ──
    if (ancestorLimit === null || ancestorLimit === undefined || ancestorLimit >= 1) {
        buildAncestors(centrePersonId, focusPersonX, 0);
    }

    // ── Ancestors of spouse ──
    if (focusSpouse && (ancestorLimit === null || ancestorLimit === undefined || ancestorLimit >= 1)) {
        buildAncestors(focusSpouse.id, focusSpouseX, 0);
    }

    // ── Gen +1: Children ──
    if (descendantLimit === null || descendantLimit === undefined || descendantLimit >= 1) {
        const childY = Y_GAP;

        const focusChildren = getChildren(centrePersonId);
        const spouseChildren = focusSpouse ? getChildren(focusSpouse.id) : [];
        const sharedChildren = focusSpouse
            ? focusChildren.filter(c => spouseChildren.some(sc => sc.id === c.id))
            : focusChildren;
        const sortedChildren = sortByAge(sharedChildren);

        const childDist = W; // child gen uses W spacing (same as highest gen)
        const childSpacing = W * 3; // space between child union centres

        const totalChildWidth = sortedChildren.length > 0
            ? (sortedChildren.length - 1) * childSpacing
            : 0;
        const childStartX = focusUnionX - totalChildWidth / 2;

        sortedChildren.forEach((child, i) => {
            const childUnionX = childStartX + i * childSpacing;
            const childIsMale = isMaleOrUnknown(child);
            const childX = childIsMale ? childUnionX - childDist : childUnionX + childDist;
            const childSpouses = getSpouses(child.id);
            const childSpouse = childSpouses[0] || null;

            addPersonNode(child, childX, childY, 'child');

            // Connect focus union → child
            addEdge(
                `edge-${focusResult.unionId}-to-${child.id}`,
                focusResult.unionId, 'bottom',
                child.id, 'top',
                { stroke: '#8e8e8e' }
            );

            // Child's spouse
            if (childSpouse) {
                const childUnionId = `union-${[child.id, childSpouse.id].sort().join('-')}`;
                const childSpouseX = childIsMale ? childUnionX + childDist : childUnionX - childDist;
                const childMarriage = getMarriage(child.id, childSpouse.id);

                addUnionNode(childUnionId, childUnionX, childY, childMarriage?.status || null);
                addPersonNode(childSpouse, childSpouseX, childY, 'spouse');
                connectToUnion(child.id, childUnionId, childIsMale, { stroke: genderStroke(child) });
                connectToUnion(childSpouse.id, childUnionId, !childIsMale, { stroke: genderStroke(childSpouse) });
            }
        });

        // Son/Daughter placeholders
        if (sortedChildren.length === 0) {
            // No children yet — place symmetrically around focus union
            const sonX = focusUnionX - childSpacing / 2;
            const daughterX = focusUnionX + childSpacing / 2;

            addPlaceholder(
                'placeholder-son',
                `+ Add ${focus.firstName}'s Son`,
                sonX, childY,
                () => onPlaceholderClick('child', centrePersonId, 'male')
            );
            addEdge(
                'edge-placeholder-son',
                focusResult.unionId, 'bottom',
                'placeholder-son', 'top',
                { stroke: '#555', strokeDasharray: '5 5' }
            );

            addPlaceholder(
                'placeholder-daughter',
                `+ Add ${focus.firstName}'s Daughter`,
                daughterX, childY,
                () => onPlaceholderClick('child', centrePersonId, 'female')
            );
            addEdge(
                'edge-placeholder-daughter',
                focusResult.unionId, 'bottom',
                'placeholder-daughter', 'top',
                { stroke: '#555', strokeDasharray: '5 5' }
            );
        } else {
            // Children exist — place after last child
            const lastChildUnionX = childStartX + (sortedChildren.length - 1) * childSpacing;
            const sonX = lastChildUnionX + childSpacing;
            const daughterX = sonX + childSpacing;

            addPlaceholder(
                'placeholder-son',
                `+ Add ${focus.firstName}'s Son`,
                sonX, childY,
                () => onPlaceholderClick('child', centrePersonId, 'male')
            );
            addEdge(
                'edge-placeholder-son',
                focusResult.unionId, 'bottom',
                'placeholder-son', 'top',
                { stroke: '#555', strokeDasharray: '5 5' }
            );

            addPlaceholder(
                'placeholder-daughter',
                `+ Add ${focus.firstName}'s Daughter`,
                daughterX, childY,
                () => onPlaceholderClick('child', centrePersonId, 'female')
            );
            addEdge(
                'edge-placeholder-daughter',
                focusResult.unionId, 'bottom',
                'placeholder-daughter', 'top',
                { stroke: '#555', strokeDasharray: '5 5' }
            );
        }
    }

    // ── Siblings ──
    const siblings = getSiblings(centrePersonId);
    const sortedSiblings = sortByAge(siblings);

    const elderSiblings = sortedSiblings.filter(s =>
        !focus.bornAt || !s.bornAt || s.bornAt < focus.bornAt
    );
    const youngerSiblings = sortedSiblings.filter(s =>
        focus.bornAt && s.bornAt && s.bornAt >= focus.bornAt
    );

    const focusParentUnionId = `union-parents-${centrePersonId}`;
    const focusParentUnionExists = addedNodeIds.has(focusParentUnionId);

    const siblingSpacing = dist0 * 2 + W; // space between sibling union centres

    // Elder siblings — to the left
    [...elderSiblings].reverse().forEach((sibling, i) => {
        const siblingIsMale = isMaleOrUnknown(sibling);
        const siblingSpouse = getSpouses(sibling.id)[0] || null;
        const siblingUnionX = focusPersonX - (i + 1) * siblingSpacing;
        const siblingResult = buildCouple(
            sibling.id,
            siblingSpouse?.id || null,
            siblingUnionX, focusUnionY,
            dist0,
            'sibling', 'spouse'
        );

        if (focusParentUnionExists) {
            addEdge(
                `edge-${focusParentUnionId}-to-${sibling.id}`,
                focusParentUnionId, 'bottom',
                sibling.id, 'top',
                { stroke: '#8e8e8e' }
            );
        }
    });

    // Younger siblings — to the right
    youngerSiblings.forEach((sibling, i) => {
        const siblingIsMale = isMaleOrUnknown(sibling);
        const siblingSpouse = getSpouses(sibling.id)[0] || null;
        const siblingUnionX = focusSpouseX + (i + 1) * siblingSpacing;
        const siblingResult = buildCouple(
            sibling.id,
            siblingSpouse?.id || null,
            siblingUnionX, focusUnionY,
            dist0,
            'sibling', 'spouse'
        );

        if (focusParentUnionExists) {
            addEdge(
                `edge-${focusParentUnionId}-to-${sibling.id}`,
                focusParentUnionId, 'bottom',
                sibling.id, 'top',
                { stroke: '#8e8e8e' }
            );
        }
    });

    return { nodes, edges };
}

function FamilyTree({ people, relationships, marriages }) {
    const [centrePersonId, setCentrePersonId] = useState(
        people && people.length > 0 ? people[0].id : null
    );
    const [addingFrom, setAddingFrom] = useState(null);
    const [editingPerson, setEditingPerson] = useState(null);
    const [editingMarriage, setEditingMarriage] = useState(null);
    const [viewingPerson, setViewingPerson] = useState(null);
    const [ancestorLimit, setAncestorLimit] = useState(2);
    const [descendantLimit, setDescendantLimit] = useState(2);


    const buildCurrentTree = useCallback((centreId) => {
        return buildTree(
            centreId,
            people,
            relationships,
            marriages,
            (relationshipType, relatedPersonId, gender) => {
                setAddingFrom({ relationshipType, relatedPersonId, gender });
            },
            ancestorLimit,
            descendantLimit
        );
    }, [people, relationships, marriages, ancestorLimit, descendantLimit]);

    const { nodes: initialNodes, edges: initialEdges } = centrePersonId
        ? buildCurrentTree(centrePersonId)
        : { nodes: [], edges: [] };

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    useEffect(() => {
        if (!centrePersonId) return;
        const { nodes: newNodes, edges: newEdges } = buildCurrentTree(centrePersonId);
        setNodes(newNodes);
        setEdges(newEdges);
    }, [people, relationships, marriages, ancestorLimit, descendantLimit]);

    const handleAddSave = () => {
        setAddingFrom(null);
        const { nodes: newNodes, edges: newEdges } = buildCurrentTree(centrePersonId);
        setNodes(newNodes);
        setEdges(newEdges);
    };

    const handleEditSave = () => {
        setEditingPerson(null);
        const { nodes: newNodes, edges: newEdges } = buildCurrentTree(centrePersonId);
        setNodes(newNodes);
        setEdges(newEdges);
    };

    const onNodeDoubleClick = useCallback((event, node) => {
        if (node.type === 'placeholderNode') return;
        if (node.type === 'unionNode') return;
        const { nodes: newNodes, edges: newEdges } = buildCurrentTree(node.id);
        setNodes(newNodes);
        setEdges(newEdges);
        setCentrePersonId(node.id);
    }, [buildCurrentTree, setNodes, setEdges, setCentrePersonId]);

    const handleCentreChange = (e) => {
        const { nodes: newNodes, edges: newEdges } = buildCurrentTree(e.target.value);
        setNodes(newNodes);
        setEdges(newEdges);
        setCentrePersonId(e.target.value);
    };

    const onEditRef = useRef(null);
    onEditRef.current = (personId) => {
        const person = people.find(p => p.id === personId);
        if (person) setEditingPerson(person);
    };

    const onViewDetailsRef = useRef(null);
    onViewDetailsRef.current = (personId) => {
        const person = people.find(p => p.id === personId);
        if (person) setViewingPerson(person);
    };

    const onMarriageEditRef = useRef(null);
    onMarriageEditRef.current = (marriageId) => {
        const marriage = marriages.find(m => m.id === marriageId);
        if (marriage) setEditingMarriage(marriage);
    };

    const nodeTypes = useMemo(() => ({
        personNode: (props) => (
            <PersonNode
                {...props}
                onEditPerson={(personId) => onEditRef.current(personId)}
                onViewDetails={(personId) => onViewDetailsRef.current(personId)}
            />
        ),
        placeholderNode: PlaceholderNode,
        unionNode: UnionNode,
    }), []);


    if (!people || people.length === 0) {
        return (
            <div className="tree-empty">
                <p>No family members yet. Add some people first!</p>
            </div>
        );
    }

    if (addingFrom) {
        return (
            <AddPersonFromTree
                relationshipType={addingFrom.relationshipType}
                relatedPersonId={addingFrom.relatedPersonId}
                gender={addingFrom.gender}
                onSave={handleAddSave}
                onCancel={() => setAddingFrom(null)}
            />
        );
    }

    if (editingPerson) {
        return (
            <PersonForm
                person={editingPerson}
                onSave={handleEditSave}
                onCancel={() => setEditingPerson(null)}
            />
        );
    }

    if (editingMarriage) {
        return (
            <MarriageModal
                person={people.find(p => p.id === editingMarriage.person1Id)}
                editingMarriage={editingMarriage}
                onClose={() => {
                    setEditingMarriage(null);
                    const { nodes: newNodes, edges: newEdges } = buildCurrentTree(centrePersonId);
                    setNodes(newNodes);
                    setEdges(newEdges);
                }}
            />
        );
    }

    if (viewingPerson) {
        return (
            <PersonDetailModal
                person={viewingPerson}
                onClose={() => setViewingPerson(null)}
            />
        );
    }

    return (
        <div className="tree-container">
            <div className="tree-toolbar">
                <label>Centre on: </label>
                <select value={centrePersonId || ''} onChange={handleCentreChange}>
                    {people.map((p) => (
                        <option key={p.id} value={p.id}>
                            {p.firstName} {p.lastName}
                        </option>
                    ))}
                </select>

                <label style={{ marginLeft: '16px' }}>Ancestors: </label>
                <input
                    type="number" min="0" max="10"
                    value={ancestorLimit === null ? '' : ancestorLimit}
                    onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setAncestorLimit(!isNaN(val) && val >= 0 ? val : null);
                    }}
                    style={{ width: '50px', padding: '4px 8px', border: '1px solid var(--border-input)', borderRadius: '4px', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '14px' }}
                />

                <label style={{ marginLeft: '12px' }}>Descendants: </label>
                <input
                    type="number" min="0" max="10"
                    value={descendantLimit === null ? '' : descendantLimit}
                    onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setDescendantLimit(!isNaN(val) && val >= 0 ? val : null);
                    }}
                    style={{ width: '50px', padding: '4px 8px', border: '1px solid var(--border-input)', borderRadius: '4px', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '14px' }}
                />

                <button
                    onClick={() => { setAncestorLimit(null); setDescendantLimit(null); }}
                    style={{
                        marginLeft: '8px', padding: '4px 12px',
                        background: ancestorLimit === null && descendantLimit === null ? '#4a90d9' : 'var(--bg-elevated)',
                        color: ancestorLimit === null && descendantLimit === null ? 'white' : 'var(--text-primary)',
                        border: '1px solid var(--border-input)', borderRadius: '4px', cursor: 'pointer', fontSize: '14px',
                    }}
                >
                    All
                </button>
            </div>

            <div style={{ width: '100%', height: '80vh' }}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onNodeDoubleClick={onNodeDoubleClick}
                    nodeTypes={nodeTypes}
                    nodesDraggable={false}
                    zoomOnDoubleClick={false}
                    fitView
                >
                    <Background />
                    <Controls />
                </ReactFlow>
            </div>

            <div className="tree-legend">
                <span className="legend-item" style={{ color: '#4a90d9' }}>■ Male</span>
                <span className="legend-item" style={{ color: '#d96a9e' }}>■ Female</span>
                <span className="legend-item" style={{ color: '#8e8e8e' }}>■ Unknown</span>
                <span className="legend-item" style={{ color: '#555', marginLeft: '20px' }}>╌ Placeholder</span>
            </div>
        </div>
    );
}

const enhance = withObservables([], () => ({
    people: database.collections.get('people').query(),
    relationships: database.collections.get('relationships').query(),
    marriages: database.collections.get('marriages').query(),
}));

const EnhancedFamilyTree = enhance(FamilyTree);
export default EnhancedFamilyTree;