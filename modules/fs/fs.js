const removeSync = (path, options = { recursive: false }) => {
    remove_sync_ex(path, options.recursive);
};

const remove = async (path, options = { recursive: false }) => {
    await remove_async_ex(path, options.recursive);
};

const existsSync = (path) => {
    return exists_sync_ex(path);
};

const createDirSync = (path, options = { recursive: false }) => {
    create_dir_sync_ex(path, options.recursive, options.mode);
};

const createDir = async (path, options = { recursive: false }) => {
    await create_dir_async_ex(path, options.recursive, options.mode);
};

const createFileSync = (path) => {
    create_file_sync_ex(path);
};

const createFile = async (path) => {
    await create_file_async_ex(path);
};

const readFileSync = (path) => {
    return read_file_sync_ex(path);
};

// TODO: abort signal
const readFile = async (path) => {
    return await read_file_async_ex(path);
};

const readTextFileSync = (path) => {
    return read_text_file_sync_ex(path);
};

// TODO: abort signal
const readTextFile = async (path) => {
    return await read_text_file_async_ex(path);
};

export {
    createDir,
    createDirSync,
    createFile,
    createFileSync,
    existsSync,
    readFile,
    readFileSync,
    readTextFile,
    readTextFileSync,
    remove,
    removeSync,
};
