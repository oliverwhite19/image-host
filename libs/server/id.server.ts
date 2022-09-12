import { customAlphabet } from 'nanoid';

const uid = (): string => {
    const alphabet =
        '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const nanoid = customAlphabet(alphabet, 15);
    return nanoid();
};

export { uid };
