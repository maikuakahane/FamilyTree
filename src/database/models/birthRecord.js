import { Model } from '@nozbe/watermelondb';
import { field, text, relation } from '@nozbe/watermelondb/decorators';

export default class BirthRecord extends Model {
    static table = 'birth_records';

    static associations = {
        person: { type: 'belongs_to', key: 'person_id' },
    };

    @field('person_id') personId;
    @field('born_at') bornAt;
    @text('birth_town') birthTown;
    @text('birth_country') birthCountry;
    @field('baptised_at') baptisedAt;
    @text('birth_registry_office') birthRegistryOffice;
    @text('birth_registry_book') birthRegistryBook;
    @text('birth_religion') birthReligion;

    @relation('people', 'person_id') person;
}