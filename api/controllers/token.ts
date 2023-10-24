import Token, { type IToken } from '../models/token'
import randomize from 'randomatic'

type TokenType = IToken['type']

/**
 * return token value
 */
export const generateToken = async (
  tokenType: TokenType,
  userId: string,
  expires?: number
) => {
  const HOURE = 1000 * 60 * 60
  const validity = new Date(new Date().getTime() + HOURE)
  const reusableToken = await Token.findOne({
    user: userId,
    type: tokenType,
    validity: { $gte: validity },
  }).exec()
  if (reusableToken) return reusableToken.value

  const tokenValue = randomize('aA0', 120)
  const token = await Token.create({
    type: tokenType,
    value: tokenValue,
    validity: expires || new Date().getTime() + 2 * HOURE,
    user: userId,
  })

  return token.value
}

/**
 * @returns userId
 */
export const validateToken = async (
  tokenType: TokenType,
  tokenValue: string
) => {
  const token = await Token.findOne({
    type: tokenType,
    value: tokenValue,
  }).exec()
  if (!token) throw Error('Token not found')
  await Token.deleteOne({ _id: token._id }).exec()
  if (token.validity < new Date().getTime()) throw Error('Token is expired')

  return token.user as string
}
