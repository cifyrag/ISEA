export type UnitSystem = 'Metric' | 'Imperial';
export type TemperatureUnit = 'Celsius' | 'Fahrenheit';

export type MeasurementType =
  | 'depth'
  | 'distance'
  | 'speed'
  | 'precipitation'
  | 'temperature'
  | 'thermocline'
  | 'waveHeight';

export function convertValue(
  value: number,
  type: MeasurementType,
  unitSystem: UnitSystem,
  tempUnit: TemperatureUnit,
): number {
  switch (type) {
    case 'depth':
    case 'waveHeight':
      return unitSystem === 'Imperial' ? value * 3.28084 : value;
    case 'distance':
      return unitSystem === 'Imperial' ? value * 0.621371 : value;
    case 'speed':
      return unitSystem === 'Imperial' ? value * 3.28084 : value;
    case 'precipitation':
      return unitSystem === 'Imperial' ? value * 0.0393701 : value;
    case 'temperature':
      return tempUnit === 'Fahrenheit' ? value * 9 / 5 + 32 : value;
    case 'thermocline': {
      let result = value;
      if (tempUnit === 'Fahrenheit') result = result * 9 / 5;
      if (unitSystem === 'Imperial') result = result / 3.28084;
      return result;
    }
    default:
      return value;
  }
}

export function getUnitLabel(
  type: MeasurementType,
  unitSystem: UnitSystem,
  tempUnit: TemperatureUnit,
): string {
  switch (type) {
    case 'depth':
    case 'waveHeight':
      return unitSystem === 'Imperial' ? 'ft' : 'm';
    case 'distance':
      return unitSystem === 'Imperial' ? 'mi' : 'km';
    case 'speed':
      return unitSystem === 'Imperial' ? 'ft/s' : 'm/s';
    case 'precipitation':
      return unitSystem === 'Imperial' ? 'in' : 'mm';
    case 'temperature':
      return tempUnit === 'Fahrenheit' ? '°F' : '°C';
    case 'thermocline': {
      const t = tempUnit === 'Fahrenheit' ? '°F' : '°C';
      const d = unitSystem === 'Imperial' ? 'ft' : 'm';
      return `${t}/${d}`;
    }
    default:
      return '';
  }
}
