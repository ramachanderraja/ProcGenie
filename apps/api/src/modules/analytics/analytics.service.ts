import {
  Injectable,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface SpendDashboardData {
  totalSpend: number;
  totalSavings: number;
  savingsPercentage: number;
  contractCompliance: number;
  activePOs: number;
  pendingInvoices: number;
  spendByCategory: { category: string; amount: number; percentage: number }[];
  spendBySupplier: { supplier: string; amount: number; poCount: number }[];
  spendTrend: { month: string; spend: number; budget: number }[];
  topSuppliers: { name: string; spend: number; contracts: number; rating: number }[];
}

export interface SavingsWaterfallData {
  negotiatedSavings: number;
  competitiveBidSavings: number;
  demandReduction: number;
  processEfficiency: number;
  contractConsolidation: number;
  earlyPaymentDiscounts: number;
  totalSavings: number;
  savingsByQuarter: { quarter: string; actual: number; target: number }[];
}

export interface SpendTrendData {
  period: string;
  totalSpend: number;
  directSpend: number;
  indirectSpend: number;
  budget: number;
  forecast: number;
}

export interface NLQueryResult {
  query: string;
  interpretation: string;
  data: Record<string, unknown>;
  visualization: string;
  confidence: number;
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly configService: ConfigService) {}

  async getSpendDashboard(
    tenantId: string,
    options?: { startDate?: string; endDate?: string; category?: string },
  ): Promise<SpendDashboardData> {
    this.logger.log(`Generating spend dashboard for tenant ${tenantId}`);

    // In production, this would aggregate data from PO, invoice, and contract tables
    return {
      totalSpend: 24_500_000,
      totalSavings: 3_200_000,
      savingsPercentage: 13.1,
      contractCompliance: 87.5,
      activePOs: 342,
      pendingInvoices: 89,
      spendByCategory: [
        { category: 'IT Equipment', amount: 8_200_000, percentage: 33.5 },
        { category: 'Professional Services', amount: 5_800_000, percentage: 23.7 },
        { category: 'Office Supplies', amount: 3_100_000, percentage: 12.7 },
        { category: 'Software Licenses', amount: 4_200_000, percentage: 17.1 },
        { category: 'Facilities', amount: 2_100_000, percentage: 8.6 },
        { category: 'Travel & Events', amount: 1_100_000, percentage: 4.4 },
      ],
      spendBySupplier: [
        { supplier: 'Dell Technologies', amount: 4_500_000, poCount: 45 },
        { supplier: 'Accenture', amount: 3_200_000, poCount: 12 },
        { supplier: 'Microsoft', amount: 2_800_000, poCount: 8 },
        { supplier: 'AWS', amount: 2_100_000, poCount: 6 },
        { supplier: 'Deloitte', amount: 1_900_000, poCount: 15 },
      ],
      spendTrend: [
        { month: '2025-01', spend: 1_950_000, budget: 2_000_000 },
        { month: '2025-02', spend: 2_100_000, budget: 2_000_000 },
        { month: '2025-03', spend: 1_800_000, budget: 2_000_000 },
        { month: '2025-04', spend: 2_300_000, budget: 2_100_000 },
        { month: '2025-05', spend: 2_050_000, budget: 2_100_000 },
        { month: '2025-06', spend: 1_750_000, budget: 2_100_000 },
      ],
      topSuppliers: [
        { name: 'Dell Technologies', spend: 4_500_000, contracts: 3, rating: 4.5 },
        { name: 'Accenture', spend: 3_200_000, contracts: 5, rating: 4.2 },
        { name: 'Microsoft', spend: 2_800_000, contracts: 2, rating: 4.8 },
        { name: 'AWS', spend: 2_100_000, contracts: 1, rating: 4.6 },
        { name: 'Deloitte', spend: 1_900_000, contracts: 4, rating: 4.0 },
      ],
    };
  }

  async getSavingsWaterfall(
    tenantId: string,
    options?: { year?: number },
  ): Promise<SavingsWaterfallData> {
    this.logger.log(`Generating savings waterfall for tenant ${tenantId}`);

    return {
      negotiatedSavings: 1_200_000,
      competitiveBidSavings: 850_000,
      demandReduction: 420_000,
      processEfficiency: 380_000,
      contractConsolidation: 250_000,
      earlyPaymentDiscounts: 100_000,
      totalSavings: 3_200_000,
      savingsByQuarter: [
        { quarter: 'Q1 2025', actual: 720_000, target: 800_000 },
        { quarter: 'Q2 2025', actual: 880_000, target: 800_000 },
        { quarter: 'Q3 2025', actual: 850_000, target: 800_000 },
        { quarter: 'Q4 2025', actual: 750_000, target: 800_000 },
      ],
    };
  }

  async getSpendTrends(
    tenantId: string,
    options?: { period?: string; months?: number },
  ): Promise<SpendTrendData[]> {
    this.logger.log(`Generating spend trends for tenant ${tenantId}`);

    const months = options?.months || 12;

    const trends: SpendTrendData[] = [];
    const baseDate = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(baseDate);
      date.setMonth(date.getMonth() - i);
      const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      trends.push({
        period,
        totalSpend: 1_800_000 + Math.random() * 600_000,
        directSpend: 1_200_000 + Math.random() * 300_000,
        indirectSpend: 600_000 + Math.random() * 300_000,
        budget: 2_100_000,
        forecast: 2_000_000 + Math.random() * 200_000,
      });
    }

    return trends;
  }

  async naturalLanguageQuery(
    tenantId: string,
    query: string,
  ): Promise<NLQueryResult> {
    this.logger.log(`Processing NL query for tenant ${tenantId}: ${query}`);

    if (!query || query.trim().length === 0) {
      throw new BadRequestException('Query string cannot be empty');
    }

    try {
      const apiKey = this.configService.get<string>('ai.anthropicApiKey');

      if (apiKey && apiKey !== 'sk-ant-your-api-key-here') {
        return await this.performAiQuery(tenantId, query);
      }

      return this.mockNlQuery(query);
    } catch (error) {
      this.logger.error(`NL query failed: ${error.message}`, error.stack);
      return this.mockNlQuery(query);
    }
  }

  async getCycleTimeMetrics(
    tenantId: string,
  ): Promise<Record<string, unknown>> {
    this.logger.log(`Generating cycle time metrics for tenant ${tenantId}`);

    return {
      averageRequisitionToPoTime: 4.2,
      averagePoToReceiptTime: 12.5,
      averageInvoiceProcessingTime: 3.8,
      averageApprovalTime: 1.5,
      averageContractNegotiationTime: 21.3,
      processingTimeByCategory: [
        { category: 'IT Equipment', avgDays: 5.2 },
        { category: 'Professional Services', avgDays: 8.7 },
        { category: 'Office Supplies', avgDays: 2.1 },
        { category: 'Software Licenses', avgDays: 6.4 },
      ],
      automationRate: 62.5,
      touchlessProcessingRate: 45.8,
    };
  }

  private async performAiQuery(
    tenantId: string,
    query: string,
  ): Promise<NLQueryResult> {
    // Placeholder for actual Anthropic SDK call
    return this.mockNlQuery(query);
  }

  private mockNlQuery(query: string): NLQueryResult {
    return {
      query,
      interpretation: `Analyzing procurement data for: "${query}"`,
      data: {
        summary: 'Based on the analysis of procurement data from the last 12 months',
        totalRecords: 1247,
        keyInsight: 'IT Equipment spending has increased 15% YoY, driven by remote workforce expansion',
        topCategory: 'IT Equipment ($8.2M)',
        recommendation: 'Consider consolidating IT hardware suppliers to leverage volume discounts',
        details: [
          { metric: 'Total Spend', value: '$24.5M', trend: 'up 8%' },
          { metric: 'Active Suppliers', value: 156, trend: 'down 12%' },
          { metric: 'Contract Coverage', value: '87.5%', trend: 'up 5%' },
          { metric: 'Average PO Value', value: '$71,637', trend: 'up 3%' },
        ],
      },
      visualization: 'bar_chart',
      confidence: 82,
    };
  }
}
