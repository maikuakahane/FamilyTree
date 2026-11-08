import { Model } from '@nozbe/watermelondb';
import { field, text, relation } from '@nozbe/watermelondb/decorators';

export default class Marriage extends Model {
    static table = 'marriages';

    static associations = {
        person1: { type: 'belongs_to', key: 'person1_id' },
        person2: { type: 'belongs_to', key: 'person2_id' },
    };

    @field('person1_id') person1Id;
    @field('person2_id') person2Id;
    @field('status') status;
    @field('married_at') marriedAt;
    @text('marriage_town') marriageTown;
    @text('marriage_country') marriageCountry;
    @field('divorced_at') divorcedAt;

    @relation('people', 'person1_id') person1;
    @relation('people', 'person2_id') person2;
}