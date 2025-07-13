"use client";
import { useState, useEffect } from "react";
import Loader from "@/components/common/SplashScreen";
import SplashScreen from "@/components/common/SplashScreen";

interface DebugData {
  categories: any[];
  products: any[];
  productCategories: string[];
  summary: {
    totalCategories: number;
    totalProducts: number;
    uniqueProductCategories: number;
    activeProducts: number;
  };
}

const DebugPage = () => {
  
  const [data, setData] = useState<DebugData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingProducts, setAddingProducts] = useState(false);

  useEffect(() => {
    const fetchDebugData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/debug/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch debug data');
        }
        
        const debugData = await response.json();
        setData(debugData);
        setError(null);
      } catch (err) {
        setError('Failed to load debug data');
        console.error('Error fetching debug data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDebugData();
  }, []);

  const handleAddSampleProducts = async () => {
    try {
      setAddingProducts(true);
      const response = await fetch('/api/debug/add-sample-products', {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Failed to add sample products');
      }
      
      const result = await response.json();
      console.log('Sample products added:', result);
      
      // Refresh the debug data
      fetchDebugData();
    } catch (err) {
      console.error('Error adding sample products:', err);
    } finally {
      setAddingProducts(false);
    }
  };

  const fetchDebugData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/debug/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch debug data');
      }
      
      const debugData = await response.json();
      setData(debugData);
      setError(null);
    } catch (err) {
      setError('Failed to load debug data');
      console.error('Error fetching debug data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Debug Error</h1>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Data</h1>
          <p className="text-gray-400">No debug data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <SplashScreen />
    </div>
  );
};

export default DebugPage; 