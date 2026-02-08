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
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { IntakeService } from './intake.service';
import {
  CreateRequestDto,
  UpdateRequestDto,
  AnalyzeIntakeDto,
  IntakeAnalysisResponseDto,
} from './dto/intake.dto';
import { Request, RequestStatus } from './entities/request.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../auth/entities/user.entity';

@ApiTags('Intake')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('intake/requests')
export class IntakeController {
  constructor(private readonly intakeService: IntakeService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new purchase request' })
  @ApiResponse({ status: 201, description: 'Request created successfully', type: Request })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  async create(
    @Body() dto: CreateRequestDto,
    @CurrentUser() user: User,
  ): Promise<Request> {
    return this.intakeService.createRequest(dto, user.id, user.tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'List all purchase requests with filtering and pagination' })
  @ApiQuery({ name: 'status', required: false, enum: RequestStatus })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Paginated list of requests' })
  async findAll(
    @CurrentUser() user: User,
    @Query('status') status?: RequestStatus,
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.intakeService.findAll(user.tenantId, {
      status,
      category,
      search,
      page,
      limit,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific purchase request by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Request details', type: Request })
  @ApiResponse({ status: 404, description: 'Request not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<Request> {
    return this.intakeService.findOne(id, user.tenantId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a purchase request' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Request updated successfully', type: Request })
  @ApiResponse({ status: 400, description: 'Cannot update request in current status' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRequestDto,
    @CurrentUser() user: User,
  ): Promise<Request> {
    return this.intakeService.update(id, dto, user.id, user.tenantId);
  }

  @Patch(':id/submit')
  @ApiOperation({ summary: 'Submit a draft request for approval' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Request submitted successfully', type: Request })
  @ApiResponse({ status: 400, description: 'Only draft requests can be submitted' })
  async submit(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<Request> {
    return this.intakeService.submit(id, user.id, user.tenantId);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a request' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Request cancelled successfully', type: Request })
  async cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<Request> {
    return this.intakeService.cancel(id, user.id, user.tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a draft request (soft delete)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Request deleted successfully' })
  @ApiResponse({ status: 400, description: 'Only draft requests can be deleted' })
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<{ message: string }> {
    await this.intakeService.delete(id, user.tenantId);
    return { message: 'Request deleted successfully' };
  }

  @Post('analyze')
  @ApiOperation({
    summary: 'AI-powered intake analysis',
    description: 'Analyzes a procurement request using AI to suggest category, suppliers, cost estimates, and risk assessment',
  })
  @ApiResponse({
    status: 200,
    description: 'AI analysis results',
    type: IntakeAnalysisResponseDto,
  })
  async analyzeIntake(
    @Body() dto: AnalyzeIntakeDto,
  ): Promise<IntakeAnalysisResponseDto> {
    return this.intakeService.analyzeIntake(dto);
  }

  @Get('templates/list')
  @ApiOperation({ summary: 'Get available request templates' })
  @ApiResponse({ status: 200, description: 'List of request templates' })
  async getTemplates(@CurrentUser() user: User) {
    return this.intakeService.getTemplates(user.tenantId);
  }

  @Post('drafts/save')
  @ApiOperation({ summary: 'Save or auto-save a request draft' })
  @ApiResponse({ status: 201, description: 'Draft saved successfully' })
  async saveDraft(
    @CurrentUser() user: User,
    @Body() body: { formData: Record<string, unknown>; step: number },
  ) {
    return this.intakeService.saveDraft(
      user.id,
      user.tenantId,
      body.formData,
      body.step,
    );
  }
}
