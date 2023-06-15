/**
 * Interface for FileIO constructor. See constructors/FileIO for documentation on each method.
 */
export default interface IFileIO {
    replaceInFile: ( regex: RegExp, replacement: string, file_path: string ) => boolean,
    readDir: ( path: string, filterFn?: ( filename: string ) => boolean) => string[],
    readFile: ( file_path: string ) => string
}