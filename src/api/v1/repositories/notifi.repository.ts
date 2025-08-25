import mongoose from "mongoose";
import { BaseRepository } from "~/api/v1/repositories/base.repository";
import { INotifi } from "~/api/v1/types/notifi.type";
import { notificationSchema } from "~/api/v1/models/notification.model";
export class NotificationRepository extends BaseRepository {
  private model = new Map<string, mongoose.Model<INotifi>>

  async getNotifiModel() {
    const dbName = this.dbName
    if (!this.model.has(dbName)) {
      const connection = await this.getConnection()
      const notifiModel = connection.model<INotifi>('Notification', notificationSchema)
      this.model.set(dbName, notifiModel)
    }
    return this.model.get(dbName)!
  }
}