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
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto, UpdateInvoiceDto, OverrideMatchDto } from './dto/invoice.dto';
import { Invoice, InvoiceStatus } from './entities/invoice.entity';
import { ThreeWayMatch } from './entities/three-way-match.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../auth/entities/user.entity';

@ApiTags('Invoices')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new invoice' })
  @ApiResponse({ status: 201, description: 'Invoice created successfully', type: Invoice })
  @ApiResponse({ status: 400, description: 'Invalid invoice data' })
  async create(
    @Body() dto: CreateInvoiceDto,
    @CurrentUser() user: User,
  ): Promise<Invoice> {
    return this.invoiceService.create(dto, user.id, user.tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'List all invoices with filtering and pagination' })
  @ApiQuery({ name: 'status', required: false, enum: InvoiceStatus })
  @ApiQuery({ name: 'supplierId', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Paginated list of invoices' })
  async findAll(
    @CurrentUser() user: User,
    @Query('status') status?: InvoiceStatus,
    @Query('supplierId') supplierId?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.invoiceService.findAll(user.tenantId, {
      status,
      supplierId,
      search,
      page,
      limit,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific invoice by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Invoice details', type: Invoice })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<Invoice> {
    return this.invoiceService.findOne(id, user.tenantId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an invoice' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Invoice updated', type: Invoice })
  @ApiResponse({ status: 400, description: 'Cannot update invoice in current status' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInvoiceDto,
    @CurrentUser() user: User,
  ): Promise<Invoice> {
    return this.invoiceService.update(id, dto, user.id, user.tenantId);
  }

  @Post(':id/match')
  @ApiOperation({
    summary: 'Perform three-way match on an invoice',
    description: 'Matches invoice against purchase order and goods receipt to validate amounts and quantities',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Match result', type: ThreeWayMatch })
  @ApiResponse({ status: 400, description: 'Invoice must have a linked purchase order' })
  async performMatch(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<ThreeWayMatch> {
    return this.invoiceService.performThreeWayMatch(id, user.tenantId);
  }

  @Patch(':id/approve')
  @Roles('admin', 'procurement_manager', 'finance_manager', 'approver')
  @ApiOperation({ summary: 'Approve an invoice for payment' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Invoice approved', type: Invoice })
  async approve(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<Invoice> {
    return this.invoiceService.approveInvoice(id, user.id, user.tenantId);
  }

  @Patch(':id/schedule-payment')
  @Roles('admin', 'finance_manager')
  @ApiOperation({ summary: 'Schedule an approved invoice for payment' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Invoice scheduled for payment', type: Invoice })
  async schedulePayment(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<Invoice> {
    return this.invoiceService.schedulePayment(id, user.id, user.tenantId);
  }

  @Patch(':id/mark-paid')
  @Roles('admin', 'finance_manager')
  @ApiOperation({ summary: 'Mark an invoice as paid' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Invoice marked as paid', type: Invoice })
  async markPaid(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body() body: { paymentDate?: string },
  ): Promise<Invoice> {
    return this.invoiceService.markPaid(id, user.id, user.tenantId, body.paymentDate);
  }

  @Patch(':id/reject')
  @Roles('admin', 'procurement_manager', 'finance_manager')
  @ApiOperation({ summary: 'Reject an invoice' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Invoice rejected', type: Invoice })
  async reject(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body() body: { reason: string },
  ): Promise<Invoice> {
    return this.invoiceService.rejectInvoice(id, user.id, user.tenantId, body.reason);
  }

  @Get(':id/match-results')
  @ApiOperation({ summary: 'Get match results for an invoice' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'List of match results' })
  async getMatchResults(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<ThreeWayMatch[]> {
    return this.invoiceService.getMatchResults(id, user.tenantId);
  }

  @Patch('matches/:matchId/override')
  @Roles('admin', 'procurement_manager', 'finance_manager')
  @ApiOperation({ summary: 'Override a match exception with justification' })
  @ApiParam({ name: 'matchId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Match exception overridden', type: ThreeWayMatch })
  async overrideMatch(
    @Param('matchId', ParseUUIDPipe) matchId: string,
    @Body() dto: OverrideMatchDto,
    @CurrentUser() user: User,
  ): Promise<ThreeWayMatch> {
    return this.invoiceService.overrideMatchException(matchId, dto, user.id, user.tenantId);
  }
}
