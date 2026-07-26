import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';
import { MaterialsModule } from './materials/materials.module';
import { DetectionModule } from './detection/detection.module';
import { ReportsModule } from './reports/reports.module';
import { RulesModule } from './rules/rules.module';
import { LogsModule } from './logs/logs.module';
import { ReviewsModule } from './reviews/reviews.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PlansModule } from './plans/plans.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { FilesModule } from './files/files.module';
import { CommercialModule } from './commercial/commercial.module';
import { CompaniesModule } from './companies/companies.module';
import { CustomersModule } from './customers/customers.module';
import { BatchModule } from './batch/batch.module';
import { MaterialVersionsModule } from './material-versions/material-versions.module';
import { ApiOpenModule } from './api-open/api-open.module';
import { ReportTemplatesModule } from './report-templates/report-templates.module';
import { ModelConfigModule } from './model-config/model-config.module';
import { HealthModule } from './health/health.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PublicationOutcomesModule } from './publication-outcomes/publication-outcomes.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    TasksModule,
    MaterialsModule,
    DetectionModule,
    ReportsModule,
    RulesModule,
    LogsModule,
    ReviewsModule,
    DashboardModule,
    PlansModule,
    SubscriptionModule,
    FilesModule,
    CommercialModule,
    CompaniesModule,
    CustomersModule,
    BatchModule,
    MaterialVersionsModule,
    ApiOpenModule,
    ReportTemplatesModule,
    ModelConfigModule,
    HealthModule,
    NotificationsModule,
    PublicationOutcomesModule,
  ],
})
export class AppModule {}
