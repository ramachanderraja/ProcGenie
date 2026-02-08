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
import { ContractService } from './contract.service';
import {
  CreateContractDto,
  UpdateContractDto,
  AnalyzeContractDto,
  ContractAnalysisResponseDto,
} from './dto/contract.dto';
import { Contract, ContractStatus } from './entities/contract.entity';
import { Obligation } from './entities/obligation.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../auth/entities/user.entity';

@ApiTags('Contracts')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('contracts')
export class ContractController {
  constructor(private readonly contractService: ContractService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new contract' })
  @ApiResponse({ status: 201, description: 'Contract created successfully', type: Contract })
  @ApiResponse({ status: 400, description: 'Invalid contract data' })
  async create(
    @Body() dto: CreateContractDto,
    @CurrentUser() user: User,
  ): Promise<Contract> {
    return this.contractService.create(dto, user.id, user.tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'List all contracts with filtering and pagination' })
  @ApiQuery({ name: 'status', required: false, enum: ContractStatus })
  @ApiQuery({ name: 'supplierId', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Paginated list of contracts' })
  async findAll(
    @CurrentUser() user: User,
    @Query('status') status?: ContractStatus,
    @Query('supplierId') supplierId?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.contractService.findAll(user.tenantId, {
      status,
      supplierId,
      search,
      page,
      limit,
    });
  }

  @Get('expiring')
  @ApiOperation({ summary: 'Get contracts expiring within a given period' })
  @ApiQuery({ name: 'daysAhead', required: false, type: Number, description: 'Number of days to look ahead (default 90)' })
  @ApiResponse({ status: 200, description: 'List of expiring contracts' })
  async getExpiringContracts(
    @CurrentUser() user: User,
    @Query('daysAhead') daysAhead?: number,
  ): Promise<Contract[]> {
    return this.contractService.getExpiringContracts(user.tenantId, daysAhead);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific contract by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Contract details', type: Contract })
  @ApiResponse({ status: 404, description: 'Contract not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<Contract> {
    return this.contractService.findOne(id, user.tenantId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a contract' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Contract updated successfully', type: Contract })
  @ApiResponse({ status: 400, description: 'Cannot update contract in current status' })
  @ApiResponse({ status: 404, description: 'Contract not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateContractDto,
    @CurrentUser() user: User,
  ): Promise<Contract> {
    return this.contractService.update(id, dto, user.id, user.tenantId);
  }

  @Patch(':id/submit-review')
  @ApiOperation({ summary: 'Submit a draft contract for review' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Contract submitted for review', type: Contract })
  @ApiResponse({ status: 400, description: 'Only draft contracts can be submitted for review' })
  async submitForReview(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<Contract> {
    return this.contractService.submitForReview(id, user.id, user.tenantId);
  }

  @Patch(':id/approve')
  @Roles('admin', 'procurement_manager', 'legal')
  @ApiOperation({ summary: 'Approve a contract' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Contract approved', type: Contract })
  async approve(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<Contract> {
    return this.contractService.approve(id, user.id, user.tenantId);
  }

  @Patch(':id/execute')
  @Roles('admin', 'procurement_manager', 'legal')
  @ApiOperation({ summary: 'Execute (activate) a contract' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Contract executed', type: Contract })
  async execute(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<Contract> {
    return this.contractService.execute(id, user.id, user.tenantId);
  }

  @Patch(':id/terminate')
  @Roles('admin', 'procurement_manager', 'legal')
  @ApiOperation({ summary: 'Terminate an active contract' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Contract terminated', type: Contract })
  async terminate(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body() body: { reason?: string },
  ): Promise<Contract> {
    return this.contractService.terminate(id, user.id, user.tenantId, body.reason);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a draft contract (soft delete)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Contract deleted successfully' })
  @ApiResponse({ status: 400, description: 'Only draft contracts can be deleted' })
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<{ message: string }> {
    await this.contractService.delete(id, user.tenantId);
    return { message: 'Contract deleted successfully' };
  }

  @Post('analyze')
  @ApiOperation({
    summary: 'AI-powered contract analysis',
    description: 'Analyzes contract text using AI to identify risks, missing clauses, obligations, and provide recommendations',
  })
  @ApiResponse({ status: 200, description: 'AI analysis results', type: ContractAnalysisResponseDto })
  async analyzeContract(
    @Body() dto: AnalyzeContractDto,
  ): Promise<ContractAnalysisResponseDto> {
    return this.contractService.analyzeContract(dto);
  }

  @Get(':id/obligations')
  @ApiOperation({ summary: 'Get all obligations for a contract' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'List of contract obligations' })
  async getObligations(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<Obligation[]> {
    return this.contractService.getObligations(id, user.tenantId);
  }
}
