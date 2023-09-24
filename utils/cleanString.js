const iconv = require('iconv-lite');

function cleanStr(value) {

    if (typeof value !== 'string' || !value) return value;

    // Replace special characters like 'ã' with a standard comma ','
    value = value.replace(/ã/g, ',');

    value = value.replace(/[\x00-\x1F\x7F]/gu, '');
    value = iconv.decode(value, 'utf8');
    value = iconv.encode(value, 'ascii');
    value = value.toString('ascii');
    value = value.replace(/\s+/g, ' ');
    value = value.trim();
    return value;
}

module.exports = cleanStr;