/**
 *
 */
const error = (res, code, err, data) => {
    const message = err.message || err;
    return res.status(code).send({
        success: 0,
        message: message.includes("E11000") ? "Duplicate Error: Record Exists" : message,
        data
    });
};

const success = (res, code, data) => {
    return res.status(code).send({
        success: 1,
        message: "Successful",
        data
    });
};

export { error, success };
