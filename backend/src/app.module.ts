import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './auth/auth.module';
import { AccountsModule } from './accounts/accounts.module';
import { TransactionsModule } from './transactions/transactions.module';
import { CardsModule } from './cards/cards.module';
import { BillsModule } from './bills/bills.module';
import { AnalyticsModule } from './analytics/analytics.module';

let mongod: MongoMemoryServer;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        let uri = configService.get<string>('MONGO_URI') || 'mongodb://localhost:27017/online_banking';
        
        // Use in-memory MongoDB if localhost is specified to avoid needing external MongoDB setup
        if (uri.includes('localhost') || uri.includes('127.0.0.1')) {
          console.log('Detecting local MongoDB configuration. Starting in-memory MongoDB server for development...');
          try {
            mongod = await MongoMemoryServer.create();
            uri = mongod.getUri();
            console.log(`🚀 In-memory MongoDB Server successfully started at: ${uri}`);
          } catch (err) {
            console.error('Failed to spin up in-memory MongoDB. Falling back to local default URI...', err);
          }
        }
        
        return {
          uri,
        };
      },
    }),
    AuthModule,
    AccountsModule,
    TransactionsModule,
    CardsModule,
    BillsModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
