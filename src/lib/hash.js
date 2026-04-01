import argon2 from "argon2"

/**
 * 
 * @param {string} password
 * @returns {Promise<string>} 
 */

export async function GenerateHash(password){
    const hash = await argon2.hash(password)
    return hash
}

/**
 * 
 * @param {string} hash 
 * @param {string} plainText 
 * @returns {Promise<boolean>}
 */
export async function VerifyHash(hash, plainText){
    const isVerified = await argon2.verify(hash, plainText)
    return isVerified
}