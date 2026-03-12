import { createContext, useContext, useState, type ReactNode } from 'react';
import { type UnitSystem, type TemperatureUnit } from '../services/unitConversions';

interface UnitPreferencesContextType {
  unitSystem: UnitSystem;
  temperatureUnit: TemperatureUnit;
  setUnitSystem: (system: UnitSystem) => void;
  setTemperatureUnit: (unit: TemperatureUnit) => void;
}

const UnitPreferencesContext = createContext<UnitPreferencesContextType | undefined>(undefined);

export function UnitPreferencesProvider({ children }: { children: ReactNode }) {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('Metric');
  const [temperatureUnit, setTemperatureUnit] = useState<TemperatureUnit>('Celsius');

  return (
    <UnitPreferencesContext.Provider value={{ unitSystem, temperatureUnit, setUnitSystem, setTemperatureUnit }}>
      {children}
    </UnitPreferencesContext.Provider>
  );
}

export function useUnitPreferences() {
  const context = useContext(UnitPreferencesContext);
  if (!context) {
    return {
      unitSystem: 'Metric' as UnitSystem,
      temperatureUnit: 'Celsius' as TemperatureUnit,
      setUnitSystem: () => {},
      setTemperatureUnit: () => {},
    };
  }
  return context;
}
