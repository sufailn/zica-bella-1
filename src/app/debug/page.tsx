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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Database Debug Info</h1>
        <button
          onClick={handleAddSampleProducts}
          disabled={addingProducts}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded text-white"
        >
          {addingProducts ? 'Adding Products...' : 'Add Sample Products'}
        </button>
      </div>
      
      {/* Summary */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-900 p-4 rounded">
            <div className="text-2xl font-bold">{data.summary.totalCategories}</div>
            <div className="text-gray-400">Categories</div>
          </div>
          <div className="bg-gray-900 p-4 rounded">
            <div className="text-2xl font-bold">{data.summary.totalProducts}</div>
            <div className="text-gray-400">Products</div>
          </div>
          <div className="bg-gray-900 p-4 rounded">
            <div className="text-2xl font-bold">{data.summary.uniqueProductCategories}</div>
            <div className="text-gray-400">Product Categories</div>
          </div>
          <div className="bg-gray-900 p-4 rounded">
            <div className="text-2xl font-bold">{data.summary.activeProducts}</div>
            <div className="text-gray-400">Active Products</div>
          </div>
        </div>
      </div>

      {/* Categories Table */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Categories Table</h2>
        <div className="overflow-x-auto">
          <table className="w-full bg-gray-900 rounded">
            <thead>
              <tr>
                <th className="text-left p-4">ID</th>
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Slug</th>
                <th className="text-left p-4">Description</th>
              </tr>
            </thead>
            <tbody>
              {data.categories.map((category) => (
                <tr key={category.id} className="border-t border-gray-800">
                  <td className="p-4">{category.id}</td>
                  <td className="p-4">{category.name}</td>
                  <td className="p-4">{category.slug}</td>
                  <td className="p-4">{category.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Categories */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Product Categories (from products table)</h2>
        <div className="bg-gray-900 p-4 rounded">
          <div className="flex flex-wrap gap-2">
            {data.productCategories.map((category, index) => (
              <span key={index} className="bg-blue-600 px-3 py-1 rounded text-sm">
                {category}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Products</h2>
        <div className="overflow-x-auto">
          <table className="w-full bg-gray-900 rounded">
            <thead>
              <tr>
                <th className="text-left p-4">ID</th>
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Category</th>
                <th className="text-left p-4">Active</th>
              </tr>
            </thead>
            <tbody>
              {data.products.map((product) => (
                <tr key={product.id} className="border-t border-gray-800">
                  <td className="p-4">{product.id}</td>
                  <td className="p-4">{product.name}</td>
                  <td className="p-4">{product.category}</td>
                  <td className="p-4">{product.is_active ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DebugPage; 