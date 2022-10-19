export const passwordIsValid = (password: string) => {
    const re = /^(?=.*[a-zA-Z].*)(?=.*[0-9].*).{8,}$/;
    return password.match(re) !== null;
};
