export const validname = (name) => {
    const nameRe = /^[A-Za-z ]{2,50}$/;
    return nameRe.test(name)
}

export const validEmail = (email) => {
    const emailRe = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRe.test(email)
}

export const validpassword = (pass) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(pass)
}
