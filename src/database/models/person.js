import { Model } from '@nozbe/watermelondb';
import { text, field, json } from '@nozbe/watermelondb/decorators';

const sanitizeIds = (raw) =>
    Array.isArray(raw) ? raw.filter((id) => typeof id === 'string') : [];


export default class Person extends Model {
    static table = 'people';

        // General
    @text('first_name_p') firstNameP; // this is a placeholder if no event is linked
    @text('last_name_p') lastNameP; // this is a placeholder if no event is linked
    @text('birth_name_p') birthNameP; // this is a placeholder if no event is linked
    @text('gender_p') genderP; // this is a placeholder if no event is linked

    //IDs
    @field('person_id') personId;
    @text('generation') generation; // this is populated when linked as a child or parent or updated running recalculation script. 
   // @text('tree_id')TreeID // this is to store ID of position on the tree. "1B1" would be father of the main person "1B3" would be father of the main person's first spouse "2B1 "Would be the main person eldest chid"

    //Linked event IDs

    @field('birth_idR') birthIdR;
    @json('relationship_idsR', sanitizeIds) relationshipIdsR;
    @field('death_idR') deathIdR;
    @json('citizenship_idsR',sanitizeIds) citizenshipIdsR;
    @field('contact_idR') contactIdR;
    @json('address_idsR',sanitizeIds) addressIdsR;
    //@json('education_id') educationId;
    //@json('career_id') carrerId;
    

    // Family tree
    @field('is_owner') isOwner;

}

//@text('_id') ID;