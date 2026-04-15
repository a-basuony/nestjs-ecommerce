import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';

const mongoUri =
  'mongodb://basuoneychrom_db_user:cp0kTLehKgUzL2OI@ac-34ksmaz-shard-00-00.ht9tgyl.mongodb.net:27017,ac-34ksmaz-shard-00-01.ht9tgyl.mongodb.net:27017,ac-34ksmaz-shard-00-02.ht9tgyl.mongodb.net:27017/ecommerce_db_nest?ssl=true&replicaSet=atlas-101q9b-shard-0&authSource=admin&appName=Cluster0';

if (!mongoUri) {
  throw new Error(
    'MONGO_URI must be set to your MongoDB Atlas connection string.',
  );
}

@Module({
  imports: [MongooseModule.forRoot(mongoUri), UserModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
