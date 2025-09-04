import { notiEnum } from '~/api/v1/constants/nofitication.constant'
import { NotificationRepository } from '~/api/v1/repositories/notifi.repository'
import { convertStringToObjectId } from '~/api/v1/utils/common.util'
import { BadRequestError } from '~/api/v1/utils/response.util'

type OptionsType = {
  product_name: string
  shop_name: string
}

export const pushNotificationToSystem = async (
  type: notiEnum = 'SHOP-001',
  shopId: string,
  userId: string,
  options: OptionsType
) => {
  try {
    const NotifiModel = await new NotificationRepository().getNotifiModel()
    let noti_content
    if (type == 'SHOP-001') {
      noti_content = '@@@ vừa mới thêm sản phẩm mới'
    } else if (type === 'PROMOTION-001') {
      noti_content = '@@@ vừa thêm voucher mới'
    }
    const newNoti = await NotifiModel.create({
      noti_type: type,
      noti_content,
      user_id: userId,
      shop_id: shopId,
      noti_options: options
    })
    return newNoti
  } catch (error) {
    throw new BadRequestError('')
  }
}

export const listNotiByUser = async (type: string, userId: string, isRead = 0) => {
  try {
    const NotifiModel = await new NotificationRepository().getNotifiModel()
    const match = {
      user_id: convertStringToObjectId(userId),
      noti_type: type
    }
    console.log('match', match)
    return await NotifiModel.aggregate([
      {
        $match: match
      },
      {
        $project: {
          noti_type: 1,
          user_id: 1,
          shop_id: 1,
          noti_options: 1,
          noti_content: 1
        }
      }
    ])
  } catch (error) {
    throw new BadRequestError('Get list notification failed')
  }
}
