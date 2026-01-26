// Campaign Mode Types
export type CampaignMode = 'discovery' | 'directed';
export type CampaignGoalType = 'awareness' | 'consideration' | 'conversion' | 'retention';
export type CampaignOutcome = 'worked' | 'didnt_work' | 'mixed' | 'pending';
export type StrategyCheckResult = 'shown' | 'accepted' | 'overridden' | 'dismissed';

// Message Strategy Types
export interface MessageStrategyOption {
  id: string;
  name: string;
  core_message: string;
  angle: string;
  rationale: string;
  best_for?: string[];
}

export interface SelectedMessageStrategy extends MessageStrategyOption {
  user_refinements?: string;
}

// Media Strategy Types
export interface MediaChannelRecommendation {
  channel: string;
  role: string;
  budget_allocation?: string;
  rationale?: string;
}

export interface MediaStrategyOptions {
  recommended: MediaChannelRecommendation[];
  not_recommended: { channel: string; reason: string }[];
}

export interface SelectedMediaChannel {
  channel: string;
  role: string;
  budget_allocation?: string;
}

// Campaign Types
export interface Campaign {
  id: string;
  user_id: string;
  brand_id: string;

  // Basic info
  name: string;
  mode: CampaignMode;
  discipline?: string;

  // Discovery Mode brief (rich)
  business_problem?: string;
  success_metric?: string;
  success_metric_value?: string;
  timeline?: string;
  budget?: string;
  campaign_constraints?: string;
  what_been_tried?: string;

  // Directed Mode brief (light)
  goal_type?: CampaignGoalType;
  goal_description?: string;
  campaign_mandatories?: string[];

  // Message Strategy
  message_strategy_options?: MessageStrategyOption[];
  selected_message_strategy?: SelectedMessageStrategy;

  // Media Strategy
  media_strategy_options?: MediaStrategyOptions;
  selected_media_strategy?: SelectedMediaChannel[];

  // Strategy Check (Directed)
  strategy_check_shown?: boolean;
  strategy_check_recommendation?: string;
  strategy_check_user_response?: StrategyCheckResult;

  // Performance Memory
  outcome?: CampaignOutcome;
  outcome_notes?: string;
  outcome_metrics?: Record<string, any>;
  outcome_recorded_at?: string;
  ai_generated_learning?: string;

  // Metadata
  created_at: string;
  updated_at: string;
  completed_at?: string;
  archived_at?: string;
}

// Strategy Check Types
export interface StrategyCheck {
  id: string;
  user_id: string;
  campaign_id?: string;
  discipline: string;
  goal_type?: CampaignGoalType;
  goal_description?: string;
  misalignment_severity?: 'none' | 'mild' | 'strong';
  recommendation_shown?: string;
  alternative_disciplines?: string[];
  check_result: StrategyCheckResult;
  created_at: string;
}

// Extended Project (Brand Profile) with new fields
export interface Project {
  id: string;
  user_id: string;
  name: string;
  website: string;
  industry: string;
  challenge: string;
  target_audience: string;
  brand_voice: string;
  // New v1.1 fields
  value_proposition?: string;
  persistent_mandatories?: string[];
  persistent_constraints?: string;
  // Metadata
  created_at: string;
  updated_at: string;
}

// Campaign Context for AI Prompt Injection
export interface CampaignContext {
  name: string;
  mode: CampaignMode;
  businessProblem?: string;
  goalType?: CampaignGoalType;
  goalDescription?: string;
  successMetric?: string;
  successMetricValue?: string;
  timeline?: string;
  budget?: string;
  campaignConstraints?: string;
  campaignMandatories?: string[];
  whatBeenTried?: string;
  selectedMessageStrategy?: SelectedMessageStrategy;
  selectedMediaStrategy?: SelectedMediaChannel[];
}

// Brand Context for AI Prompt Injection
export interface BrandContext {
  name: string;
  website?: string;
  industry: string;
  targetAudience?: string;
  brandVoice?: string;
  valueProposition?: string;
  persistentMandatories?: string[];
  persistentConstraints?: string;
  challenge?: string;
}

// Discovery Mode Brief Form Data
export interface DiscoveryBriefFormData {
  campaignName: string;
  businessProblem: string;
  successMetric?: string;
  successMetricValue?: string;
  timeline?: string;
  budget?: string;
  campaignConstraints?: string;
  whatBeenTried?: string;
}

// Directed Mode Brief Form Data
export interface DirectedBriefFormData {
  campaignName: string;
  goalType: CampaignGoalType;
  goalDescription?: string;
  campaignMandatories?: string[];
  discipline: string;
}

// Campaign Flow Step Types
export type CampaignFlowStep =
  | 'mode-select'
  | 'brand-select'
  | 'discovery-brief'
  | 'message-strategy'
  | 'media-strategy'
  | 'directed-brief'
  | 'strategy-check'
  | 'discipline-select'
  | 'execution';
