import { Model } from '@nozbe/watermelondb';
import { field, text, relation } from '@nozbe/watermelondb/decorators';

export default class CitizenshipRecord extends Model {
    static table = 'citizenship_records';

    static associations = {
        person: { type: 'belongs_to', key: 'person_id' },
    };

    @field('person_id') personId;
    @field('naturalised_at') naturalisedAt;
    @text('naturalised_type') naturalisedType;
    @field('birth_citizenship_lost') birthCitizenshipLost;

    @relation('people', 'person_id') person;
}