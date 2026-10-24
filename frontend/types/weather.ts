export type SeverityLevel = "low" | "moderate" | "high" | "severe";

export interface TrajectoryPoint {
  time_offset: string;
  location_name: string;
  latitude: number;
  longitude: number;
  intensity: string;
  anomaly_score: number;
  efi: number;
  wind_speed_kmh: number;
  rainfall_mm_h: number;
  surface_pressure_hpa: number;
  confidence: number;
  stage_description?: string;
}

export interface AnomalyEvent {
  id: string;
  event_type: string;
  location: string;
  region: string;
  latitude: number;
  longitude: number;
  severity: SeverityLevel;
  confidence: number;
  efi: number;
  anomaly_score: number;
  impact_radius_km: number;
  forecast_window_hours: number;
  timestamp: string;
  temperature_c: number;
  rainfall_mm_h: number;
  wind_speed_kmh: number;
  surface_pressure_hpa: number;
  movement_description: string;
  trajectory?: TrajectoryPoint[];
}

export interface DashboardMetrics {
  active_anomalies: number;
  severe_events: number;
  tracked_regions: number;
  forecast_horizon: string;
  model_confidence: number;
  physics_consistency_score: number;
  data_timestamp: string;
  system_status: string;
  ai_model_status: string;
  downscaling_resolution: string;
}

export interface CriticalExposureItem {
  name: string;
  category: "HOSPITAL" | "TRANSPORT" | "WATER_BODY" | "POPULATION_ZONE";
  latitude: number;
  longitude: number;
  distance_km: number;
  risk_impact: string;
}

export interface ExposureStats {
  exposed_population_estimate: number;
  critical_infrastructure_count: number;
  hospitals: CriticalExposureItem[];
  transport_arteries: CriticalExposureItem[];
  water_bodies: CriticalExposureItem[];
  open_data_sources: string[];
}

export interface AlertItem {
  id: string;
  severity: SeverityLevel;
  event_type: string;
  region: string;
  location: string;
  latitude: number;
  longitude: number;
  expected_window: string;
  impact_radius_km: number;
  confidence: number;
  status: "ACTIVE" | "UPCOMING" | "RESOLVED";
  created_at: string;
  advisory_headline: string;
  advisory_body: string;
  recommended_actions: string[];
  exposure?: ExposureStats;
  cap_identifier?: string;
  cap_xml_url?: string;
  cap_json_url?: string;
}

export interface RiskZone {
  location: string;
  region: string;
  latitude: number;
  longitude: number;
  impact_radius_km: number;
  overall_risk: "LOW" | "MODERATE" | "HIGH" | "SEVERE";
  flash_flood_risk: string;
  wind_risk: string;
  rainfall_risk: string;
  drainage_vulnerability: string;
  terrain_factor: string;
  population_density_exposure: string;
  key_vulnerabilities: string[];
  immediate_actions: string[];
  layers: Record<string, number>;
  disclaimer?: string;
}

export interface ForecastVariableSeries {
  variable: string;
  unit: string;
  timestamps: string[];
  nwp_12km: number[];
  ai_5km: number[];
  historical_baseline: number[];
}

export interface ForecastResponse {
  location: string;
  forecast_horizon_hours: number;
  model_confidence: number;
  summary: string;
  variables: Record<string, ForecastVariableSeries>;
}

export interface PhysicsCheck {
  name: string;
  passed: boolean;
  score: number;
  description: string;
}

export interface DownscaleResult {
  anomaly_id: string;
  location: string;
  variable: string;
  input_resolution_km: number;
  output_resolution_km: number;
  preserved_extreme_signal: number;
  model_confidence: number;
  physics_score: number;
  execution_time_ms: number;
  physics_checks: PhysicsCheck[];
  coarse_grid_12km: number[][];
  downscaled_grid_5km: number[][];
  summary: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  factsUsed?: Record<string, any>;
  confidence?: number;
}

export interface LocalityRiskPoint {
  name: string;
  latitude: number;
  longitude: number;
  distance_from_core_km: number;
  precipitation_rate_mm_h: number;
  vulnerability_score: number;
  risk_level: string;
  vulnerability_factor: string;
}

export interface ConcentricRing {
  label: string;
  radius_km: number;
  risk_level: string;
  color: string;
  fill_opacity: number;
}

export interface ImpactZoneDetail {
  anomaly_id: string;
  location: string;
  region: string;
  event_type: string;
  severity: string;
  center_lat: number;
  center_lon: number;
  impact_radius_km: number;
  efi: number;
  anomaly_score: number;
  confidence: number;
  forecast_time: string;
  concentric_rings: ConcentricRing[];
  affected_localities: LocalityRiskPoint[];
  downscaled_grid_dim: string;
  downscaling_method: string;
  timestamp: string;
}

export interface ExplainFactor {
  factor: string;
  value: string;
  severity: "LOW" | "MODERATE" | "HIGH" | "EXTREME";
  description: string;
}

export interface EvidenceChip {
  id: string;
  field_key: string;
  label: string;
  value: string;
  verification_source: string;
}

export interface EvidenceLinkedSentence {
  sentence: string;
  chips: EvidenceChip[];
}

export interface AnomalyExplainResponse {
  anomaly_id: string;
  location: string;
  explanation: string;
  key_factors: ExplainFactor[];
  confidence: number;
  timestamp: string;
  evidence_sentences?: EvidenceLinkedSentence[];
  all_chips?: EvidenceChip[];
}

export interface ProbabilisticZoneResult {
  anomaly_id: string;
  variable: string;
  threshold_value: number;
  threshold_unit: string;
  num_realizations: number;
  model_method: string;
  grid_dim: string;
  prob_matrix: number[][];
  mean_field: number[][];
  std_field: number[][];
  high_risk_cells_count: number;
  moderate_risk_cells_count: number;
  critical_area_km2: number;
  timestamp: string;
}

export interface PhysicsCheckItem {
  name: string;
  passed: boolean;
  status: "PASS" | "FLAG" | "FAIL";
  score: number;
  description: string;
  tolerance_applied: string;
  confidence_penalty_pct: number;
}

export interface PhysicsTrustReport {
  anomaly_id: string;
  event_type: string;
  location: string;
  composite_physics_score: number;
  trust_status: "VERIFIED" | "WARNING" | "REJECTED";
  baseline_confidence_pct: number;
  adjusted_confidence_pct: number;
  penalty_applied_pct: number;
  checks: PhysicsCheckItem[];
  governance_summary: string;
  certified_at: string;
}

export interface BenchmarkPathPoint {
  time: string;
  latitude: number;
  longitude: number;
  status: string;
}

export interface HistoricalBenchmarkEvent {
  id: string;
  event_name: string;
  event_type: string;
  date_window: string;
  region: string;
  lead_time_flagged_hours: number;
  efi_peak: number;
  predicted_peak_rain_mm_h: number;
  actual_observed_rain_mm_h: number;
  predicted_peak_wind_kmh: number;
  actual_observed_wind_kmh: number;
  track_error_km: number;
  brier_skill_score: number;
  alert_level: string;
  summary: string;
  evidence_notes: string;
  gfs_forecast_path: BenchmarkPathPoint[];
  actual_observed_path: BenchmarkPathPoint[];
}

export interface CAPAlertPayload {
  identifier: string;
  sender: string;
  sent: string;
  status: string;
  msgType: string;
  scope: string;
  info: {
    category: string;
    event: string;
    urgency: string;
    severity: string;
    certainty: string;
    eventCode: string;
    expires: string;
    senderName: string;
    headline: string;
    description: string;
    instruction: string;
    areaDesc: string;
    circle: string;
  };
  raw_xml: string;
}
