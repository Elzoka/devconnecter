const validator = require('validator');
const isEmpty = require('./is-empty');


module.exports = (data) => {
    let errors = {};

    data.school = !isEmpty(data.school) ? data.school : '';
    data.degree = !isEmpty(data.degree) ? data.degree : '';
    data.fieldOfStudy = !isEmpty(data.fieldOfStudy) ? data.fieldOfStudy : '';
    data.from = !isEmpty(data.from) ? data.from : '';
    
    if(validator.isEmpty(data.school)){
        errors.school = 'School field is required';
    }

    if(validator.isEmpty(data.degree)){
        errors.degree = 'Degree field is required';
    }

    if(validator.isEmpty(data.fieldOfStudy)){
        errors.fieldOfStudy = 'Field of study field is required';
    }

    if(validator.isEmpty(data.from)){
        errors.from = 'From date field is requiredFrom date ';
    }
    return {
        errors,
        isValid: isEmpty(errors)
    }
}