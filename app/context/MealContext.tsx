import React, { createContext, useContext, useState, ReactNode } from 'react';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

export interface MealEntry {
  id: string;
  item: string;
  calories: number;
  type: MealType;
  weight?: number;
  timestamp: Date;
}

interface MealContextType {
  meals: MealEntry[];
  dailyGoal: string;
  setDailyGoal: (goal: string) => void;
  addMeal: (meal: Omit<MealEntry, 'id' | 'timestamp'>) => void;
}

const MealContext = createContext<MealContextType | undefined>(undefined);

export function MealProvider({ children }: { children: ReactNode }) {
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [dailyGoal, setDailyGoal] = useState('2000');

  const addMeal = (mealData: Omit<MealEntry, 'id' | 'timestamp'>) => {
    const newMeal: MealEntry = {
      ...mealData,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setMeals(prev => [newMeal, ...prev]);
  };

  return (
    <MealContext.Provider value={{ meals, dailyGoal, setDailyGoal, addMeal }}>
      {children}
    </MealContext.Provider>
  );
}

export function useMeals() {
  const context = useContext(MealContext);
  if (context === undefined) {
    throw new Error('useMeals must be used within a MealProvider');
  }
  return context;
}
