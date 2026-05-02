import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../lib/supabase';

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
  isGuest: boolean;
  setDailyGoal: (goal: string) => void;
  addMeal: (meal: Omit<MealEntry, 'id' | 'timestamp'>) => Promise<void>;
  setIsGuest: (val: boolean) => void;
  syncLocalToCloud: () => Promise<void>;
}

const MealContext = createContext<MealContextType | undefined>(undefined);

const STORAGE_KEY = '@bowlz_meals';

export function MealProvider({ children }: { children: ReactNode }) {
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [dailyGoal, setDailyGoal] = useState('2000');
  const [isGuest, setIsGuest] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUserId(session.user.id);
        setIsGuest(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUserId(session.user.id);
        setIsGuest(false);
      } else {
        setUserId(null);
        setIsGuest(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    loadMeals();
  }, [userId, isGuest]);

  const loadMeals = async () => {
    try {
      if (!isGuest && userId) {
        const { data, error } = await supabase
          .from('calorie_entries')
          .select('*')
          .eq('user_id', userId)
          .order('logged_at', { ascending: false });

        if (error) throw error;
        
        const formattedMeals: MealEntry[] = data.map(item => ({
          id: item.id,
          item: item.food_name,
          calories: item.calories,
          type: item.meal_type as MealType,
          weight: item.weight_grams,
          timestamp: new Date(item.logged_at),
        }));
        setMeals(formattedMeals);
      } else {
        const savedMeals = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedMeals) {
          const parsed = JSON.parse(savedMeals);
          setMeals(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
        }
      }
    } catch (err) {
      console.error('Error loading meals:', err);
    }
  };

  const addMeal = async (mealData: Omit<MealEntry, 'id' | 'timestamp'>) => {
    const tempId = Date.now().toString();
    const newMeal: MealEntry = {
      ...mealData,
      id: tempId,
      timestamp: new Date(),
    };

    setMeals(prev => [newMeal, ...prev]);

    try {
      if (!isGuest && userId) {
        const { error } = await supabase.from('calorie_entries').insert({
          user_id: userId,
          food_name: mealData.item,
          calories: mealData.calories,
          meal_type: mealData.type,
          weight_grams: mealData.weight,
        });
        if (error) throw error;
      } else {
        const updatedMeals = [newMeal, ...meals];
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMeals));
      }
    } catch (err) {
      console.error('Error adding meal:', err);
    }
  };

  const syncLocalToCloud = async () => {
    if (!userId) return;
    try {
      const { data: localMeals } = await supabase.from('calorie_entries').select('id');
    
      const savedMeals = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedMeals) {
        const parsed: MealEntry[] = JSON.parse(savedMeals);
        const toInsert = parsed.map(m => ({
          user_id: userId,
          food_name: m.item,
          calories: m.calories,
          meal_type: m.type,
          weight_grams: m.weight,
          logged_at: m.timestamp,
        }));
        
        if (toInsert.length > 0) {
          await supabase.from('calorie_entries').insert(toInsert);
          await AsyncStorage.removeItem(STORAGE_KEY); 
          loadMeals(); 
        }
      }
    } catch (err) {
      console.error('Sync failed:', err);
    }
  };

  return (
    <MealContext.Provider value={{ meals, dailyGoal, isGuest, setDailyGoal, addMeal, setIsGuest, syncLocalToCloud }}>
      {children}
    </MealContext.Provider>
  );
}

export default function useMeals() {
  const context = useContext(MealContext);
  if (context === undefined) {
    throw new Error('useMeals must be used within a MealProvider');
  }
  return context;
}
