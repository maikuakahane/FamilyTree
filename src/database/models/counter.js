import { Model } from '@nozbe/watermelondb';
import { field, text } from '@nozbe/watermelondb/decorators';

export default class Counter extends Model {
    static table = 'counters';

    @text('key') key;
    @field('value') value;
}