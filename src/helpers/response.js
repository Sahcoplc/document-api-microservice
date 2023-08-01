/**
 *
 */
const error = (res, code, err, data) => {
    const message = err.message || err;
    return res.status(code).json({
        success: 0,
        message,
        data
    });
};

const success = (res, code, data) => res.status(code).send({
        success: 1,
        message: "Successful",
        data
    });

export { error, success };
