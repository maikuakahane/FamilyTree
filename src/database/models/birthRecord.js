import { Model } from '@nozbe/watermelondb';
import { field, text, relation } from '@nozbe/watermelondb/decorators';

export default class BirthRecord extends Model {
    static table = 'birth_records';

    static associations = {
        person: { type: 'belongs_to', key: 'person_id' },
    };

    // Person's details
    @field('first_name') firstName;
    @field('last_name') lastName;
    @field('birth_day') birthDay;
    @field('birth_month') birthMonth;
    @field('birth_year') birthYear;
    @field('gender') gender;
    @text('birth_town') birthTown;
    @text('birth_county') birthCounty;
    @text('birth_country') birthCountry;

    // Mother's details
    @field('mother_first_name') motherFirstName;
    @field('mother_last_name') motherLastName;
    @field('mother_birth_name') motherBirthName;
    @field('mother_birth_day') motherBirthDay;
    @field('mother_birth_month') motherBirthMonth;
    @field('mother_birth_year') motherBirthYear;
    @text('mother_birth_town') motherBirthTown;
    @text('mother_birth_county') motherBirthCounty;
    @text('mother_birth_country') motherBirthCountry;

    // Father's details
    @field('father_first_name') fatherFirstName;
    @field('father_last_name') fatherLastName;
    @field('father_birth_name') fatherBirthName;
    @field('father_birth_day') fatherBirthDay;
    @field('father_birth_month') fatherBirthMonth;
    @field('father_birth_year') fatherBirthYear;
    @text('father_birth_town') fatherBirthTown;
    @text('father_birth_county') fatherBirthCounty;
    @text('father_birth_country') fatherBirthCountry;

    // Birth and baptism details
    @field('baptism_day') baptismDay;
    @field('baptism_month') baptismMonth;
    @field('baptism_year') baptismYear;

    // Birth registration details
    @text('birth_registry_office') birthRegistryOffice;
    @text('birth_registry_book') birthRegistryBook;
    @field('birth_registry_volume') birthRegistryVolume;
    @field('birth_registry_year') birthRegistryYear;
    @field('birth_registry_page') birthRegistryPage;
    @field('birth_registry_entry') birthRegistryEntry;
    

    // Religion
    @text('birth_religion') birthReligion;



    //IDs
    @field('person_idR') personIdR;
    @field('mother_idR') motherIdR;
    @field('father_idR') fatherIdR;
    @field('birth_record_id') birthRecordId;


}