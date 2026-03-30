import { Injectable, Logger } from '@nestjs/common';
import { AiService } from '../../common/services/ai.service';

const SYSTEM_PROMPT = `You are the ProcGenie Policy Assistant, an AI-powered procurement expert for a Fortune 500 enterprise Source-to-Pay platform.

You help employees with:
- Procurement policies and buying guidelines
- Approval workflows and authority limits
- Vendor onboarding and management
- Contract management and renewal processes
- Savings opportunities and cost optimization
- Compliance requirements (SOX, GDPR, ESG)
- AI agent capabilities and autonomous procurement features

Key policies to reference:
- Purchases under $5K: Auto-approved
- $5K-$25K: Manager approval required
- $25K-$100K: Director + Finance approval
- $100K-$500K: VP + Legal review
- Over $500K: C-Suite + Board review
- All purchases above $10K require competitive bidding (minimum 3 vendors)
- Formal RFP required for purchases above $50K
- New vendors require: W-9/W-8BEN, Certificate of Insurance, bank verification, compliance certs
- Contract renewal notifications sent 90 days before expiration
- Three-way matching enforced for all invoices
- ESG scoring required for suppliers above $100K annual spend

Be concise, helpful, and professional. Provide specific policy references when applicable.
If you don't know something, say so rather than making up policies.`;

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(private readonly aiService: AiService) {}

  async chat(
    message: string,
    history?: { role: string; content: string }[],
  ): Promise<{ response: string; timestamp: string }> {
    if (!this.aiService.isConfigured) {
      return {
        response: this.fallbackResponse(message),
        timestamp: new Date().toISOString(),
      };
    }

    try {
      // Build context from history
      let contextMessage = message;
      if (history && history.length > 0) {
        const recentHistory = history.slice(-6);
        const historyText = recentHistory
          .map((h) => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`)
          .join('\n');
        contextMessage = `Previous conversation:\n${historyText}\n\nUser: ${message}`;
      }

      const response = await this.aiService.chatCompletion(
        SYSTEM_PROMPT,
        contextMessage,
        { temperature: 0.5, maxTokens: 1024 },
      );

      return {
        response,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Chat failed: ${error.message}`, error.stack);
      return {
        response: this.fallbackResponse(message),
        timestamp: new Date().toISOString(),
      };
    }
  }

  private fallbackResponse(message: string): string {
    const lower = message.toLowerCase();

    if (lower.includes('policy') || lower.includes('rule') || lower.includes('guideline')) {
      return 'Our procurement policy requires all purchases above $10,000 to go through a competitive bidding process with at least 3 qualified vendors. For purchases above $50,000, a formal RFP is required with evaluation by the Sourcing Committee.';
    }
    if (lower.includes('approv') || lower.includes('workflow') || lower.includes('hierarchy')) {
      return 'The approval workflow follows this hierarchy: Under $5K - Auto-approved, $5K-$25K - Manager approval, $25K-$100K - Director + Finance, $100K-$500K - VP + Legal, Over $500K - C-Suite + Board review. AI agents can auto-route based on category and risk score.';
    }
    if (lower.includes('vendor') || lower.includes('supplier') || lower.includes('onboard')) {
      return 'To onboard a new vendor, submit a Vendor Registration Request through the Supplier Portal. Required documents include: W-9/W-8BEN, Certificate of Insurance, Bank verification letter, and compliance certifications. Our AI agent performs automated due diligence including sanctions screening, financial health check, and ESG assessment.';
    }
    if (lower.includes('contract') || lower.includes('renew') || lower.includes('expir')) {
      return 'Contract renewal notifications are sent 90 days before expiration. The AI Contract Analyst reviews terms, benchmarks pricing against market data, and flags unfavorable clauses. Auto-renewal contracts can be paused through the Contract Management module.';
    }
    if (lower.includes('saving') || lower.includes('cost') || lower.includes('spend') || lower.includes('budget')) {
      return 'Our AI Savings Scout has identified $2.4M in potential savings this quarter across tail spend consolidation ($890K), contract renegotiation ($720K), demand management ($480K), and supplier switching ($310K). The average realization rate is 68%.';
    }
    if (lower.includes('complian') || lower.includes('audit') || lower.includes('sox') || lower.includes('regulat')) {
      return 'ProcGenie enforces SOX compliance through automated three-way matching, segregation of duties controls, and immutable audit trails. All policy exceptions require documented justification and are flagged for quarterly compliance review.';
    }

    return 'I can help you with procurement policies, approval workflows, vendor onboarding, contract management, savings opportunities, and compliance requirements. What would you like to know more about?';
  }
}
