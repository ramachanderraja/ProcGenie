import {
  Controller,
  Get,
  Post,
  Put,
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
import { SupplierService } from './supplier.service';
import { CreateSupplierDto, UpdateSupplierDto, RiskScanDto } from './dto/supplier.dto';
import { SupplierStatus } from './entities/supplier.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../auth/entities/user.entity';

@ApiTags('Suppliers')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('suppliers')
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Post()
  @Roles('admin', 'procurement_manager', 'supplier_manager')
  @ApiOperation({ summary: 'Register a new supplier' })
  @ApiResponse({ status: 201, description: 'Supplier created successfully' })
  async create(
    @Body() dto: CreateSupplierDto,
    @CurrentUser() user: User,
  ) {
    return this.supplierService.create(dto, user.id, user.tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'List all suppliers with filtering' })
  @ApiQuery({ name: 'status', required: false, enum: SupplierStatus })
  @ApiQuery({ name: 'tier', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Paginated supplier list' })
  async findAll(
    @CurrentUser() user: User,
    @Query('status') status?: SupplierStatus,
    @Query('tier') tier?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.supplierService.findAll(user.tenantId, {
      status,
      tier,
      search,
      page,
      limit,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get supplier details' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Supplier details with documents and scores' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.supplierService.findOne(id, user.tenantId);
  }

  @Put(':id')
  @Roles('admin', 'procurement_manager', 'supplier_manager')
  @ApiOperation({ summary: 'Update supplier information' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Supplier updated' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSupplierDto,
    @CurrentUser() user: User,
  ) {
    return this.supplierService.update(id, dto, user.tenantId);
  }

  @Patch(':id/onboard')
  @Roles('admin', 'supplier_manager')
  @ApiOperation({ summary: 'Initiate supplier onboarding process' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Onboarding initiated' })
  async initiateOnboarding(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.supplierService.initiateOnboarding(id, user.tenantId);
  }

  @Patch(':id/onboard/complete')
  @Roles('admin', 'supplier_manager')
  @ApiOperation({ summary: 'Complete supplier onboarding' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Onboarding completed' })
  async completeOnboarding(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.supplierService.completeOnboarding(id, user.tenantId);
  }

  @Post(':id/risk-scan')
  @ApiOperation({ summary: 'Perform AI-powered risk scan on supplier' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Risk scan results' })
  async performRiskScan(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body() dto?: { deepScan?: boolean },
  ) {
    return this.supplierService.performRiskScan(id, user.tenantId, dto?.deepScan);
  }

  @Get(':id/performance')
  @ApiOperation({ summary: 'Get supplier performance history' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Performance scores over time' })
  async getPerformance(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.supplierService.getPerformanceHistory(id, user.tenantId);
  }

  @Get(':id/risk-profile')
  @ApiOperation({ summary: 'Get supplier risk profile' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Risk profile details' })
  async getRiskProfile(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.supplierService.getRiskProfile(id, user.tenantId);
  }
}
