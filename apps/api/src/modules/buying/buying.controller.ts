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
import { BuyingService } from './buying.service';
import {
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto,
  CreateGoodsReceiptDto,
} from './dto/buying.dto';
import { PoStatus } from './entities/purchase-order.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../auth/entities/user.entity';

@ApiTags('Buying')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('buying')
export class PurchaseOrderController {
  constructor(private readonly buyingService: BuyingService) {}

  @Post('purchase-orders')
  @ApiOperation({ summary: 'Create a new purchase order' })
  @ApiResponse({ status: 201, description: 'Purchase order created' })
  async createPo(
    @Body() dto: CreatePurchaseOrderDto,
    @CurrentUser() user: User,
  ) {
    return this.buyingService.createPurchaseOrder(dto, user.id, user.tenantId);
  }

  @Get('purchase-orders')
  @ApiOperation({ summary: 'List all purchase orders' })
  @ApiQuery({ name: 'status', required: false, enum: PoStatus })
  @ApiQuery({ name: 'supplierId', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Paginated list of purchase orders' })
  async findAllPos(
    @CurrentUser() user: User,
    @Query('status') status?: PoStatus,
    @Query('supplierId') supplierId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.buyingService.findAllPurchaseOrders(user.tenantId, {
      status,
      supplierId,
      page,
      limit,
    });
  }

  @Get('purchase-orders/:id')
  @ApiOperation({ summary: 'Get purchase order details' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Purchase order details' })
  @ApiResponse({ status: 404, description: 'Purchase order not found' })
  async findOnePo(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.buyingService.findPurchaseOrder(id, user.tenantId);
  }

  @Put('purchase-orders/:id')
  @ApiOperation({ summary: 'Update a purchase order' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Purchase order updated' })
  async updatePo(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePurchaseOrderDto,
    @CurrentUser() user: User,
  ) {
    return this.buyingService.updatePurchaseOrder(id, dto, user.tenantId);
  }

  @Patch('purchase-orders/:id/submit')
  @ApiOperation({ summary: 'Submit PO for approval' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'PO submitted for approval' })
  async submitPo(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.buyingService.submitForApproval(id, user.tenantId);
  }

  @Patch('purchase-orders/:id/approve')
  @Roles('admin', 'procurement_manager', 'approver')
  @ApiOperation({ summary: 'Approve a purchase order' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'PO approved' })
  async approvePo(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.buyingService.approvePurchaseOrder(id, user.tenantId);
  }

  @Patch('purchase-orders/:id/send')
  @ApiOperation({ summary: 'Send PO to supplier' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'PO sent to supplier' })
  async sendPo(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.buyingService.sendToSupplier(id, user.tenantId);
  }

  // Goods Receipts
  @Post('goods-receipts')
  @ApiOperation({ summary: 'Create a goods receipt' })
  @ApiResponse({ status: 201, description: 'Goods receipt created' })
  async createGr(
    @Body() dto: CreateGoodsReceiptDto,
    @CurrentUser() user: User,
  ) {
    return this.buyingService.createGoodsReceipt(dto, user.id, user.tenantId);
  }

  @Get('goods-receipts/:poId')
  @ApiOperation({ summary: 'Get goods receipts for a PO' })
  @ApiParam({ name: 'poId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'List of goods receipts' })
  async getGoodsReceipts(
    @Param('poId', ParseUUIDPipe) poId: string,
    @CurrentUser() user: User,
  ) {
    return this.buyingService.getGoodsReceipts(poId, user.tenantId);
  }

  // Catalog
  @Get('catalog')
  @ApiOperation({ summary: 'Browse catalog items' })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiResponse({ status: 200, description: 'List of catalog items' })
  async getCatalog(
    @CurrentUser() user: User,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.buyingService.getCatalogItems(user.tenantId, category, search);
  }
}
