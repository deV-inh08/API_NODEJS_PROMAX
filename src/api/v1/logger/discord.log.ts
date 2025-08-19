import { Client, GatewayIntentBits } from 'discord.js'
export class LoggerServices {
  private client: Client<boolean>
  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
      ]
    })
  }
}
