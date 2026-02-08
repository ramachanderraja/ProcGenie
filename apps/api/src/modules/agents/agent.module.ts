import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';
import { Agent } from './entities/agent.entity';
import { AgentTask } from './entities/agent-task.entity';
import { AgentDecisionLog } from './entities/agent-decision-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Agent, AgentTask, AgentDecisionLog])],
  controllers: [AgentController],
  providers: [AgentService],
  exports: [AgentService],
})
export class AgentModule {}
