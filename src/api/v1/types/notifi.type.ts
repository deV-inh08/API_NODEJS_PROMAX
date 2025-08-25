import { notiEnum } from "~/api/v1/constants/nofitication.constant"
export interface INotifi {
  user_id: string
  shop_id: string
  noti_content: string
  noti_type: notiEnum[]
  noti_options: object
}