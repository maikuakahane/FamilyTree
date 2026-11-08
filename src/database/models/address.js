import { Model } from '@nozbe/watermelondb';
import { field, text, relation } from '@nozbe/watermelondb/decorators';

export default class Address extends Model {
    static table = 'addresses';

    @field('person_id') personId;
    @text('address_street') addressStreet;
    @text('address_town') addressTown;
    @text('address_country') addressCountry;
    @text('address_code') addressCode;
    @field('moved_in_day') movedInDay;
    @field('moved_in_month') movedInMonth;
    @field('moved_in_year') movedInYear;
    @field('moved_out_day') movedOutDay;
    @field('moved_out_month') movedOutMonth;
    @field('moved_out_year') movedOutYear;

    @relation('people', 'person_id') person;
}