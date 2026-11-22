export const checkPath = ({name, root, win}) => {
    const [, drive] = name.split('/');
    const isRoot = root === '/';
    const isDrive = /^[a-z]$/i.test(drive);
    
    return !win || !isRoot || isDrive;
};
