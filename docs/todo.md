# TODO




- Comments aligned indentation, dashes and capital letters, punctuation.
  - ✔️ FileIO
  - ✔️ SchemaManager
  - ✔️ getFunctionResult
  - ✔️ FileToSchemaConverter
  - IFileIO
  - MiscTypes
  - Schema
  - WriteModeEnum 

- Rename 'liquid_files_path' variables to 'liquid_sections_path' to be more precise and descriptive

- **[10%]** Error checking
  - FileIO
  - SchemaManager

- Schema validation
- Move types to `types` folder

- Merge/overwrite/append options

- Read schemas from .liquid files, convert them to JSON and merge them with -schema.json objects
- Replace .liquid files that have schemas with the generated schemas from -schema.json


# DONE

- **[100%]** Comments
  - ✔️ SchemaManager
  - ✔️ FileIO
  - ✔️ IFileIO
  - ✔️ MiscTypes
  - ✔️ Schema
  - ✔️ WriteModeEnum
  - ✔️ FileToSchemaConverter

- ✔️ **[100%]** Types
- ✔️ **schemaObjApply** Apply jsons to other jsons
- ✔️Fix blocks: [
        {
          '0':
- ✔️ **schemaObjApply** Objects as args (possible)
- ✔️ **schemaObjApply** Apply blocks and block settings
- ✔️ Add support for -schema.js
- ✔️ First, let's do this with blocks
- ✔️ Read -schema.json files and convert them to JSON objects