import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { TariffsController } from './tariffs.controller';

@Module({
  imports: [AuthModule, ProfileModule],
  controllers: [AppController, TariffsController],
  providers: [AppService],
})
export class AppModule {}
