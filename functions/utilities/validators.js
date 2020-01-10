const isEmail = email => {
  var regexp = /\S+@\S+\.\S+/
  return regexp.test(String(email).toLowerCase())
}

const isEmpty = string => {
  string.trim() === '' ? true : false
}

exports.validateSignupData = data => {
  let errors = {}

  if (isEmpty(data.email)) {
    errors.email = 'Field must not be empty.'
  } else if (!isEmail(data.email)) {
    errors.email = 'Must be a valid email address.'
  }

  if (isEmpty(data.password)) errors.password = 'Field must not be empty.'
  if (data.password !== data.confirmPassword) errors.confirmPassword = 'Passwords must match.'
  if (isEmpty(data.handle)) errors.handle = 'Field must not be empty.'

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false
  }
}

exports.validateLoginData = data => {
  let errors = {}

  if (isEmpty(user.email)) errors.email = 'Field must not be empty.'
  if (isEmpty(user.password)) errors.password = 'Field must not be empty.'

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false
  }
}
