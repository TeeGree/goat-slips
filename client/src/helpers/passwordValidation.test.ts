import { passwordIsValid } from './passwordValidation';

describe('Password validation tests:', () => {
    it('Password over 8 characters with letters and numbers passes validation.', () => {
        const isValid = passwordIsValid('test12345');
        expect(isValid).toBe(true);
    });

    it('Password under 8 characters fails validation.', () => {
        const isValid = passwordIsValid('test1');
        expect(isValid).toBe(false);
    });

    it('Password without numbers fails validation.', () => {
        const isValid = passwordIsValid('testpassword');
        expect(isValid).toBe(false);
    });

    it('Password without letters fails validation.', () => {
        const isValid = passwordIsValid('123456789');
        expect(isValid).toBe(false);
    });
});
