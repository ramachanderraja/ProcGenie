import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import {
  AnalyticsService,
  SpendDashboardData,
  SavingsWaterfallData,
  SpendTrendData,
  NLQueryResult,
} from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../auth/entities/user.entity';

@ApiTags('Analytics')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Public()
  @Get('spend-dashboard')
  @ApiOperation({
    summary: 'Get comprehensive spend dashboard data',
    description: 'Returns aggregated spend analytics including category breakdown, supplier spend, and trends',
  })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Spend dashboard data' })
  async getSpendDashboard(
    @CurrentUser() user: User | undefined,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('category') category?: string,
  ): Promise<SpendDashboardData> {
    const tenantId = user?.tenantId || 'GEP';
    return this.analyticsService.getSpendDashboard(tenantId, {
      startDate,
      endDate,
      category,
    });
  }

  @Public()
  @Get('savings-waterfall')
  @ApiOperation({
    summary: 'Get savings waterfall breakdown',
    description: 'Returns detailed breakdown of savings by source: negotiation, competitive bidding, demand reduction, etc.',
  })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Savings waterfall data' })
  async getSavingsWaterfall(
    @CurrentUser() user: User | undefined,
    @Query('year') year?: number,
  ): Promise<SavingsWaterfallData> {
    const tenantId = user?.tenantId || 'GEP';
    return this.analyticsService.getSavingsWaterfall(tenantId, { year });
  }

  @Public()
  @Get('spend-trends')
  @ApiOperation({
    summary: 'Get spend trend data over time',
    description: 'Returns historical spend data including direct/indirect breakdown, budget vs actual, and forecasts',
  })
  @ApiQuery({ name: 'period', required: false, type: String, description: 'Aggregation period (monthly, quarterly)' })
  @ApiQuery({ name: 'months', required: false, type: Number, description: 'Number of months to look back (default 12)' })
  @ApiResponse({ status: 200, description: 'Spend trend data' })
  async getSpendTrends(
    @CurrentUser() user: User | undefined,
    @Query('period') period?: string,
    @Query('months') months?: number,
  ): Promise<SpendTrendData[]> {
    const tenantId = user?.tenantId || 'GEP';
    return this.analyticsService.getSpendTrends(tenantId, { period, months });
  }

  @Public()
  @Post('nl-query')
  @ApiOperation({
    summary: 'Natural language analytics query',
    description: 'Ask procurement analytics questions in natural language powered by AI. Example: "What is my top spending category this quarter?"',
  })
  @ApiResponse({ status: 200, description: 'Query results with AI-generated insights' })
  @ApiResponse({ status: 400, description: 'Query string cannot be empty' })
  async naturalLanguageQuery(
    @CurrentUser() user: User | undefined,
    @Body() body: { query: string },
  ): Promise<NLQueryResult> {
    const tenantId = user?.tenantId || 'GEP';
    return this.analyticsService.naturalLanguageQuery(tenantId, body.query);
  }

  @Public()
  @Get('cycle-times')
  @ApiOperation({
    summary: 'Get procurement cycle time metrics',
    description: 'Returns average processing times for requisitions, POs, invoices, approvals, and contracts',
  })
  @ApiResponse({ status: 200, description: 'Cycle time metrics' })
  async getCycleTimeMetrics(
    @CurrentUser() user: User | undefined,
  ): Promise<Record<string, unknown>> {
    const tenantId = user?.tenantId || 'GEP';
    return this.analyticsService.getCycleTimeMetrics(tenantId);
  }
}
