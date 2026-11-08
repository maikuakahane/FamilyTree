import { Model } from '@nozbe/watermelondb';
import { field, text, relation } from '@nozbe/watermelondb/decorators';

export default class CitizenshipRecord extends Model {
    static table = 'citizenship_records';

    // Person's details
    @text('first_name') firstName;
    @text('last_name') lastName;
    @field('birth_day') birthDay;
    @field('birth_month') birthMonth;
    @field('birth_year') birthYear;
    @text('birth_town') birthTown;
    @text('birth_county') birthCounty;
    @text('birth_country') birthCountry;
    @text('address_street') addressStreet;
    @text('address_town') addressTown;
    @text('address_county') addressCounty;
    @text('address_country') addressCountry;

    // Citizenship details
    @text('citizenship_country') citizenshipCountry;
    @text('citizenship_acquisition_method') citizenshipAcquisitionMethod;
    @field('citizenship_acquisition_day') citizenshipAcquisitionDay;
    @field('citizenship_acquisition_month') citizenshipAcquisitionMonth;
    @field('citizenship_acquisition_year') citizenshipAcquisitionYear;

    // IDs
    @field('person_id') personId;
    @field('citizenship_id') citizenshipId;


}