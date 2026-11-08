import { Model } from '@nozbe/watermelondb';
import { field, relation } from '@nozbe/watermelondb/decorators';

export default class Relationship extends Model {
    static table = 'relationships';

    static associations = {
        person1: { type: 'belongs_to', key: 'person1_id' },
        person2: { type: 'belongs_to', key: 'person2_id' },
    };

    @field('person1_id') person1Id;
    @field('person2_id') person2Id;
    @field('relationship_type') relationshipType;

    @relation('people', 'person1_id') person1;
    @relation('people', 'person2_id') person2;
}