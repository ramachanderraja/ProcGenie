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
import { SourcingService } from './sourcing.service';
import {
  CreateSourcingProjectDto,
  UpdateSourcingProjectDto,
  CreateBidDto,
  EvaluateBidDto,
  AwardBidDto,
} from './dto/sourcing.dto';
import { SourcingProject, SourcingStatus } from './entities/sourcing-project.entity';
import { Bid } from './entities/bid.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../auth/entities/user.entity';

@ApiTags('Sourcing')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sourcing')
export class SourcingController {
  constructor(private readonly sourcingService: SourcingService) {}

  // ── Projects ───────────────────────────────────────────────────────

  @Post('projects')
  @ApiOperation({ summary: 'Create a new sourcing project' })
  @ApiResponse({ status: 201, description: 'Sourcing project created successfully', type: SourcingProject })
  @ApiResponse({ status: 400, description: 'Invalid project data' })
  async createProject(
    @Body() dto: CreateSourcingProjectDto,
    @CurrentUser() user: User,
  ): Promise<SourcingProject> {
    return this.sourcingService.createProject(dto, user.id, user.tenantId);
  }

  @Get('projects')
  @ApiOperation({ summary: 'List all sourcing projects with filtering and pagination' })
  @ApiQuery({ name: 'status', required: false, enum: SourcingStatus })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Paginated list of sourcing projects' })
  async findAllProjects(
    @CurrentUser() user: User,
    @Query('status') status?: SourcingStatus,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.sourcingService.findAllProjects(user.tenantId, {
      status,
      search,
      page,
      limit,
    });
  }

  @Get('projects/:id')
  @ApiOperation({ summary: 'Get a specific sourcing project by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Sourcing project details', type: SourcingProject })
  @ApiResponse({ status: 404, description: 'Sourcing project not found' })
  async findOneProject(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<SourcingProject> {
    return this.sourcingService.findOneProject(id, user.tenantId);
  }

  @Put('projects/:id')
  @ApiOperation({ summary: 'Update a sourcing project' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Sourcing project updated', type: SourcingProject })
  @ApiResponse({ status: 400, description: 'Cannot update project in current status' })
  async updateProject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSourcingProjectDto,
    @CurrentUser() user: User,
  ): Promise<SourcingProject> {
    return this.sourcingService.updateProject(id, dto, user.id, user.tenantId);
  }

  @Patch('projects/:id/publish')
  @ApiOperation({ summary: 'Publish a sourcing project for supplier visibility' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Project published', type: SourcingProject })
  async publishProject(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<SourcingProject> {
    return this.sourcingService.publishProject(id, user.id, user.tenantId);
  }

  @Patch('projects/:id/open-bidding')
  @ApiOperation({ summary: 'Open the bidding period for a sourcing project' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Bidding opened', type: SourcingProject })
  async openBidding(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<SourcingProject> {
    return this.sourcingService.openBidding(id, user.id, user.tenantId);
  }

  @Patch('projects/:id/close-bidding')
  @ApiOperation({ summary: 'Close the bidding period for a sourcing project' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Bidding closed', type: SourcingProject })
  async closeBidding(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<SourcingProject> {
    return this.sourcingService.closeBidding(id, user.id, user.tenantId);
  }

  @Patch('projects/:id/award')
  @Roles('admin', 'procurement_manager', 'sourcing_manager')
  @ApiOperation({ summary: 'Award a sourcing project to a winning bidder' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Project awarded', type: SourcingProject })
  async awardProject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AwardBidDto,
    @CurrentUser() user: User,
  ): Promise<SourcingProject> {
    return this.sourcingService.awardProject(id, dto, user.id, user.tenantId);
  }

  @Delete('projects/:id')
  @ApiOperation({ summary: 'Delete a draft sourcing project (soft delete)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Sourcing project deleted' })
  @ApiResponse({ status: 400, description: 'Only draft projects can be deleted' })
  async deleteProject(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<{ message: string }> {
    await this.sourcingService.deleteProject(id, user.tenantId);
    return { message: 'Sourcing project deleted successfully' };
  }

  // ── Bids ───────────────────────────────────────────────────────────

  @Post('bids')
  @ApiOperation({ summary: 'Create a new bid for a sourcing project' })
  @ApiResponse({ status: 201, description: 'Bid created successfully', type: Bid })
  @ApiResponse({ status: 400, description: 'Bidding is not open for this project' })
  async createBid(
    @Body() dto: CreateBidDto,
    @CurrentUser() user: User,
  ): Promise<Bid> {
    return this.sourcingService.createBid(dto, user.id, user.tenantId);
  }

  @Patch('bids/:id/submit')
  @ApiOperation({ summary: 'Submit a draft bid' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Bid submitted', type: Bid })
  async submitBid(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<Bid> {
    return this.sourcingService.submitBid(id, user.id, user.tenantId);
  }

  @Patch('bids/:id/evaluate')
  @Roles('admin', 'procurement_manager', 'sourcing_manager')
  @ApiOperation({ summary: 'Evaluate and score a bid' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Bid evaluated', type: Bid })
  async evaluateBid(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: EvaluateBidDto,
    @CurrentUser() user: User,
  ): Promise<Bid> {
    return this.sourcingService.evaluateBid(id, dto, user.id, user.tenantId);
  }

  @Get('projects/:id/bids')
  @ApiOperation({ summary: 'Get all bids for a sourcing project' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'List of bids for the project' })
  async getBidsForProject(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<Bid[]> {
    return this.sourcingService.getBidsForProject(id, user.tenantId);
  }
}
