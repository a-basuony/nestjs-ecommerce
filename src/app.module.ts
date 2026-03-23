import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://basuoneychrom_db_user:1f8x0HuQqPn35N0u@cluster0.xfg1sqr.mongodb.net/ecommerce?retryWrites=true&w=majority',
    ),
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
