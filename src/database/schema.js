import { appSchema, tableSchema } from '@nozbe/watermelondb';

export default appSchema({
    version: 1,
    tables: [
        tableSchema({
            name: 'people',
            columns: [
                // General
                { name: 'first_name_p', type: 'string' },
                { name: 'last_name_p', type: 'string' },
                { name: 'birth_name_p', type: 'string', isOptional: true },
                { name: 'gender_p', type: 'string', isOptional: true },
                // IDs
                { name: 'person_id', type: 'string', isIndexed: true },
                { name: 'generation', type: 'string', isOptional: true },
                // Linked event IDs
                { name: 'birth_idR', type: 'string', isOptional: true },
                { name: 'relationship_idsR', type: 'string', isOptional: true },
                { name: 'death_idR', type: 'string', isOptional: true },
                { name: 'citizenship_idsR', type: 'string', isOptional: true },
                { name: 'contact_idR', type: 'string', isOptional: true },
                { name: 'address_idsR', type: 'string', isOptional: true },
                // Family tree
                { name: 'is_owner', type: 'boolean', isOptional: true },
            ],
        }),

        tableSchema({
            name: 'birth_records',
            columns: [
                // Person's details
                { name: 'first_name', type: 'string', isOptional: true },
                { name: 'last_name', type: 'string', isOptional: true },
                { name: 'birth_day', type: 'number', isOptional: true },
                { name: 'birth_month', type: 'number', isOptional: true },
                { name: 'birth_year', type: 'number', isOptional: true },
                { name: 'gender', type: 'string', isOptional: true },
                { name: 'birth_town', type: 'string', isOptional: true },
                { name: 'birth_county', type: 'string', isOptional: true },
                { name: 'birth_country', type: 'string', isOptional: true },
                // Mother's details
                { name: 'mother_first_name', type: 'string', isOptional: true },
                { name: 'mother_last_name', type: 'string', isOptional: true },
                { name: 'mother_birth_name', type: 'string', isOptional: true },
                { name: 'mother_birth_day', type: 'number', isOptional: true },
                { name: 'mother_birth_month', type: 'number', isOptional: true },
                { name: 'mother_birth_year', type: 'number', isOptional: true },
                { name: 'mother_birth_town', type: 'string', isOptional: true },
                { name: 'mother_birth_county', type: 'string', isOptional: true },
                { name: 'mother_birth_country', type: 'string', isOptional: true },
                // Father's details
                { name: 'father_first_name', type: 'string', isOptional: true },
                { name: 'father_last_name', type: 'string', isOptional: true },
                { name: 'father_birth_name', type: 'string', isOptional: true },
                { name: 'father_birth_day', type: 'number', isOptional: true },
                { name: 'father_birth_month', type: 'number', isOptional: true },
                { name: 'father_birth_year', type: 'number', isOptional: true },
                { name: 'father_birth_town', type: 'string', isOptional: true },
                { name: 'father_birth_county', type: 'string', isOptional: true },
                { name: 'father_birth_country', type: 'string', isOptional: true },
                // Birth and baptism details
                { name: 'baptism_day', type: 'number', isOptional: true },
                { name: 'baptism_month', type: 'number', isOptional: true },
                { name: 'baptism_year', type: 'number', isOptional: true },
                //Birth registration details
                { name: 'birth_registry_office', type: 'string', isOptional: true },
                { name: 'birth_registry_book', type: 'string', isOptional: true },
                { name: 'birth_registry_volume', type: 'string', isOptional: true },
                { name: 'birth_registry_year', type: 'string', isOptional: true },
                { name: 'birth_registry_page', type: 'string', isOptional: true },
                { name: 'birth_registry_entry', type: 'string', isOptional: true },
                //Religion
                { name: 'birth_religion', type: 'string', isOptional: true },
                //IDs
                { name: 'person_idR', type: 'string', isOptional: true, isIndexed: true },
                { name: 'mother_idR', type: 'string', isOptional: true, isIndexed: true },
                { name: 'father_idR', type: 'string', isOptional: true, isIndexed: true },
                { name: 'birth_record_id', type: 'string', isIndexed: true },
    
                
            ],
        }),

        tableSchema({
            name: 'relationship_records',
            columns: [
                // Relationship type
                { name: 'relationship_type', type: 'string' },
                //Relationship details
                { name: 'relationship_day', type: 'number', isOptional: true },
                { name: 'relationship_month', type: 'number', isOptional: true },
                { name: 'relationship_year', type: 'number', isOptional: true },
                { name: 'relationship_town', type: 'string', isOptional: true },
                { name: 'relationship_county', type: 'string', isOptional: true },
                { name: 'relationship_country', type: 'string', isOptional: true },
                // Partner 1 details
                { name: 'p1_first_name', type: 'string', isOptional: true },
                { name: 'p1_last_name', type: 'string', isOptional: true },
                { name: 'p1_birth_name', type: 'string', isOptional: true },
                { name: 'p1_birth_day', type: 'number', isOptional: true },
                { name: 'p1_birth_month', type: 'number', isOptional: true },
                { name: 'p1_birth_year', type: 'number', isOptional: true },
                { name: 'p1_birth_town', type: 'string', isOptional: true },
                { name: 'p1_birth_county', type: 'string', isOptional: true },
                { name: 'p1_birth_country', type: 'string', isOptional: true },
                { name: 'p1_relationship_status', type: 'string', isOptional: true },
                // Partner 2 details
                { name: 'p2_first_name', type: 'string', isOptional: true },
                { name: 'p2_last_name', type: 'string', isOptional: true },
                { name: 'p2_birth_name', type: 'string', isOptional: true },
                { name: 'p2_birth_day', type: 'number', isOptional: true },
                { name: 'p2_birth_month', type: 'number', isOptional: true },
                { name: 'p2_birth_year', type: 'number', isOptional: true },
                { name: 'p2_birth_town', type: 'string', isOptional: true },
                { name: 'p2_birth_county', type: 'string', isOptional: true },
                { name: 'p2_birth_country', type: 'string', isOptional: true },
                { name: 'p2_relationship_status', type: 'string', isOptional: true },
                // Partner 1 parent's details
                { name: 'p1_mother_first_name', type: 'string', isOptional: true },
                { name: 'p1_mother_last_name', type: 'string', isOptional: true },
                { name: 'p1_mother_birth_name', type: 'string', isOptional: true },
                { name: 'p1_father_first_name', type: 'string', isOptional: true },
                { name: 'p1_father_last_name', type: 'string', isOptional: true },
                { name: 'p1_father_birth_name', type: 'string', isOptional: true },
                // Partner 2 parent's details
                { name: 'p2_mother_first_name', type: 'string', isOptional: true },
                { name: 'p2_mother_last_name', type: 'string', isOptional: true },
                { name: 'p2_mother_birth_name', type: 'string', isOptional: true },
                { name: 'p2_father_first_name', type: 'string', isOptional: true },
                { name: 'p2_father_last_name', type: 'string', isOptional: true },
                { name: 'p2_father_birth_name', type: 'string', isOptional: true },
                // Marriage registration details
                { name: 'marriage_registry_office', type: 'string', isOptional: true },
                { name: 'marriage_registry_book', type: 'string', isOptional: true },
                { name: 'marriage_registry_volume', type: 'string', isOptional: true },
                { name: 'marriage_registry_year', type: 'string', isOptional: true },
                { name: 'marriage_registry_page', type: 'string', isOptional: true },
                { name: 'marriage_registry_entry', type: 'string', isOptional: true },
                //Divorce details
                { name: 'divorce_day', type: 'number', isOptional: true },
                { name: 'divorce_month', type: 'number', isOptional: true },
                { name: 'divorce_year', type: 'number', isOptional: true },
                { name: 'divorce_town', type: 'string', isOptional: true },
                { name: 'divorce_county', type: 'string', isOptional: true },
                { name: 'divorce_country', type: 'string', isOptional: true },
                //Religion 
                { name: 'relationship_religion', type: 'string', isOptional: true },
                //IDs
                { name: 'person1_id', type: 'string', isIndexed: true, isOptional: true },
                { name: 'person2_id', type: 'string', isIndexed: true, isOptional: true },
                { name: 'relationship_id', type: 'string', isIndexed: true },
            ],
        }),

        tableSchema({
            name: 'death_records',
            columns: [
                // Person's details
                { name: 'first_name', type: 'string', isOptional: true },
                { name: 'last_name', type: 'string', isOptional: true },
                { name: 'birth_name', type: 'string', isOptional: true },
                { name: 'birth_day', type: 'number', isOptional: true },
                { name: 'birth_month', type: 'number', isOptional: true },
                { name: 'birth_year', type: 'number', isOptional: true },
                { name: 'birth_town', type: 'string', isOptional: true },
                { name: 'birth_county', type: 'string', isOptional: true },
                { name: 'birth_country', type: 'string', isOptional: true },
                { name: 'gender', type: 'string', isOptional: true },
                { name: 'death_day', type: 'number', isOptional: true },
                { name: 'death_month', type: 'number', isOptional: true },
                { name: 'death_year', type: 'number', isOptional: true },
                { name: 'death_town', type: 'string', isOptional: true },
                { name: 'death_county', type: 'string', isOptional: true },
                { name: 'death_country', type: 'string', isOptional: true },
                { name: 'death_reason', type: 'string', isOptional: true },
                { name: 'address_street', type: 'string', isOptional: true },
                { name: 'address_town', type: 'string', isOptional: true },
                { name: 'address_county', type: 'string', isOptional: true },
                { name: 'address_country', type: 'string', isOptional: true },
                //Spouse's details
                { name: 'spouse_first_name', type: 'string', isOptional: true },
                { name: 'spouse_last_name', type: 'string', isOptional: true },
                { name: 'spouse_birth_name', type: 'string', isOptional: true },
                // Death registration details
                { name: 'death_registry_office', type: 'string', isOptional: true },
                { name: 'death_registry_book', type: 'string', isOptional: true },
                { name: 'death_registry_volume', type: 'string', isOptional: true },
                { name: 'death_registry_year', type: 'string', isOptional: true },
                { name: 'death_registry_page', type: 'string', isOptional: true },
                { name: 'death_registry_entry', type: 'string', isOptional: true },
                //Religion
                { name: 'death_religion', type: 'string', isOptional: true },
                //IDs
                { name: 'person_id', type: 'string', isIndexed: true },
                { name: 'death_record_id', type: 'string', isIndexed: true },
            ],
        }),

        tableSchema({
            name: 'citizenship_records',
            columns: [
                // Person's details
                { name: 'first_name', type: 'string', isOptional: true },
                { name: 'last_name', type: 'string', isOptional: true },
                { name: 'birth_day', type: 'number', isOptional: true },
                { name: 'birth_month', type: 'number', isOptional: true },
                { name: 'birth_year', type: 'number', isOptional: true },
                { name: 'birth_town', type: 'string', isOptional: true },
                { name: 'birth_county', type: 'string', isOptional: true },
                { name: 'birth_country', type: 'string', isOptional: true },
                { name: 'address_street', type: 'string', isOptional: true },
                { name: 'address_town', type: 'string', isOptional: true },
                { name: 'address_county', type: 'string', isOptional: true },
                { name: 'address_country', type: 'string', isOptional: true },
                // Citizenship details
                { name: 'citizenship_country', type: 'string', isOptional: true },
                { name: 'citizenship_acquisition_method', type: 'string', isOptional: true },
                { name: 'citizenship_acquisition_day', type: 'number', isOptional: true },
                { name: 'citizenship_acquisition_month', type: 'number', isOptional: true },
                { name: 'citizenship_acquisition_year', type: 'number', isOptional: true },
                // IDs
                { name: 'person_id', type: 'string', isIndexed: true },
                { name: 'citizenship_id', type: 'string', isIndexed: true },
            ],
        }),

        tableSchema({
            name: 'addresses',
            columns: [
                { name: 'person_id', type: 'string', isIndexed: true },
                { name: 'address_street', type: 'string', isOptional: true },
                { name: 'address_town', type: 'string', isOptional: true },
                { name: 'address_country', type: 'string', isOptional: true },
                { name: 'address_code', type: 'string', isOptional: true },
                { name: 'moved_in_day', type: 'number', isOptional: true },
                { name: 'moved_in_month', type: 'number', isOptional: true },
                { name: 'moved_in_year', type: 'number', isOptional: true },
                { name: 'moved_out_day', type: 'number', isOptional: true },
                { name: 'moved_out_month', type: 'number', isOptional: true },
                { name: 'moved_out_year', type: 'number', isOptional: true },
            ],
        }),

        tableSchema({
            name: 'counters',
            columns: [
                { name: 'key', type: 'string', isIndexed: true },   // 'person', 'birth', 'death',
                { name: 'value', type: 'number' },                  // last number handed out
            ],
        }),

        

       
    ],
});