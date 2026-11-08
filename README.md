# Family tree version history

## Version 0.0.1 - Initial release of the family tree project. (master branch)
- Features include basic family member addition, relationship mapping, and visualization of the family tree structure.
- WatermelonDB mainly linked to the person table, with some additional tables for relationships and events.
- Can add family members, edit their details, and view their relationships in a tree format.
- Can apply for certificates for family members, with basic validation and submission features.
- Save to local storage and sync with a remote database for backup and sharing purposes.
- Save certificates as PDF files for download and printing.

## Version 0.1.0  - Rewrite of the family tree project. (rewrite branch)
- Databse stucture has been rewritten be focused on events rather than person.
- Unique identifiers for people and events have been added to allow human readable names to be used as identifiers for relationships and events
- Person table has been simplified to only include basic information such as name, birth date, and death date which are placeholders/ fallbacks for events.
- Person table has hosts recod IDs for events and relationships rather than storing them directly in the person table.
- Marrriage records have been merged into relationship records 
- Recors are now main source of truth for the person
- Welcome screen, people table, person detail screen and edit person screen have been rewritten to reflect the new data structure and relationships.
- Currenly not working: Family tree visualization, relationship mapping, certificate application forms and event management features are still being rewritten to reflect the new data structure.

