import 'source-map-support/register'

//Constructors
import SchemaManager from './constructors/SchemaManager';
import FileIO from './constructors/FileIO';

//Types
import WriteModeEnum from './types/WriteModeEnum';

const fileIO = new FileIO();

fileIO.replaceInFile()

const test = true;

const schemas_dir = test ? './example/schema' : './schema';
const liquid_dir = test ? './example/liquid/sections' : './sections';

const schema_manager = new SchemaManager();

//schema_manager.run( schemas_dir, liquid_dir );