import { Model } from '@nozbe/watermelondb';
import { field, text } from '@nozbe/watermelondb/decorators';

export default class RelationshipRecord extends Model {
    static table = 'relationship_records';

    //Relationship type
    @field('relationship_type') relationshipType;
    //Relationship details
    @field('relationship_day') relationshipDay;
    @field('relationship_month') relationshipMonth;
    @field('relationship_year') relationshipYear;
    @text('relationship_town') relationshipPlace;
    @text('relationship_county') relationshipCounty;
    @text('relationship_country') relationshipCountry;
    
    //Partner 1 details
    @text('p1_first_name') p1FirstName;
    @text('p1_last_name') p1LastName;
    @text('p1_birth_name') p1BirthName;
    @field('p1_birth_day') p1BirthDay;
    @field('p1_birth_month') p1BirthMonth;
    @field('p1_birth_year') p1BirthYear;
    @text('p1_birth_town') p1BirthTown;
    @text('p1_birth_county') p1BirthCounty;
    @text('p1_birth_country') p1BirthCountry;
    @text('p1_relationship_status') p1RelationshipStatus;

    //Partner 2 details
    @text('p2_first_name') p2FirstName;
    @text('p2_last_name') p2LastName;
    @text('p2_birth_name') p2BirthName;
    @field('p2_birth_day') p2BirthDay;
    @field('p2_birth_month') p2BirthMonth;
    @field('p2_birth_year') p2BirthYear;
    @text('p2_birth_town') p2BirthTown;
    @text('p2_birth_county') p2BirthCounty;
    @text('p2_birth_country') p2BirthCountry;
    @text('p2_relationship_status') p2RelationshipStatus;

    //Partner 1 parent's details
    @text('p1_mother_first_name') p1motherFirstName;
    @text('p1_mother_last_name') p1motherLastName;
    @text('p1_mother_birth_name') p1motherBirthName;
    @text('p1_father_first_name') p1fatherFirstName;
    @text('p1_father_last_name') p1fatherLastName;
    @text('p1_father_birth_name') p1fatherBirthName;

    //Partner 2 parent's details
    @text('p2_mother_first_name') p2motherFirstName;
    @text('p2_mother_last_name') p2motherLastName;
    @text('p2_mother_birth_name') p2motherBirthName;
    @text('p2_father_first_name') p2fatherFirstName;
    @text('p2_father_last_name') p2fatherLastName;
    @text('p2_father_birth_name') p2fatherBirthName;
    
    // Marriage registration details
    @text('marriage_registry_office') marriageRegistryOffice;
    @text('marriage_registry_book') marriageRegistryBook;
    @field('marriage_registry_volume') marriageRegistryVolume;
    @field('marriage_registry_year') marriageRegistryYear;
    @field('marriage_registry_page') marriageRegistryPage;
    @field('marriage_registry_entry') marriageRegistryEntry;

    //Divorce details
    @field('divorce_day') divorceDay;
    @field('divorce_month') divorceMonth;
    @field('divorce_year') divorceYear;
    @text('divorce_town') divorceTown;
    @text('divorce_county') divorceCounty;
    @text('divorce_country') divorceCountry;

    //Religion
    @text('relationship_religion') relationshipReligion;

    //IDs
    @field('person1_id') person1Id;
    @field('person2_id') person2Id;
    @field('relationship_id') relationshipId;

}