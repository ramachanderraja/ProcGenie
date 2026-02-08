import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { SustainabilityService } from './sustainability.service';
import { EsgScore, EsgCategory } from './entities/esg-score.entity';
import { CarbonFootprint, EmissionScope } from './entities/carbon-footprint.entity';
import { RegulatoryAlert, AlertSeverity, AlertStatus } from './entities/regulatory-alert.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../auth/entities/user.entity';

@ApiTags('Sustainability')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sustainability')
export class SustainabilityController {
  constructor(private readonly sustainabilityService: SustainabilityService) {}

  // ── ESG Scores ─────────────────────────────────────────────────────

  @Get('esg-scores')
  @ApiOperation({ summary: 'Get ESG scores for suppliers' })
  @ApiQuery({ name: 'supplierId', required: false })
  @ApiQuery({ name: 'category', required: false, enum: EsgCategory })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Paginated list of ESG scores' })
  async getEsgScores(
    @CurrentUser() user: User,
    @Query('supplierId') supplierId?: string,
    @Query('category') category?: EsgCategory,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.sustainabilityService.getEsgScores(user.tenantId, {
      supplierId,
      category,
      page,
      limit,
    });
  }

  @Get('esg-scores/:id')
  @ApiOperation({ summary: 'Get a specific ESG score by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'ESG score details', type: EsgScore })
  @ApiResponse({ status: 404, description: 'ESG score not found' })
  async getEsgScoreById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<EsgScore> {
    return this.sustainabilityService.getEsgScoreById(id, user.tenantId);
  }

  @Post('esg-scores')
  @Roles('admin', 'sustainability_manager')
  @ApiOperation({ summary: 'Create a new ESG score assessment' })
  @ApiResponse({ status: 201, description: 'ESG score created', type: EsgScore })
  async createEsgScore(
    @Body() body: Partial<EsgScore>,
    @CurrentUser() user: User,
  ): Promise<EsgScore> {
    return this.sustainabilityService.createEsgScore(body, user.id, user.tenantId);
  }

  // ── Carbon Footprint ───────────────────────────────────────────────

  @Get('carbon-footprints')
  @ApiOperation({ summary: 'Get carbon footprint data' })
  @ApiQuery({ name: 'supplierId', required: false })
  @ApiQuery({ name: 'scope', required: false, enum: EmissionScope })
  @ApiQuery({ name: 'period', required: false, type: String, description: 'Reporting period (e.g., Q1 2025)' })
  @ApiResponse({ status: 200, description: 'Carbon footprint data' })
  async getCarbonFootprints(
    @CurrentUser() user: User,
    @Query('supplierId') supplierId?: string,
    @Query('scope') scope?: EmissionScope,
    @Query('period') period?: string,
  ): Promise<CarbonFootprint[]> {
    return this.sustainabilityService.getCarbonFootprints(user.tenantId, {
      supplierId,
      scope,
      period,
    });
  }

  @Post('carbon-footprints')
  @Roles('admin', 'sustainability_manager')
  @ApiOperation({ summary: 'Record a carbon footprint entry' })
  @ApiResponse({ status: 201, description: 'Carbon footprint recorded', type: CarbonFootprint })
  async createCarbonFootprint(
    @Body() body: Partial<CarbonFootprint>,
    @CurrentUser() user: User,
  ): Promise<CarbonFootprint> {
    return this.sustainabilityService.createCarbonFootprint(body, user.id, user.tenantId);
  }

  @Get('carbon-summary')
  @ApiOperation({
    summary: 'Get carbon emission summary',
    description: 'Returns aggregated carbon emission data by scope, top emitters, and reduction targets',
  })
  @ApiResponse({ status: 200, description: 'Carbon emission summary' })
  async getCarbonSummary(
    @CurrentUser() user: User,
  ): Promise<Record<string, unknown>> {
    return this.sustainabilityService.getCarbonSummary(user.tenantId);
  }

  // ── Regulatory Alerts ──────────────────────────────────────────────

  @Get('regulatory-alerts')
  @ApiOperation({ summary: 'Get regulatory compliance alerts' })
  @ApiQuery({ name: 'severity', required: false, enum: AlertSeverity })
  @ApiQuery({ name: 'status', required: false, enum: AlertStatus })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Paginated list of regulatory alerts' })
  async getRegulatoryAlerts(
    @CurrentUser() user: User,
    @Query('severity') severity?: AlertSeverity,
    @Query('status') status?: AlertStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.sustainabilityService.getRegulatoryAlerts(user.tenantId, {
      severity,
      status,
      page,
      limit,
    });
  }

  @Patch('regulatory-alerts/:id/acknowledge')
  @ApiOperation({ summary: 'Acknowledge a regulatory alert' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Alert acknowledged', type: RegulatoryAlert })
  async acknowledgeAlert(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<RegulatoryAlert> {
    return this.sustainabilityService.acknowledgeAlert(id, user.id, user.tenantId);
  }

  @Patch('regulatory-alerts/:id/resolve')
  @ApiOperation({ summary: 'Resolve a regulatory alert' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Alert resolved', type: RegulatoryAlert })
  async resolveAlert(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body() body: { resolution?: string },
  ): Promise<RegulatoryAlert> {
    return this.sustainabilityService.resolveAlert(id, user.id, user.tenantId, body.resolution);
  }
}
