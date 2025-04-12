import express, {Application} from 'express';
import config from 'config';
import logger from "./utils/logger";
import T3 from './test/T3'
import userRoute from './routes/v1/user.routes'
import adminRoute from './routes/v1/admin.routes'
import bookRoute from './routes/v1/book.routes'
import cartRoute from './routes/v1/cart.routes'
import userGiftCardRoute from './routes/v1/userGiftCard.routes'
import adminGiftCardRoute from './routes/v1/adminGiftCard.routes'
import userPromoCodeRoute from './routes/v1/userPromoCode.routes'
import adminPromoCodeRoute from './routes/v1/adminPromoCode.routes'
import { errors } from 'celebrate';
import startMongoConnection from './databases/mongoDB';

const app = express();

const loadRoutes = (app : Application ) => {
  app.use('/users', userRoute);
  app.use('/admin', adminRoute);
  app.use('/books', bookRoute);
  app.use('/cart', cartRoute);
  app.use('/userGiftCard', userGiftCardRoute);
  app.use('/adminGiftCard', adminGiftCardRoute);
  app.use('/userPromoCode', userPromoCodeRoute);
  app.use('/adminPromoCode', adminPromoCodeRoute);
} 
/**
 * Function to connect with all the required Database
 */
const dbConnection = () => {
  startMongoConnection();
}
app.use(express.json()); 

console.log('ENVIRONMENT', config.get("ENVIRONMENT"))
// T3().then(()=> {console.log("Executed Successfully")}).catch((error)=> {console.log(error)});

loadRoutes(app);
dbConnection();

app.get('/', (req, res)=>{
  logger.log('info', 'hello', { message: 'world' });
    res.send("Server started");
})

app.use(errors());
app.listen(config.get('PORT'), ()=>{
    console.log(`Server Started at Port ${config.get('PORT')}`);
});