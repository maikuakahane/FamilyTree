import { Model } from '@nozbe/watermelondb';
import { field, text, relation } from '@nozbe/watermelondb/decorators';

export default class Citizenship extends Model {
    static table = 'citizenships';

    static associations = {
        person: { type: 'belongs_to', key: 'person_id' },
    };

    @field('person_id') personId;
    @text('birth_citizenship') birthCitizenship;
    @text('naturalised_citizenship') naturalisedCitizenship;

    @relation('people', 'person_id') person;
}