import { app } from './src/index'
import envConfig from './src/config/env.config'

app.listen(envConfig.PORT, () => {
  console.log(`Server is running at http://localhost:${envConfig.PORT}`);
})