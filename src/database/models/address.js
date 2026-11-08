import { Model } from '@nozbe/watermelondb';
import { field, text, relation } from '@nozbe/watermelondb/decorators';

export default class Address extends Model {
    static table = 'addresses';

    static associations = {
        person: { type: 'belongs_to', key: 'person_id' },
    };

    @field('person_id') personId;
    @text('address_street') addressStreet;
    @text('address_town') addressTown;
    @text('address_country') addressCountry;
    @text('address_code') addressCode;
    @field('moved_in_at') movedInAt;
    @field('moved_out_at') movedOutAt;

    @relation('people', 'person_id') person;
}