import { Model } from '@nozbe/watermelondb';
import { field, text, relation } from '@nozbe/watermelondb/decorators';

export default class DeathRecord extends Model {
    static table = 'death_records';

    // Person's details
    @field('first_name') firstName;
    @field('last_name') lastName;
    @field('birth_name') birthName;
    @field('birth_day') birthDay;
    @field('birth_month') birthMonth;
    @field('birth_year') birthYear;
    @text('birth_town') birthTown;
    @text('birth_county') birthCounty;
    @text('birth_country') birthCountry;
    @field('gender') gender;
    @field('death_day') deathDay;
    @field('death_month') deathMonth;
    @field('death_year') deathYear;
    @text('death_town') deathTown;
    @text('death_county') deathCounty;
    @text('death_country') deathCountry;
    @text('death_reason') deathReason;
    @text('address_street') addressStreet;
    @text('address_town') addressTown;
    @text('address_county') addressCounty;
    @text('address_country') addressCountry;

    // Spouse's details
    @field('spouse_first_name') spouseFirstName;
    @field('spouse_last_name') spouseLastName;
    @field('spouse_birth_name') spouseBirthName;

    // Death registration details
    @text('death_registry_office') deathRegistryOffice;
    @text('death_registry_book') deathRegistryBook;
    @field('death_registry_volume') deathRegistryVolume;
    @field('death_registry_year') deathRegistryYear;
    @field('death_registry_page') deathRegistryPage;
    @field('death_registry_entry') deathRegistryEntry;

    //Religion
    @text('death_religion') deathReligion;

    //IDs
    @field('person_id') personId;
    @field('death_record_id') deathRecordId;


}