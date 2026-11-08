import { Model } from '@nozbe/watermelondb';
import { field, text, relation } from '@nozbe/watermelondb/decorators';

export default class DeathRecord extends Model {
    static table = 'death_records';

    static associations = {
        person: { type: 'belongs_to', key: 'person_id' },
    };

    @field('person_id') personId;
    @field('died_at') diedAt;
    @text('death_town') deathTown;
    @text('death_country') deathCountry;
    @text('death_reason') deathReason;
    @text('death_registry_office') deathRegistryOffice;
    @text('death_registry_book') deathRegistryBook;
    @text('death_religion') deathReligion;


    @relation('people', 'person_id') person;
}