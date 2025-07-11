"use client";
import React, { useState, useEffect } from 'react';
import { Color, Size } from '@/lib/supabase';
import { IoAdd, IoColorPalette, IoResize } from 'react-icons/io5';

interface ColorSizeSelectorProps {
  selectedColors: number[];
  selectedSizes: number[];
  onColorsChange: (colorIds: number[]) => void;
  onSizesChange: (sizeIds: number[]) => void;
}

const ColorSizeSelector: React.FC<ColorSizeSelectorProps> = ({
  selectedColors,
  selectedSizes,
  onColorsChange,
  onSizesChange
}) => {
  const [colors, setColors] = useState<Color[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [loadingColors, setLoadingColors] = useState(true);
  const [loadingSizes, setLoadingSizes] = useState(true);
  const [showAddColor, setShowAddColor] = useState(false);
  const [showAddSize, setShowAddSize] = useState(false);
  const [newColor, setNewColor] = useState({ name: '', value: '#000000' });
  const [newSize, setNewSize] = useState({ name: '', display_order: 0 });

  // Fetch colors
  const fetchColors = async () => {
    try {
      const response = await fetch('/api/colors');
      const data = await response.json();
      if (response.ok) {
        setColors(data.colors);
      } else {
        console.error('Failed to fetch colors:', data.error);
      }
    } catch (error) {
      console.error('Error fetching colors:', error);
    } finally {
      setLoadingColors(false);
    }
  };

  // Fetch sizes
  const fetchSizes = async () => {
    try {
      const response = await fetch('/api/sizes');
      const data = await response.json();
      if (response.ok) {
        setSizes(data.sizes);
      } else {
        console.error('Failed to fetch sizes:', data.error);
      }
    } catch (error) {
      console.error('Error fetching sizes:', error);
    } finally {
      setLoadingSizes(false);
    }
  };

  useEffect(() => {
    fetchColors();
    fetchSizes();
  }, []);

  // Handle color selection
  const handleColorChange = (colorId: number, checked: boolean) => {
    if (checked) {
      onColorsChange([...selectedColors, colorId]);
    } else {
      onColorsChange(selectedColors.filter(id => id !== colorId));
    }
  };

  // Handle size selection
  const handleSizeChange = (sizeId: number, checked: boolean) => {
    if (checked) {
      onSizesChange([...selectedSizes, sizeId]);
    } else {
      onSizesChange(selectedSizes.filter(id => id !== sizeId));
    }
  };

  // Add new color
  const handleAddColor = async () => {
    if (!newColor.name.trim()) {
      alert('Color name is required');
      return;
    }

    try {
      const response = await fetch('/api/colors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newColor)
      });

      if (response.ok) {
        const data = await response.json();
        setColors([...colors, data.color]);
        setNewColor({ name: '', value: '#000000' });
        setShowAddColor(false);
        // Auto-select the new color
        onColorsChange([...selectedColors, data.color.id]);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add color');
      }
    } catch (error) {
      console.error('Error adding color:', error);
      alert('Failed to add color');
    }
  };

  // Add new size
  const handleAddSize = async () => {
    if (!newSize.name.trim()) {
      alert('Size name is required');
      return;
    }

    try {
      const response = await fetch('/api/sizes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSize)
      });

      if (response.ok) {
        const data = await response.json();
        setSizes([...sizes, data.size].sort((a, b) => a.display_order - b.display_order));
        setNewSize({ name: '', display_order: sizes.length });
        setShowAddSize(false);
        // Auto-select the new size
        onSizesChange([...selectedSizes, data.size.id]);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add size');
      }
    } catch (error) {
      console.error('Error adding size:', error);
      alert('Failed to add size');
    }
  };

  return (
    <div className="space-y-6">
      {/* Colors Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-white uppercase tracking-wide flex items-center gap-2">
            <IoColorPalette className="text-lg" />
            Available Colors
          </h3>
          <button
            type="button"
            onClick={() => setShowAddColor(true)}
            className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition flex items-center gap-1"
          >
            <IoAdd className="text-sm" />
            Add Color
          </button>
        </div>

        {loadingColors ? (
          <div className="text-gray-400">Loading colors...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {colors.map((color) => (
              <label key={color.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedColors.includes(color.id)}
                  onChange={(e) => handleColorChange(color.id, e.target.checked)}
                  className="rounded"
                />
                <div
                  className="w-4 h-4 rounded border border-gray-600"
                  style={{ backgroundColor: color.value }}
                />
                <span className="text-sm text-white">{color.name}</span>
              </label>
            ))}
          </div>
        )}

        {/* Add Color Form */}
        {showAddColor && (
          <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-xs text-gray-300 mb-1">Color Name</label>
                <input
                  type="text"
                  value={newColor.name}
                  onChange={(e) => setNewColor({ ...newColor, name: e.target.value })}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  placeholder="e.g., Navy Blue"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-300 mb-1">Color</label>
                <input
                  type="color"
                  value={newColor.value}
                  onChange={(e) => setNewColor({ ...newColor, value: e.target.value })}
                  className="w-12 h-8 bg-gray-700 border border-gray-600 rounded cursor-pointer"
                />
              </div>
              <button
                type="button"
                onClick={handleAddColor}
                className="px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setShowAddColor(false)}
                className="px-3 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sizes Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-white uppercase tracking-wide flex items-center gap-2">
            <IoResize className="text-lg" />
            Available Sizes
          </h3>
          <button
            type="button"
            onClick={() => setShowAddSize(true)}
            className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition flex items-center gap-1"
          >
            <IoAdd className="text-sm" />
            Add Size
          </button>
        </div>

        {loadingSizes ? (
          <div className="text-gray-400">Loading sizes...</div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {sizes.map((size) => (
              <label key={size.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedSizes.includes(size.id)}
                  onChange={(e) => handleSizeChange(size.id, e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-white">{size.name}</span>
              </label>
            ))}
          </div>
        )}

        {/* Add Size Form */}
        {showAddSize && (
          <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-xs text-gray-300 mb-1">Size Name</label>
                <input
                  type="text"
                  value={newSize.name}
                  onChange={(e) => setNewSize({ ...newSize, name: e.target.value })}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  placeholder="e.g., XXL or 42"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-300 mb-1">Order</label>
                <input
                  type="number"
                  value={newSize.display_order}
                  onChange={(e) => setNewSize({ ...newSize, display_order: parseInt(e.target.value) || 0 })}
                  className="w-20 p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  placeholder="0"
                />
              </div>
              <button
                type="button"
                onClick={handleAddSize}
                className="px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setShowAddSize(false)}
                className="px-3 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColorSizeSelector; 