export interface RawReferenceProject {
  project_id: string;
  name: string;
  city: string;
  project_type: string;
  scene: string;
  summary: string;
  source_url?: string;
  source_label?: string;
  library_source?: string;
  keywords?: string[];
  target_users?: string[];
  highlights?: string[];
}

export interface RawProjectLibrary {
  projects: RawReferenceProject[];
}

export interface SiteSuggestionRule {
  id: string;
  title: string;
  keywords: string[];
  summary: string;
  suggestions: string[];
  constraints: string[];
}

export interface ComplianceRules {
  accessible_keywords: string[];
  protective_keywords: string[];
  wetland_keywords: string[];
  required_zone_keywords: Record<string, string>;
  toxic_plants: Record<string, string>;
  max_accessible_slope: number;
  site_suggestion_rules: SiteSuggestionRule[];
}
