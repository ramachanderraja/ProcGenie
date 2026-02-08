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
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../auth/entities/user.entity';

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
    @CurrentUser() user: User,
    @Query('status') status?: IntegrationStatus,
    @Query('type') type?: string,
  ): Promise<Integration[]> {
    return this.integrationService.getIntegrations(user.tenantId, { status, type });
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
    @CurrentUser() user: User,
  ): Promise<Integration> {
    return this.integrationService.getIntegrationById(id, user.tenantId);
  }

  @Post()
  @Roles('admin', 'it_admin')
  @ApiOperation({ summary: 'Create a new integration' })
  @ApiResponse({ status: 201, description: 'Integration created', type: Integration })
  async createIntegration(
    @Body() body: Partial<Integration>,
    @CurrentUser() user: User,
  ): Promise<Integration> {
    return this.integrationService.createIntegration(body, user.id, user.tenantId);
  }

  @Put(':id')
  @Roles('admin', 'it_admin')
  @ApiOperation({ summary: 'Update integration configuration' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Integration updated', type: Integration })
  async updateIntegration(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: Partial<Integration>,
    @CurrentUser() user: User,
  ): Promise<Integration> {
    return this.integrationService.updateIntegration(id, body, user.tenantId);
  }

  @Patch(':id/activate')
  @Roles('admin', 'it_admin')
  @ApiOperation({ summary: 'Activate an integration' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Integration activated', type: Integration })
  async activateIntegration(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<Integration> {
    return this.integrationService.activateIntegration(id, user.tenantId);
  }

  @Patch(':id/deactivate')
  @Roles('admin', 'it_admin')
  @ApiOperation({ summary: 'Deactivate an integration' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Integration deactivated', type: Integration })
  async deactivateIntegration(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<Integration> {
    return this.integrationService.deactivateIntegration(id, user.tenantId);
  }

  @Post(':id/test')
  @ApiOperation({ summary: 'Test integration connection' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Connection test result' })
  async testConnection(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<{ success: boolean; message: string; latencyMs: number }> {
    return this.integrationService.testConnection(id, user.tenantId);
  }

  @Delete(':id')
  @Roles('admin', 'it_admin')
  @ApiOperation({ summary: 'Delete an integration (must be inactive)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Integration deleted' })
  @ApiResponse({ status: 400, description: 'Cannot delete active integration' })
  async deleteIntegration(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<{ message: string }> {
    await this.integrationService.deleteIntegration(id, user.tenantId);
    return { message: 'Integration deleted successfully' };
  }

  // ── Sync Jobs ──────────────────────────────────────────────────────

  @Post(':id/sync')
  @ApiOperation({ summary: 'Trigger a data sync job' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 201, description: 'Sync job created', type: SyncJob })
  async triggerSync(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body() body: { entityType: string; direction: SyncDirection },
  ): Promise<SyncJob> {
    return this.integrationService.triggerSync(
      id,
      body.entityType,
      body.direction,
      user.id,
      user.tenantId,
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
    @CurrentUser() user: User,
    @Query('status') status?: SyncJobStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.integrationService.getSyncJobs(id, user.tenantId, {
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
    @CurrentUser() user: User,
  ): Promise<SyncJob> {
    return this.integrationService.cancelSyncJob(jobId, user.tenantId);
  }
}
