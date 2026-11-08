import { appSchema, tableSchema } from '@nozbe/watermelondb';

export default appSchema({
    version: 4,
    tables: [
        tableSchema({
            name: 'people',
            columns: [
                // General
                { name: 'first_name', type: 'string' },
                { name: 'last_name', type: 'string' },
                { name: 'birth_name', type: 'string', isOptional: true },
                { name: 'gender', type: 'string', isOptional: true },
                { name: 'email', type: 'string', isOptional: true },
                // Birth summary (full details in birth_records)
                { name: 'born_at', type: 'number', isOptional: true },
                { name: 'birth_town', type: 'string', isOptional: true },
                { name: 'birth_country', type: 'string', isOptional: true },
                // Death summary (full details in death_records)
                { name: 'deceased', type: 'boolean', isOptional: true },
                { name: 'died_at', type: 'number', isOptional: true },
                { name: 'death_town', type: 'string', isOptional: true },
                { name: 'death_country', type: 'string', isOptional: true },
                // Research tracking
                { name: 'birth_certificate_obtained', type: 'boolean', isOptional: true },
                { name: 'marriage_certificate_obtained', type: 'boolean', isOptional: true },
                { name: 'death_certificate_obtained', type: 'boolean', isOptional: true },
                // Family tree
                { name: 'is_owner', type: 'boolean', isOptional: true },
            ],
        }),

        tableSchema({
            name: 'relationships',
            columns: [
                { name: 'person1_id', type: 'string', isIndexed: true },
                { name: 'person2_id', type: 'string', isIndexed: true },
                { name: 'relationship_type', type: 'string' },
            ],
        }),

        tableSchema({
            name: 'marriages',
            columns: [
                { name: 'person1_id', type: 'string', isIndexed: true },
                { name: 'person2_id', type: 'string', isIndexed: true },
                { name: 'status', type: 'string' },
                { name: 'married_at', type: 'number', isOptional: true },
                { name: 'marriage_town', type: 'string', isOptional: true },
                { name: 'marriage_country', type: 'string', isOptional: true },
                { name: 'divorced_at', type: 'number', isOptional: true },
            ],
        }),

        tableSchema({
            name: 'citizenships',
            columns: [
                { name: 'person_id', type: 'string', isIndexed: true },
                { name: 'birth_citizenship', type: 'string', isOptional: true },
                { name: 'naturalised_citizenship', type: 'string', isOptional: true },
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
                { name: 'moved_in_at', type: 'number', isOptional: true },
                { name: 'moved_out_at', type: 'number', isOptional: true },
            ],
        }),

        tableSchema({
            name: 'birth_records',
            columns: [
                { name: 'person_id', type: 'string', isIndexed: true },
                { name: 'born_at', type: 'number', isOptional: true },
                { name: 'birth_town', type: 'string', isOptional: true },
                { name: 'birth_country', type: 'string', isOptional: true },
                { name: 'baptised_at', type: 'number', isOptional: true },
                { name: 'birth_registry_office', type: 'string', isOptional: true },
                { name: 'birth_registry_book', type: 'string', isOptional: true },
                { name: 'birth_religion', type: 'string', isOptional: true },
            ],
        }),

        tableSchema({
            name: 'marriage_records',
            columns: [
                { name: 'person1_id', type: 'string', isIndexed: true },
                { name: 'person2_id', type: 'string', isIndexed: true },
                { name: 'marriage_id', type: 'string', isIndexed: true },
                { name: 'marriage_registry_office', type: 'string', isOptional: true },
                { name: 'marriage_registry_book', type: 'string', isOptional: true },
                { name: 'marriage_religion', type: 'string', isOptional: true },
            ],
        }),

        tableSchema({
            name: 'death_records',
            columns: [
                { name: 'person_id', type: 'string', isIndexed: true },
                { name: 'death_reason', type: 'string', isOptional: true },
                { name: 'died_at', type: 'number', isOptional: true },
                { name: 'death_town', type: 'string', isOptional: true },
                { name: 'death_country', type: 'string', isOptional: true },
                { name: 'death_registry_office', type: 'string', isOptional: true },
                { name: 'death_registry_book', type: 'string', isOptional: true },
                { name: 'death_religion', type: 'string', isOptional: true },
            ],
        }),

        tableSchema({
            name: 'citizenship_records',
            columns: [
                { name: 'person_id', type: 'string', isIndexed: true },
                { name: 'naturalised_at', type: 'number', isOptional: true },
                { name: 'naturalised_type', type: 'string', isOptional: true },
                { name: 'birth_citizenship_lost', type: 'boolean', isOptional: true },
            ],
        }),
    ],
});