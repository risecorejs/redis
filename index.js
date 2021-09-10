const redis = require('redis')

/**
 * default
 * @param options
 * @returns {{keyMutation: ((function(*=, *=): (*))|*), set: set, keys: (function(*=, *=): Promise<unknown>), get: (function(*=, *=): Promise<unknown>), client: (RedisClient|*|RedisClient), del: del}}
 */
module.exports = (options = {}) => {
  const host = options.host ?? process.env.REDIS_HOST ?? '127.0.0.1'
  const port = options.port ?? process.env.REDIS_PORT ?? '6379'

  const client = options.client ?? redis.createClient({ host, port })

  /**
   * addPrefix
   * @param key
   * @returns {*}
   */
  function addPrefix(key) {
    const prefix = options.prefix ?? process.env.REDIS_PREFIX

    return (prefix ? prefix + '_' : '') + key
  }

  /**
   * keyMutation
   * @param key
   * @param withPrefix
   * @returns {*}
   */
  function keyMutation(key, withPrefix = true) {
    if (withPrefix)
      return Array.isArray(key)
        ? key.map((key) => addPrefix(key))
        : addPrefix(key)

    return key
  }

  /**
   * get
   * @param key
   * @param withPrefix
   * @returns {Promise<unknown>}
   */
  function get(key, withPrefix) {
    return new Promise((resolve, reject) => {
      client.get(keyMutation(key, withPrefix), (err, data) => {
        if (err) reject(err)
        else resolve(data)
      })
    })
  }

  /**
   * set
   * @param key
   * @param payload
   * @param withPrefix
   */
  function set(key, payload, withPrefix) {
    return new Promise((resolve, reject) => {
      client.set(keyMutation(key, withPrefix), payload, (err, data) => {
        if (err) reject(err)
        else resolve(data)
      })
    })
  }

  /**
   * keys
   * @param key
   * @param withPrefix
   * @returns {Promise<unknown>}
   */
  function keys(key, withPrefix) {
    return new Promise((resolve, reject) => {
      client.keys(keyMutation(key, withPrefix), (err, data) => {
        if (err) reject(err)
        else resolve(data)
      })
    })
  }

  /**
   * del
   * @param key
   * @param withPrefix
   */
  function del(key, withPrefix) {
    return new Promise((resolve, reject) => {
      client.del(keyMutation(key, withPrefix), (err, data) => {
        if (err) reject(err)
        else resolve(data)
      })
    })
  }

  return { client, keyMutation, get, set, keys, del }
}
