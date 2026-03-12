import { useUnitPreferences } from '../context/UnitPreferencesContext';
import { convertValue, getUnitLabel, type MeasurementType } from '../services/unitConversions';

export function useUnitFormatter() {
  const { unitSystem, temperatureUnit } = useUnitPreferences();

  return {
    convert: (value: number | undefined | null, type: MeasurementType): number | undefined => {
      if (value == null) return undefined;
      return convertValue(value, type, unitSystem, temperatureUnit);
    },
    unit: (type: MeasurementType): string =>
      getUnitLabel(type, unitSystem, temperatureUnit),
    unitSystem,
    temperatureUnit,
  };
}
