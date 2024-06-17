export const generateFilter = (req) => {

    const { user: { _id }, query } = req

    let filter = { "operator._id": _id }

    if (query.type) {
        filter = { ...filter, type: query.type }
    }
    
    if (query.status) {
        filter = { ...filter, status: query.status }
    }

    if (query.documentNo) filter = { ...filter, documentNo: query.documentNo }

    if (query.startDate) {
        filter = {
            ...filter,
            createdAt: { $gte: new Date(query.startDate)}
        }
    }

    if (query.endDate) {
        filter = {
            ...filter,
            createdAt: { $gte: new Date(query.startDate), $lte: new Date(query.endDate) }
        }
    }
    
    return filter
}

export const pickRandomCharacters = (text, numChars) => {
    // Remove any non-alphanumeric characters and join to create a single string
    let cleanText = text.replace(/[^a-z0-9]/gi, '');

    // If the requested number of characters is more than available, adjust it
    if (numChars > cleanText.length) {
        numChars = cleanText.length;
    }

    // Array to store random characters
    let randomChars = [];

    // Pick random characters
    for (let i = 0; i < numChars; i++) {
        // Generate a random index
        let randomIndex = Math.floor(Math.random() * cleanText.length);
        
        // Add the character at the random index to the array
        randomChars.push(cleanText[randomIndex]);
        
        // Remove the character from cleanText to avoid picking it again
        cleanText = cleanText.slice(0, randomIndex) + cleanText.slice(randomIndex + 1);
    }

    // Join the array into a string and return
    return randomChars.join('');
}

export const generateDocumentNo = (form = true, docType, deptCode, matches, docInteger) => `SAHCO/${deptCode}/${form ? 'F' : docType}/${matches}/${docInteger}`