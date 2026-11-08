import { Model } from '@nozbe/watermelondb';
import { field, text, relation } from '@nozbe/watermelondb/decorators';

export default class MarriageRecord extends Model {
    static table = 'marriage_records';

    static associations = {
        marriage: { type: 'belongs_to', key: 'marriage_id' },
        person1: { type: 'belongs_to', key: 'person1_id' },
        person2: { type: 'belongs_to', key: 'person2_id' },
    };

    @field('person1_id') person1Id;
    @field('person2_id') person2Id;
    @field('marriage_id') marriageId;

    @text('marriage_registry_office') marriageRegistryOffice;
    @text('marriage_registry_book') marriageRegistryBook;
    @text('marriage_religion') marriageReligion;


    @relation('marriages', 'marriage_id') marriage;
    @relation('people', 'person1_id') person1;
    @relation('people', 'person2_id') person2;
}