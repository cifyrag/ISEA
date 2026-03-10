export const DiveStatusLabels: Record<number, string> = {
  0: 'Unknown', 1: 'Excellent', 2: 'Good', 3: 'Fair', 4: 'Poor', 5: 'Not Recommended'
};

export const CurrentStrengthLabels: Record<number, string> = {
  0: 'None', 1: 'Weak', 2: 'Moderate', 3: 'Strong', 4: 'Dangerous'
};

export const TidePhaseLabels: Record<number, string> = {
  0: 'Unknown', 1: 'Rising', 2: 'Falling', 3: 'High', 4: 'Low', 5: 'Slack'
};

export const WaveConditionLabels: Record<number, string> = {
  0: 'Unknown', 1: 'Calm', 2: 'Slight', 3: 'Moderate', 4: 'Rough', 5: 'Very Rough'
};

export const RiskLevelLabels: Record<number, string> = {
  0: 'Unknown', 1: 'Low', 2: 'Moderate', 3: 'High', 4: 'Extreme'
};

export const WetsuitTypeLabels: Record<number, string> = {
  0: 'Unknown', 1: 'Rash Guard', 2: '3mm Suit', 3: '5mm Suit', 4: '7mm Suit', 5: 'Semi-Dry', 6: 'Drysuit'
};

export const BeginnerSuitabilityLabels: Record<number, string> = {
  0: 'Unknown', 1: 'Yes', 2: 'No', 3: 'With Supervision'
};

export const SkyConditionLabels: Record<number, string> = {
  0: 'Unknown', 1: 'Clear', 2: 'Partly Cloudy', 3: 'Mostly Cloudy', 4: 'Overcast',
  5: 'Foggy', 6: 'Drizzle', 7: 'Rain', 8: 'Snow', 9: 'Showers', 10: 'Thunderstorm'
};

export const SurgeIntensityLabels: Record<number, string> = {
  0: 'None', 1: 'Light', 2: 'Moderate', 3: 'Strong'
};

export const SeasonLabels: Record<number, string> = {
  0: 'Unknown', 1: 'Spring', 2: 'Summer', 3: 'Fall', 4: 'Winter'
};

export const CertificationLevelLabels: Record<number, string> = {
  0: 'Open Water', 1: 'Advanced Open Water', 2: 'Rescue', 3: 'Divemaster', 4: 'Diving Not Recommended'
};

export const PlanktonLevelLabels: Record<number, string> = {
  0: 'Unknown', 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Bloom'
};

export const SedimentLevelLabels: Record<number, string> = {
  0: 'Unknown', 1: 'Low', 2: 'Medium', 3: 'High'
};

export const WindTypeLabels: Record<number, string> = {
  0: 'Unknown', 1: 'Onshore', 2: 'Offshore', 3: 'Crossshore'
};

export const PrecipitationTypeLabels: Record<number, string> = {
  0: 'None', 1: 'Light Rain', 2: 'Rain', 3: 'Heavy Rain', 4: 'Storm'
};

export const DifficultyLevelLabels: Record<number, string> = {
  0: 'Unknown', 1: 'Easy', 2: 'Moderate', 3: 'Difficult', 4: 'Hazardous'
};

export const BoatConditionLabels: Record<number, string> = {
  0: 'Unknown', 1: 'Calm', 2: 'Slight Motion', 3: 'Moderate Motion', 4: 'Rough'
};

export const BottomCompositionLabels: Record<number, string> = {
  0: 'Unknown', 1: 'Sand', 2: 'Silt', 3: 'Reef', 4: 'Rock', 5: 'Mixed'
};

export const DiveTypeLabels: Record<number, string> = {
  0: 'Unknown', 1: 'Recreational', 2: 'Drift', 3: 'Technical'
};

export const PhotoConditionsLabels: Record<number, string> = {
  0: 'Unknown', 1: 'Excellent', 2: 'Good', 3: 'Fair', 4: 'Poor'
};

export const SwellIntensityLabels: Record<number, string> = {
  0: 'Unknown', 1: 'Low', 2: 'Moderate', 3: 'High', 4: 'Very High'
};

export const PrecipitationIntensityLabels: Record<number, string> = {
  0: 'None', 1: 'Light', 2: 'Moderate', 3: 'Heavy', 4: 'Extreme'
};

export const MarineRegionLabels: Record<number, string> = {
  0: 'Unknown', 1: 'Mediterranean', 2: 'Caribbean', 3: 'Red Sea', 4: 'Southeast Asia', 5: 'Australia', 6: 'North Atlantic', 7: 'Pacific'
};

export const TerrainTypeLabels: Record<number, string> = {
  0: 'Unknown', 1: 'Slope', 2: 'Bottom Panel', 3: 'Reef', 4: 'Flat', 5: 'Trench'
};

export const BeaufortScaleLabels: Record<number, string> = {
  0: 'Calm', 1: 'Light Air', 2: 'Light Breeze', 3: 'Gentle Breeze', 4: 'Moderate Breeze',
  5: 'Fresh Breeze', 6: 'Strong Breeze', 7: 'Near Gale', 8: 'Gale', 9: 'Strong Gale',
  10: 'Storm', 11: 'Violent Storm', 12: 'Hurricane'
};

export function getEnumLabel(labels: Record<number, string>, value: number | string | undefined): string {
  if (value === undefined || value === null) return 'N/A';
  if (typeof value === 'number') return labels[value] ?? 'Unknown';
  if (typeof value === 'string') {
    const values = Object.values(labels);
    if (values.includes(value)) return value;
    return value.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');
  }
  return 'Unknown';
}
