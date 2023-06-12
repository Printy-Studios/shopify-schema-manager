/**
 * Interface for FileIO constructor. See constructors/FileIO for documentation on each method.
 */
export default interface IFileIO {
    replaceInFile: Function,
    readDir: Function,
    readFile: ( file_path: string ) => string
}