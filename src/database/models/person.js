import { Model } from '@nozbe/watermelondb';
import { text, field, lazy } from '@nozbe/watermelondb/decorators';
import { Q } from '@nozbe/watermelondb';

export default class Person extends Model {
    static table = 'people';
    static associations = {
        relationships: { type: 'has_many', foreignKey: 'person1_id' },
    };

    // General
    @text('first_name') firstName;
    @text('last_name') lastName;
    @text('birth_name') birthName;
    @text('gender') gender;
    @text('email') email;

    // Birth
    @field('born_at') bornAt;
    @text('birth_town') birthTown;
    @text('birth_country') birthCountry;

    // Death
    @field('deceased') deceased;
    @field('died_at') diedAt;
    @text('death_town') deathTown;
    @text('death_country') deathCountry;

    // Research
    @field('birth_certificate_obtained') birthCertificateObtained;
    @field('marriage_certificate_obtained') marriageCertificateObtained;
    @field('death_certificate_obtained') deathCertificateObtained;

    // Family tree
    @field('is_owner') isOwner;

    // Lazy queries
    @lazy parents = this.collections
        .get('relationships')
        .query(
            Q.where('person2_id', this.id),
            Q.where('relationship_type', 'parent')
        );

    @lazy children = this.collections
        .get('relationships')
        .query(
            Q.where('person1_id', this.id),
            Q.where('relationship_type', 'parent')
        );

    @lazy spouses = this.collections
        .get('relationships')
        .query(
            Q.where('person1_id', this.id),
            Q.where('relationship_type', 'spouse')
        );
}