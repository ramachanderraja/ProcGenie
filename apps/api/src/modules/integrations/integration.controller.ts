import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
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
import { IntegrationService } from './integration.service';
import { Integration, IntegrationStatus } from './entities/integration.entity';
import { SyncJob, SyncJobStatus } from './entities/sync-job.entity';
import { SyncDirection } from './entities/sync-job.entity';
import { Connector } from './entities/connector.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { User } from '../auth/entities/user.entity';

@Public()
@ApiTags('Integrations')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('integrations')
export class IntegrationController {
  constructor(private readonly integrationService: IntegrationService) {}

  // ── Integrations ───────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'List all configured integrations' })
  @ApiQuery({ name: 'status', required: false, enum: IntegrationStatus })
  @ApiQuery({ name: 'type', required: false })
  @ApiResponse({ status: 200, description: 'List of integrations' })
  async getIntegrations(
    @CurrentUser() user: User | undefined,
    @Query('status') status?: IntegrationStatus,
    @Query('type') type?: string,
  ): Promise<Integration[]> {
    return this.integrationService.getIntegrations((user?.tenantId || 'GEP'), { status, type });
  }

  @Get('connectors')
  @ApiOperation({ summary: 'Get available integration connectors' })
  @ApiResponse({ status: 200, description: 'List of available connectors' })
  async getConnectors(): Promise<Connector[]> {
    return this.integrationService.getAvailableConnectors();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get integration details' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Integration details', type: Integration })
  @ApiResponse({ status: 404, description: 'Integration not found' })
  async getIntegrationById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User | undefined,
  ): Promise<Integration> {
    return this.integrationService.getIntegrationById(id, (user?.tenantId || 'GEP'));
  }

  @Post()
  @ApiOperation({ summary: 'Create a new integration' })
  @ApiResponse({ status: 201, description: 'Integration created', type: Integration })
  async createIntegration(
    @Body() body: Partial<Integration>,
    @CurrentUser() user: User | undefined,
  ): Promise<Integration> {
    return this.integrationService.createIntegration(body, (user?.id || 'demo-user'), (user?.tenantId || 'GEP'));
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update integration configuration' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Integration updated', type: Integration })
  async updateIntegration(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: Partial<Integration>,
    @CurrentUser() user: User | undefined,
  ): Promise<Integration> {
    return this.integrationService.updateIntegration(id, body, (user?.tenantId || 'GEP'));
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate an integration' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Integration activated', type: Integration })
  async activateIntegration(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User | undefined,
  ): Promise<Integration> {
    return this.integrationService.activateIntegration(id, (user?.tenantId || 'GEP'));
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate an integration' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Integration deactivated', type: Integration })
  async deactivateIntegration(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User | undefined,
  ): Promise<Integration> {
    return this.integrationService.deactivateIntegration(id, (user?.tenantId || 'GEP'));
  }

  @Post(':id/test')
  @ApiOperation({ summary: 'Test integration connection' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Connection test result' })
  async testConnection(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User | undefined,
  ): Promise<{ success: boolean; message: string; latencyMs: number }> {
    return this.integrationService.testConnection(id, (user?.tenantId || 'GEP'));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an integration (must be inactive)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Integration deleted' })
  @ApiResponse({ status: 400, description: 'Cannot delete active integration' })
  async deleteIntegration(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User | undefined,
  ): Promise<{ message: string }> {
    await this.integrationService.deleteIntegration(id, (user?.tenantId || 'GEP'));
    return { message: 'Integration deleted successfully' };
  }

  // ── Sync Jobs ──────────────────────────────────────────────────────

  @Post(':id/sync')
  @ApiOperation({ summary: 'Trigger a data sync job' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 201, description: 'Sync job created', type: SyncJob })
  async triggerSync(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User | undefined,
    @Body() body: { entityType: string; direction: SyncDirection },
  ): Promise<SyncJob> {
    return this.integrationService.triggerSync(
      id,
      body.entityType,
      body.direction,
      (user?.id || 'demo-user'),
      (user?.tenantId || 'GEP'),
    );
  }

  @Get(':id/sync-jobs')
  @ApiOperation({ summary: 'Get sync job history for an integration' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiQuery({ name: 'status', required: false, enum: SyncJobStatus })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Paginated list of sync jobs' })
  async getSyncJobs(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User | undefined,
    @Query('status') status?: SyncJobStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.integrationService.getSyncJobs(id, (user?.tenantId || 'GEP'), {
      status,
      page,
      limit,
    });
  }

  @Patch('sync-jobs/:jobId/cancel')
  @ApiOperation({ summary: 'Cancel a queued or running sync job' })
  @ApiParam({ name: 'jobId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Sync job cancelled', type: SyncJob })
  async cancelSyncJob(
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @CurrentUser() user: User | undefined,
  ): Promise<SyncJob> {
    return this.integrationService.cancelSyncJob(jobId, (user?.tenantId || 'GEP'));
  }
}
