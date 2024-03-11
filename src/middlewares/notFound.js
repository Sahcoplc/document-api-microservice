/**
 * UNHANDLE ROUTE RESPONSE
 * @param {*} req 
 * @param {*} res 
 */
const notFound = (req, res) => {
    res.status(404).send({
      // eslint-disable-next-line max-len
      message: `OOPs!! Server can't find ${req.originalUrl}.This could be a typographical issue.Check the API specification for further guidance`,
      success: 0,
    });
};
  
export default notFound;