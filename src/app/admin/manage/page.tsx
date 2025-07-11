"use client";
import React, { useState, useEffect } from 'react';
import { Category, Color, Size } from '@/lib/supabase';
import { IoAdd, IoPencil, IoTrash, IoColorPalette, IoResize, IoGrid, IoSave, IoClose } from 'react-icons/io5';

interface EditingItem {
  type: 'category' | 'color' | 'size';
  item: any;
}

const ManagePage = () => {
  // State for data
  const [categories, setCategories] = useState<Category[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  
  // Loading states
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingColors, setLoadingColors] = useState(true);
  const [loadingSizes, setLoadingSizes] = useState(true);
  
  // Form states
  const [showAddForm, setShowAddForm] = useState<'category' | 'color' | 'size' | null>(null);
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
  
  // Form data
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
  const [colorForm, setColorForm] = useState({ name: '', value: '#000000' });
  const [sizeForm, setSizeForm] = useState({ name: '', display_order: 0 });

  // Fetch data functions
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (response.ok) {
        setCategories(data.categories);
      } else {
        console.error('Failed to fetch categories:', data.error);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

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
    fetchCategories();
    fetchColors();
    fetchSizes();
  }, []);

  // Add functions
  const handleAddCategory = async () => {
    if (!categoryForm.name.trim()) {
      alert('Category name is required');
      return;
    }

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm)
      });

      if (response.ok) {
        const data = await response.json();
        setCategories([...categories, data.category]);
        setCategoryForm({ name: '', description: '' });
        setShowAddForm(null);
        alert('Category added successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add category');
      }
    } catch (error) {
      console.error('Error adding category:', error);
      alert('Failed to add category');
    }
  };

  const handleAddColor = async () => {
    if (!colorForm.name.trim()) {
      alert('Color name is required');
      return;
    }

    try {
      const response = await fetch('/api/colors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(colorForm)
      });

      if (response.ok) {
        const data = await response.json();
        setColors([...colors, data.color]);
        setColorForm({ name: '', value: '#000000' });
        setShowAddForm(null);
        alert('Color added successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add color');
      }
    } catch (error) {
      console.error('Error adding color:', error);
      alert('Failed to add color');
    }
  };

  const handleAddSize = async () => {
    if (!sizeForm.name.trim()) {
      alert('Size name is required');
      return;
    }

    try {
      const response = await fetch('/api/sizes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sizeForm)
      });

      if (response.ok) {
        const data = await response.json();
        setSizes([...sizes, data.size].sort((a, b) => a.display_order - b.display_order));
        setSizeForm({ name: '', display_order: sizes.length });
        setShowAddForm(null);
        alert('Size added successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add size');
      }
    } catch (error) {
      console.error('Error adding size:', error);
      alert('Failed to add size');
    }
  };

  // Edit functions
  const handleEditCategory = (category: Category) => {
    setEditingItem({ type: 'category', item: category });
    setCategoryForm({ name: category.name, description: category.description || '' });
  };

  const handleEditColor = (color: Color) => {
    setEditingItem({ type: 'color', item: color });
    setColorForm({ name: color.name, value: color.value });
  };

  const handleEditSize = (size: Size) => {
    setEditingItem({ type: 'size', item: size });
    setSizeForm({ name: size.name, display_order: size.display_order });
  };

  // Update functions
  const handleUpdateCategory = async () => {
    if (!editingItem || editingItem.type !== 'category') return;

    try {
      const response = await fetch(`/api/categories/${editingItem.item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm)
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(categories.map(cat => 
          cat.id === editingItem.item.id ? data.category : cat
        ));
        setEditingItem(null);
        setCategoryForm({ name: '', description: '' });
        alert('Category updated successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update category');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Failed to update category');
    }
  };

  const handleUpdateColor = async () => {
    if (!editingItem || editingItem.type !== 'color') return;

    try {
      const response = await fetch(`/api/colors/${editingItem.item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(colorForm)
      });

      if (response.ok) {
        const data = await response.json();
        setColors(colors.map(color => 
          color.id === editingItem.item.id ? data.color : color
        ));
        setEditingItem(null);
        setColorForm({ name: '', value: '#000000' });
        alert('Color updated successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update color');
      }
    } catch (error) {
      console.error('Error updating color:', error);
      alert('Failed to update color');
    }
  };

  const handleUpdateSize = async () => {
    if (!editingItem || editingItem.type !== 'size') return;

    try {
      const response = await fetch(`/api/sizes/${editingItem.item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sizeForm)
      });

      if (response.ok) {
        const data = await response.json();
        setSizes(sizes.map(size => 
          size.id === editingItem.item.id ? data.size : size
        ).sort((a, b) => a.display_order - b.display_order));
        setEditingItem(null);
        setSizeForm({ name: '', display_order: 0 });
        alert('Size updated successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update size');
      }
    } catch (error) {
      console.error('Error updating size:', error);
      alert('Failed to update size');
    }
  };

  // Delete functions
  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category? This may affect products using this category.')) return;

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setCategories(categories.filter(cat => cat.id !== id));
        alert('Category deleted successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category');
    }
  };

  const handleDeleteColor = async (id: number) => {
    if (!confirm('Are you sure you want to delete this color? This may affect products using this color.')) return;

    try {
      const response = await fetch(`/api/colors/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setColors(colors.filter(color => color.id !== id));
        alert('Color deleted successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete color');
      }
    } catch (error) {
      console.error('Error deleting color:', error);
      alert('Failed to delete color');
    }
  };

  const handleDeleteSize = async (id: number) => {
    if (!confirm('Are you sure you want to delete this size? This may affect products using this size.')) return;

    try {
      const response = await fetch(`/api/sizes/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setSizes(sizes.filter(size => size.id !== id));
        alert('Size deleted successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete size');
      }
    } catch (error) {
      console.error('Error deleting size:', error);
      alert('Failed to delete size');
    }
  };

  const resetForms = () => {
    setShowAddForm(null);
    setEditingItem(null);
    setCategoryForm({ name: '', description: '' });
    setColorForm({ name: '', value: '#000000' });
    setSizeForm({ name: '', display_order: 0 });
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Manage Categories, Colors & Sizes</h1>
          <a
            href="/admin"
            className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
          >
            Back to Products
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Categories Section */}
          <div className="bg-gray-900 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <IoGrid className="text-blue-400" />
                Categories
              </h2>
              <button
                onClick={() => setShowAddForm('category')}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition flex items-center gap-1"
              >
                <IoAdd className="text-sm" />
                Add
              </button>
            </div>

            {loadingCategories ? (
              <div className="text-gray-400">Loading...</div>
            ) : (
              <div className="space-y-3">
                {categories.map((category) => (
                  <div key={category.id} className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{category.name}</h3>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="p-1 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700"
                          title="Edit"
                        >
                          <IoPencil />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="p-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                          title="Delete"
                        >
                          <IoTrash />
                        </button>
                      </div>
                    </div>
                    {category.description && (
                      <p className="text-gray-400 text-sm">{category.description}</p>
                    )}
                    <p className="text-gray-500 text-xs mt-2">Slug: {category.slug}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Colors Section */}
          <div className="bg-gray-900 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <IoColorPalette className="text-pink-400" />
                Colors
              </h2>
              <button
                onClick={() => setShowAddForm('color')}
                className="bg-pink-600 text-white px-3 py-1 rounded text-sm hover:bg-pink-700 transition flex items-center gap-1"
              >
                <IoAdd className="text-sm" />
                Add
              </button>
            </div>

            {loadingColors ? (
              <div className="text-gray-400">Loading...</div>
            ) : (
              <div className="space-y-3">
                {colors.map((color) => (
                  <div key={color.id} className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-6 h-6 rounded-full border-2 border-gray-600"
                          style={{ backgroundColor: color.value }}
                        />
                        <div>
                          <h3 className="font-medium">{color.name}</h3>
                          <p className="text-gray-400 text-sm">{color.value}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditColor(color)}
                          className="p-1 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700"
                          title="Edit"
                        >
                          <IoPencil />
                        </button>
                        <button
                          onClick={() => handleDeleteColor(color.id)}
                          className="p-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                          title="Delete"
                        >
                          <IoTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sizes Section */}
          <div className="bg-gray-900 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <IoResize className="text-green-400" />
                Sizes
              </h2>
              <button
                onClick={() => setShowAddForm('size')}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition flex items-center gap-1"
              >
                <IoAdd className="text-sm" />
                Add
              </button>
            </div>

            {loadingSizes ? (
              <div className="text-gray-400">Loading...</div>
            ) : (
              <div className="space-y-3">
                {sizes.map((size) => (
                  <div key={size.id} className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{size.name}</h3>
                        <p className="text-gray-400 text-sm">Order: {size.display_order}</p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditSize(size)}
                          className="p-1 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700"
                          title="Edit"
                        >
                          <IoPencil />
                        </button>
                        <button
                          onClick={() => handleDeleteSize(size.id)}
                          className="p-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                          title="Delete"
                        >
                          <IoTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Forms */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md">
              <h3 className="text-lg font-bold mb-4">
                Add New {showAddForm === 'category' ? 'Category' : showAddForm === 'color' ? 'Color' : 'Size'}
              </h3>

              {showAddForm === 'category' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input
                      type="text"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                      placeholder="Category name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                      rows={3}
                      placeholder="Optional description"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleAddCategory}
                      className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition flex items-center justify-center gap-2"
                    >
                      <IoSave />
                      Add Category
                    </button>
                    <button
                      onClick={resetForms}
                      className="px-4 bg-gray-600 text-white py-2 rounded hover:bg-gray-700 transition"
                    >
                      <IoClose />
                    </button>
                  </div>
                </div>
              )}

              {showAddForm === 'color' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input
                      type="text"
                      value={colorForm.name}
                      onChange={(e) => setColorForm({ ...colorForm, name: e.target.value })}
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                      placeholder="Color name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={colorForm.value}
                        onChange={(e) => setColorForm({ ...colorForm, value: e.target.value })}
                        className="w-16 h-10 bg-gray-800 border border-gray-700 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={colorForm.value}
                        onChange={(e) => setColorForm({ ...colorForm, value: e.target.value })}
                        className="flex-1 p-2 bg-gray-800 border border-gray-700 rounded text-white"
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleAddColor}
                      className="flex-1 bg-pink-600 text-white py-2 rounded hover:bg-pink-700 transition flex items-center justify-center gap-2"
                    >
                      <IoSave />
                      Add Color
                    </button>
                    <button
                      onClick={resetForms}
                      className="px-4 bg-gray-600 text-white py-2 rounded hover:bg-gray-700 transition"
                    >
                      <IoClose />
                    </button>
                  </div>
                </div>
              )}

              {showAddForm === 'size' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input
                      type="text"
                      value={sizeForm.name}
                      onChange={(e) => setSizeForm({ ...sizeForm, name: e.target.value })}
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                      placeholder="Size name (e.g., XL, 32)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Display Order</label>
                    <input
                      type="number"
                      value={sizeForm.display_order}
                      onChange={(e) => setSizeForm({ ...sizeForm, display_order: parseInt(e.target.value) || 0 })}
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                      placeholder="0"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleAddSize}
                      className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition flex items-center justify-center gap-2"
                    >
                      <IoSave />
                      Add Size
                    </button>
                    <button
                      onClick={resetForms}
                      className="px-4 bg-gray-600 text-white py-2 rounded hover:bg-gray-700 transition"
                    >
                      <IoClose />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Edit Forms */}
        {editingItem && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md">
              <h3 className="text-lg font-bold mb-4">
                Edit {editingItem.type === 'category' ? 'Category' : editingItem.type === 'color' ? 'Color' : 'Size'}
              </h3>

              {editingItem.type === 'category' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input
                      type="text"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleUpdateCategory}
                      className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition flex items-center justify-center gap-2"
                    >
                      <IoSave />
                      Update
                    </button>
                    <button
                      onClick={resetForms}
                      className="px-4 bg-gray-600 text-white py-2 rounded hover:bg-gray-700 transition"
                    >
                      <IoClose />
                    </button>
                  </div>
                </div>
              )}

              {editingItem.type === 'color' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input
                      type="text"
                      value={colorForm.name}
                      onChange={(e) => setColorForm({ ...colorForm, name: e.target.value })}
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={colorForm.value}
                        onChange={(e) => setColorForm({ ...colorForm, value: e.target.value })}
                        className="w-16 h-10 bg-gray-800 border border-gray-700 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={colorForm.value}
                        onChange={(e) => setColorForm({ ...colorForm, value: e.target.value })}
                        className="flex-1 p-2 bg-gray-800 border border-gray-700 rounded text-white"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleUpdateColor}
                      className="flex-1 bg-pink-600 text-white py-2 rounded hover:bg-pink-700 transition flex items-center justify-center gap-2"
                    >
                      <IoSave />
                      Update
                    </button>
                    <button
                      onClick={resetForms}
                      className="px-4 bg-gray-600 text-white py-2 rounded hover:bg-gray-700 transition"
                    >
                      <IoClose />
                    </button>
                  </div>
                </div>
              )}

              {editingItem.type === 'size' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input
                      type="text"
                      value={sizeForm.name}
                      onChange={(e) => setSizeForm({ ...sizeForm, name: e.target.value })}
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Display Order</label>
                    <input
                      type="number"
                      value={sizeForm.display_order}
                      onChange={(e) => setSizeForm({ ...sizeForm, display_order: parseInt(e.target.value) || 0 })}
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleUpdateSize}
                      className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition flex items-center justify-center gap-2"
                    >
                      <IoSave />
                      Update
                    </button>
                    <button
                      onClick={resetForms}
                      className="px-4 bg-gray-600 text-white py-2 rounded hover:bg-gray-700 transition"
                    >
                      <IoClose />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagePage; 