import { createClient } from 'redis'
import { InventoryRepository } from '~/api/v1/repositories/inventory.repository'

const redisClient = createClient({
  url: 'redis://localhost:6379'
})

// Kết nối Redis client
redisClient.connect().catch(console.error)

// Xử lý lỗi
redisClient.on('error', (err) => console.log('Redis Client Error', err))

const inventoryRepository = new InventoryRepository()

const pExpire = redisClient.pExpire
const setNxAsync = redisClient.setNX

export const acquireClock = async (productId: string, quantity: number, cartId: string) => {
  const key = `lock_v2025_${productId}`
  const retryTimes = 10
  const expireTime = 3000 // 3 seconds clock

  for (let i = 0; i < retryTimes; i++) {
    const result = await setNxAsync(key, expireTime.toString())
    if (result === 1) {
      const isReversation = await inventoryRepository.revervationInventory(productId, quantity, cartId)
      if (isReversation.modifiedCount > 0) {
        await pExpire(key, expireTime)
        return key
      }
      return null
    } else {
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
  }
}

export const releaseClock = async (keyClock: string) => {
  const delAsyncKey = redisClient.del
  return await delAsyncKey(keyClock)
}
