import bcrypt from "bcrypt";

export const generateHashString = async (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync());
};