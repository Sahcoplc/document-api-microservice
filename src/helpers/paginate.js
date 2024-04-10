import { model } from "mongoose";

export const generateFilter = (data) => {

    const { name } = data

    let filter = { deletedDate: null }

    if(name === '') {
        filter = { ...filter }
    }

    if(name) {
        // eslint-disable-next-line prefer-template
        const regex = new RegExp(`${name}`, 'i');
        filter = { ...filter, fullName: { $regex: regex } }
    }

    return filter
}

const simplePagination = async (data) => {
    const { modelName, filter, projection, page, populate, sort } = data;
    let limit = !data.limit || data.limit > 200 ? 200 : data.limit;
    if (data.exportLimit > 0) {
        limit = data.exportLimit;
    }
    const options = { projection, page: page || 1, limit, lean: true, populate, sort: sort || { _id: -1 } };
    const result = await model(modelName).paginate({ ...filter }, options);
    return result;
};

const aggregatePagination = async (data) => {
    const { modelName, page, pipeline, sort } = data;
    let limit = !data.limit || data.limit > 200 ? 200 : data.limit;
    if (data.exportLimit > 0) {
        limit = data.exportLimit;
    }
    const options = { page: page || 1, limit, lean: true, sort: sort || { _id: -1 } };
    const aggregate = model(modelName).aggregate(pipeline);
    const result = await model(modelName).aggregatePaginate(aggregate, options);
    return result;
};

export const paginate = async (data) => data.pipeline ? aggregatePagination(data) : simplePagination(data);