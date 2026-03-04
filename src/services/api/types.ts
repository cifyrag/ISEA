export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  expiration: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

export interface DiveConditions {
  location: string;
  latitude: number;
  longitude: number;
  waterLatitude?: number;
  waterLongitude?: number;
  waterLocation?: string;
  distanceToWaterKm?: number;
  requestTime: string;
  status: string;
  safetyScore: number;
  visibility: {
    kd490?: number;
    chlorophyllMgM3?: number;
    secchiDepthM?: number;
    baseVisibilityM: number;
    estimatedVisibilityM: number;
    planktonLevel: string;
    sedimentLevel: string;
    runoffPenalty: number;
    wavePenalty: number;
    warning?: string;
    visibilityNote: string;
    dataSource?: string;
  };
  waterPhysics: {
    surfaceTempC: number;
    plannedDepthM: number;
    season: string;
    thermoclineDepthM?: number;
    thermoclineStrengthCPerM?: number;
    thermoclineNote: string;
    estimatedBottomTempC: number;
    recommendedSuit: string;
    thermalProtectionNotes?: string;
    dataSource?: string;
  };
  dynamics: {
    currentSpeedMs: number;
    currentDirectionDegrees: number;
    currentDirection: string;
    currentNote: string;
    tidePhase: string;
    tideHeightM?: number;
    nextHighTide?: string;
    nextLowTide?: string;
    tidalRangeM?: number;
    currentSpeedKnots: number;
    currentStrength: string;
    tideCycleHour?: number;
    tidalCurrentStrength?: number;
    nextSlackTide?: string;
    timeToSlack?: string;
    isSlackWindow: boolean;
    waveEnergy: number;
    surgeIntensity: string;
    surgeDepthPenetrationM: number;
    surgeNote: string;
    safetyNote?: string;
    isDriftDivingPossible: boolean;
    dataSource?: string;
  };
  weatherContext: {
    windSpeedMs: number;
    windGustMs: number;
    windDirectionDegrees: number;
    windDirection: string;
    waveHeightM: number;
    wavePeriodS: number;
    waveDirectionDegrees?: number;
    waveDirection?: string;
    swellHeightM?: number;
    swellPeriodS?: number;
    swellDirection?: string;
    precipitationMm: number;
    precipitationProbabilityPercent: number;
    sky: string;
    cloudCoverPercent: number;
    airTempC?: number;
    windSpeedKnots: number;
    windGustKnots: number;
    beaufortScale: number;
    windType: string;
    windTypeNote: string;
    waveCondition: string;
    precipitationType: string;
    isThunderstorm: boolean;
    dataSource?: string;
  };
  surfaceConditions: {
    entryDifficulty: string;
    exitDifficulty: string;
    isBoatDiveRecommended: boolean;
    isShoreDivePossible: boolean;
    hasStrongSurfaceCurrents: boolean;
    hasBreakingWaves: boolean;
    hasRipCurrentRisk: boolean;
    boatConditions: string;
    isAnchoringDifficult: boolean;
    surfaceNotes?: string;
  };
  safetyAssessment: {
    hasVetoCondition: boolean;
    vetoReason?: string;
    isWindVeto: boolean;
    isWaveVeto: boolean;
    isLightningVeto: boolean;
    isRedTideVeto: boolean;
    isSurgeVeto: boolean;
    overallSafetyScore: number;
    riskLevel: string;
    waveScore: number;
    currentScore: number;
    visibilityScore: number;
    weatherScore: number;
    temperatureScore: number;
    surgeScore: number;
    minimumCertificationLevel: string;
    requiresLocalGuide: boolean;
    requiresSpecialEquipment: boolean;
    requiredEquipment: string[];
    activeWarnings: string[];
    advisories: string[];
    shouldPostponeDive: boolean;
    postponeReason?: string;
    nextSafeWindow?: string;
  };
  recommendations: {
    bestTimeToday: string;
    optimalSlackTide?: string;
    recommendedExposureSuit: string;
    needsHood: boolean;
    needsGloves: boolean;
    needsBoots: boolean;
    diveTypeRecommendation: string;
    suitableForBeginners: string;
    idealExperienceLevel: string;
    specialConsiderations: string[];
    marineLifeAlerts: string[];
    photoConditions: string;
    photoNotes?: string;
  };
  bathymetry: {
    waterLatitude?: number;
    waterLongitude?: number;
    distanceToWaterKm?: number;
    depthM?: number;
    minDepthInAreaM?: number;
    maxDepthInAreaM?: number;
    maxDiveDepthM?: number;
    beginnerDepthM?: number;
    slopePercent?: number;
    terrainType?: string;
    inferredBottomComposition?: string;
    offshoreDirectionDegrees?: number;
    offshoreDirection?: string;
    isLand: boolean;
    isShallowWater: boolean;
    originalDepthM?: number;
    isUsingNearestWater: boolean;
    note?: string;
    dataSource?: string;
  };
  personalAssessment?: PersonalAssessment | null;
}

export interface PersonalAssessment {
  userCertification?: string | null;
  isCertifiedForDive: boolean;
  certificationGapWarning?: string | null;

  userPreferredMaxDepthM?: number | null;
  isWithinPreferredDepth: boolean;
  depthWarning?: string | null;

  userPreferredSuit?: string | null;
  hasAppropriateSuit: boolean;
  suitUpgradeRecommendation?: string | null;

  experienceLevel: 'Unknown' | 'Beginner' | 'Intermediate' | 'Experienced' | 'Expert';
  userTotalDives?: number | null;

  hasEmergencyContact: boolean;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  emergencyContactRelation?: string | null;
  missingEmergencyContactReminder?: string | null;
}

export type DiveConditionStatus = 'approved' | 'pending' | 'rejected';

export interface SubmitDiveConditionRequest {
  diveSiteId: string;
  date?: string;
  notes?: string;
}

export interface SubmitDiveConditionResponse {
  id: string;
  diveSiteId: string;
  status: DiveConditionStatus;
  conditions: DiveConditions;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  certificationLevel?: string;
  totalDives: number;
  bio?: string;
  profilePictureUrl?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  preferredSuitType?: string;
  preferredDiveType?: string;
  preferredMaxDepthM?: number;
  unitSystem?: string;
  temperatureUnit?: string;
  preferredLanguage?: string;
  createdAt: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  certificationLevel?: string;
  totalDives: number;
  bio?: string;
  profilePictureUrl?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  preferredSuitType?: string;
  preferredDiveType?: string;
  preferredMaxDepthM?: number;
  unitSystem?: string;
  temperatureUnit?: string;
  preferredLanguage?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface SavedLocation {
  id: string;
  diveSiteId?: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  diveType?: string;
  difficultyLevel?: string;
  maxDepthM?: number;
  notes?: string;
  personalRating?: number;
  photoUrls?: string[];
  lastDiveDate?: string;
  timesVisited: number;
  lastWeatherStatus?: string;
  lastSafetyScore?: number;
  lastWeatherCheck?: string;
  createdAt: string;
}

export interface CreateLocationRequest {
  diveSiteId: string;
  notes?: string;
  personalRating?: number;
  photoUrls?: string[];
}

export interface UpdateLocationRequest {
  notes?: string;
  personalRating?: number;
  photoUrls?: string[];
  lastDiveDate?: string;
  timesVisited: number;
}

export interface WeatherRefreshResponse {
  location: SavedLocation;
  diveConditions: DiveConditions;
}

export interface BulkWeatherResult {
  locationId: string;
  locationName: string;
  status: 'success' | 'failed';
  weatherStatus?: string;
  safetyScore?: number;
  error?: string;
}

export interface BulkWeatherResponse {
  results: BulkWeatherResult[];
}

export type DiveSiteType =
  | 'Unknown'
  | 'Reef'
  | 'Wreck'
  | 'Cave'
  | 'Cavern'
  | 'Wall'
  | 'Pinnacle'
  | 'Drift'
  | 'Lake'
  | 'Muck'
  | 'Pelagic'
  | 'Plateau';

export const DIVE_SITE_TYPES: DiveSiteType[] = [
  'Reef', 'Wreck', 'Cave', 'Cavern', 'Wall', 'Pinnacle',
  'Drift', 'Lake', 'Muck', 'Pelagic', 'Plateau',
];

export interface DiveSiteImage {
  id: string;
  url: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  createdAt: string;
}

export interface DiveSite {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  description?: string;
  country?: string;
  region?: string;
  maxDepthM?: number;
  website?: string;
  phoneNumber?: string;
  siteType?: DiveSiteType;
  source: string;
  isVerified: boolean;
  osmId?: string;
  images?: DiveSiteImage[];
  createdAt: string;
}

export interface DiveSiteMarker {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  isVerified: boolean;
  country?: string;
  maxDepthM?: number;
  region?: string;
  siteType?: DiveSiteType;
}

export interface CreateDiveSiteRequest {
  name: string;
  latitude: number;
  longitude: number;
  description?: string;
  country?: string;
  region?: string;
  maxDepthM?: number;
  website?: string;
  phoneNumber?: string;
  siteType?: DiveSiteType;
}

export interface UpdateDiveSiteRequest {
  name: string;
  latitude: number;
  longitude: number;
  description?: string;
  country?: string;
  region?: string;
  maxDepthM?: number;
  website?: string;
  phoneNumber?: string;
  siteType?: DiveSiteType;
  isVerified?: boolean;
}

export interface ImportResult {
  imported: number;
}

export type DiveSiteSource = 'Manual' | 'ApiImport' | 'Overpass';
export type DiveSiteSortBy = 'distance' | 'name' | 'createdAt';

export interface DiveSiteFilterRequest {
  isVerified?: boolean;
  source?: DiveSiteSource;
  siteType?: DiveSiteType;
  country?: string;
  region?: string;
  search?: string;
  minDepthM?: number;
  maxDepthM?: number;
  latitude?: number;
  longitude?: number;
  sortBy?: DiveSiteSortBy;
  sortDesc?: boolean;
  page?: number;
  pageSize?: number;
}

export interface DiveSiteWithDistance extends DiveSite {
  distanceKm?: number;
}

export interface PaginatedDiveSiteResponse {
  items: DiveSiteWithDistance[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface AdminUserListItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  isActive: boolean;
  createdAt: string;
}

export interface AdminUserListResponse {
  items: AdminUserListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface AdminUserDetail extends AdminUserListItem {
  updatedAt?: string;
  certificationLevel?: string;
  totalDives: number;
  bio?: string;
  profilePictureUrl?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  preferredSuitType?: string;
  preferredDiveType?: string;
  preferredMaxDepthM?: number;
}

export interface ChangeRoleRequest {
  role: string;
}

export interface WindData {
  speedMs: number;
  speedKnots: number;
  directionDegrees: number;
  directionCardinal: string;
  gustMs: number;
}

export interface RainData {
  precipitationMm: number;
  probabilityPercent: number;
  intensity: string;
}

export interface SkyData {
  cloudCoverPercent: number;
  weatherCode: number;
  condition: string;
}

export interface WeatherData {
  latitude: number;
  longitude: number;
  timestamp: string;
  airTempC?: number;
  wind: WindData;
  rain: RainData;
  sky: SkyData;
}

export interface WaveData {
  heightM: number;
  periodSeconds: number;
  directionDegrees: number;
  directionCardinal: string;
  condition: string;
}

export interface SwellData {
  heightM: number;
  periodSeconds: number;
  directionDegrees: number;
  directionCardinal: string;
  intensity: string;
}

export interface SeaTemperatureData {
  surfaceTempC: number;
  recommendedSuit: string;
}

export interface CurrentData {
  speedMs: number;
  directionDegrees: number;
  directionCardinal: string;
  strength: string;
  safetyNote: string;
}

export interface MarineData {
  latitude: number;
  longitude: number;
  timestamp: string;
  waves: WaveData;
  swell: SwellData;
  seaTemperature: SeaTemperatureData;
  current: CurrentData;
}

export interface StatusResponse {
  status: string;
  timestamp: string;
}

export interface DiveSiteReview {
  id: string;
  diveSiteId: string;
  userId: string;
  authorFirstName?: string;
  authorLastName?: string;
  rating: number;
  comment?: string;
  photoUrls?: string[];
  visibility?: number;
  diveDurationMin?: number;
  maxDepth?: number;
  diveDate?: string;
  diveType?: string;
  waterTemperature?: number;
  currentStrength?: string;
  unitSystem?: string;
  temperatureUnit?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateReviewRequest {
  diveSiteId: string;
  rating: number;
  comment?: string;
  photoUrls?: string[];
  visibility?: number;
  diveDurationMin?: number;
  maxDepth?: number;
  diveDate?: string;
  diveType?: string;
  waterTemperature?: number;
  currentStrength?: string;
}

export interface UpdateReviewRequest {
  rating: number;
  comment?: string;
  photoUrls?: string[];
  visibility?: number;
  diveDurationMin?: number;
  maxDepth?: number;
  diveDate?: string;
  diveType?: string;
  waterTemperature?: number;
  currentStrength?: string;
}

export interface ReviewSummary {
  diveSiteId: string;
  averageRating: number;
  totalReviews: number;
}

export interface PaginatedReviewResponse {
  items: DiveSiteReview[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface PrivateNote {
  id: string;
  diveSiteId: string;
  diveSiteName?: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreatePrivateNoteRequest {
  diveSiteId: string;
  title: string;
  content: string;
}

export interface UpdatePrivateNoteRequest {
  title: string;
  content: string;
}

export interface MapTileLayer {
  id: string;
  name: string;
  urlTemplate: string;
  attribution: string;
  minZoom: number;
  maxZoom: number;
  opacity: number;
  isDefault: boolean;
}

export interface MapDefaults {
  centerLatitude: number;
  centerLongitude: number;
  defaultZoom: number;
}

export interface MapConfiguration {
  baseLayers: MapTileLayer[];
  overlayLayers: MapTileLayer[];
  defaults: MapDefaults;
}
