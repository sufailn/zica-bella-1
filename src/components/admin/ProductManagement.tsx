import React, { useState, useEffect } from 'react'
import { IoPencil, IoTrash, IoAdd, IoClose, IoCheckmark } from 'react-icons/io5'
import ImageUpload from '../common/ImageUpload'

interface Product {
  id: number
  name: string
  description: string | null
  price: number
  images: string[]
  category: string
  stock_quantity: number
  sku: string | null
  is_featured: boolean
  is_active: boolean
  created_at: string
  product_colors?: Array<{
    id: number
    color_id: number
    colors: {
      id: number
      name: string
      value: string
    }
  }>
  product_sizes?: Array<{
    id: number
    size_id: number
    sizes: {
      id: number
      name: string
      display_order: number
    }
  }>
}

interface Color {
  id: number
  name: string
  value: string
}

interface Size {
  id: number
  name: string
  display_order: number
}

interface ProductFormData {
  name: string
  description: string
  price: string
  images: string[]
  category: string
  selectedColors: number[]
  selectedSizes: number[]
  stock_quantity: string
  sku: string
  is_featured: boolean
  is_active: boolean
}

const ProductManagement: React.FC = () => {
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [colors, setColors] = useState<Color[]>([])
  const [sizes, setSizes] = useState<Size[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    images: [],
    category: '',
    selectedColors: [],
    selectedSizes: [],
    stock_quantity: '0',
    sku: '',
    is_featured: false,
    is_active: true
  })
  const [submitting, setSubmitting] = useState(false)

  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: 'all', // all, active, inactive
    featured: 'all', // all, featured, not-featured
    stock: 'all' // all, in-stock, low-stock, out-of-stock
  })

  const categories = ['men', 'women', 'kids', 'accessories']

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [allProducts, filters])

  const fetchData = async () => {
    try {
      const [productsRes, colorsRes, sizesRes] = await Promise.all([
        fetch('/api/products'), // Get all products - the API will return all by default
        fetch('/api/colors'),
        fetch('/api/sizes')
      ])

      if (!productsRes.ok) {
        throw new Error(`Products API error: ${productsRes.status}`)
      }

      const [productsData, colorsData, sizesData] = await Promise.all([
        productsRes.json(),
        colorsRes.json(),
        sizesRes.json()
      ])

      console.log('Fetched products:', productsData) // Debug log
      setAllProducts(productsData.products || [])
      setColors(colorsData.colors || [])
      setSizes(sizesData.sizes || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      // Try to fetch with different parameters if first call fails
      try {
        const fallbackRes = await fetch('/api/products?active=false')
        const fallbackData = await fallbackRes.json()
        setAllProducts(fallbackData.products || [])
      } catch (fallbackError) {
        console.error('Fallback fetch also failed:', fallbackError)
      }
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...allProducts]

    // Search filter
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        (product.sku && product.sku.toLowerCase().includes(searchTerm)) ||
        (product.description && product.description.toLowerCase().includes(searchTerm))
      )
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(product => product.category === filters.category)
    }

    // Status filter
    if (filters.status === 'active') {
      filtered = filtered.filter(product => product.is_active)
    } else if (filters.status === 'inactive') {
      filtered = filtered.filter(product => !product.is_active)
    }

    // Featured filter
    if (filters.featured === 'featured') {
      filtered = filtered.filter(product => product.is_featured)
    } else if (filters.featured === 'not-featured') {
      filtered = filtered.filter(product => !product.is_featured)
    }

    // Stock filter
    if (filters.stock === 'in-stock') {
      filtered = filtered.filter(product => product.stock_quantity > 10)
    } else if (filters.stock === 'low-stock') {
      filtered = filtered.filter(product => product.stock_quantity > 0 && product.stock_quantity <= 10)
    } else if (filters.stock === 'out-of-stock') {
      filtered = filtered.filter(product => product.stock_quantity === 0)
    }

    setFilteredProducts(filtered)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      images: [],
      category: '',
      selectedColors: [],
      selectedSizes: [],
      stock_quantity: '0',
      sku: '',
      is_featured: false,
      is_active: true
    })
    setEditingProduct(null)
    setShowForm(false)
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      images: product.images || [],
      category: product.category,
      selectedColors: product.product_colors?.map(pc => pc.color_id) || [],
      selectedSizes: product.product_sizes?.map(ps => ps.size_id) || [],
      stock_quantity: product.stock_quantity.toString(),
      sku: product.sku || '',
      is_featured: product.is_featured,
      is_active: product.is_active
    })
    setShowForm(true)
  }

  const handleDelete = async (product: Product) => {
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setAllProducts(allProducts.filter((p: Product) => p.id !== product.id))
      } else {
        const data = await response.json()
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Failed to delete product')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products'
      const method = editingProduct ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stock_quantity: parseInt(formData.stock_quantity)
        })
      })

      if (response.ok) {
        await fetchData() // Refresh the product list
        resetForm()
      } else {
        const data = await response.json()
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Failed to save product')
    } finally {
      setSubmitting(false)
    }
  }

  const handleColorToggle = (colorId: number) => {
    setFormData(prev => ({
      ...prev,
      selectedColors: prev.selectedColors.includes(colorId)
        ? prev.selectedColors.filter(id => id !== colorId)
        : [...prev.selectedColors, colorId]
    }))
  }

  const handleSizeToggle = (sizeId: number) => {
    setFormData(prev => ({
      ...prev,
      selectedSizes: prev.selectedSizes.includes(sizeId)
        ? prev.selectedSizes.filter(id => id !== sizeId)
        : [...prev.selectedSizes, sizeId]
    }))
  }

  const handleImagesChange = (images: string[]) => {
    setFormData(prev => ({ ...prev, images }))
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Product Management</h2>
          <p className="text-gray-400 text-sm mt-1">
            Total: {allProducts.length} products | Showing: {filteredProducts.length}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center gap-2 font-medium"
        >
          <IoAdd /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 p-4 rounded-lg space-y-4">
        <h3 className="text-lg font-medium text-white mb-3">Filters</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Search</label>
            <input
              type="text"
              placeholder="Name, SKU, or description..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full p-2 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="w-full p-2 border border-gray-600 rounded-lg bg-gray-800 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat} className="capitalize">{cat}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full p-2 border border-gray-600 rounded-lg bg-gray-800 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Featured */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Featured</label>
            <select
              value={filters.featured}
              onChange={(e) => setFilters(prev => ({ ...prev, featured: e.target.value }))}
              className="w-full p-2 border border-gray-600 rounded-lg bg-gray-800 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Products</option>
              <option value="featured">Featured Only</option>
              <option value="not-featured">Not Featured</option>
            </select>
          </div>

          {/* Stock */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Stock</label>
            <select
              value={filters.stock}
              onChange={(e) => setFilters(prev => ({ ...prev, stock: e.target.value }))}
              className="w-full p-2 border border-gray-600 rounded-lg bg-gray-800 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Stock Levels</option>
              <option value="in-stock">In Stock (10+)</option>
              <option value="low-stock">Low Stock (1-10)</option>
              <option value="out-of-stock">Out of Stock (0)</option>
            </select>
          </div>
        </div>

        {/* Clear Filters */}
        <div className="flex justify-end">
          <button
            onClick={() => setFilters({
              search: '',
              category: '',
              status: 'all',
              featured: 'all',
              stock: 'all'
            })}
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            Clear All Filters
          </button>
        </div>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-white"
              >
                <IoClose size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-white">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-2 border border-gray-600 rounded-lg bg-gray-800 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-white">Category *</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full p-2 border border-gray-600 rounded-lg bg-gray-800 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-white">Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full p-2 border border-gray-600 rounded-lg bg-gray-800 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Stock Quantity */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-white">Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock_quantity: e.target.value }))}
                    className="w-full p-2 border border-gray-600 rounded-lg bg-gray-800 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* SKU */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-white">SKU</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                    className="w-full p-2 border border-gray-600 rounded-lg bg-gray-800 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-1 text-white">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 border border-gray-600 rounded-lg bg-gray-800 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium mb-1 text-white">Product Images</label>
                <ImageUpload
                  images={formData.images}
                  onImagesChange={handleImagesChange}
                  maxImages={5}
                />
              </div>

              {/* Colors */}
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Colors</label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {colors.map(color => (
                    <div
                      key={color.id}
                      className={`border rounded-lg p-2 cursor-pointer text-sm ${
                        formData.selectedColors.includes(color.id)
                          ? 'border-blue-500 bg-blue-900/30'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                      onClick={() => handleColorToggle(color.id)}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded border border-gray-500"
                          style={{ backgroundColor: color.value }}
                        />
                        <span className="text-xs text-white">{color.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Sizes</label>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                  {sizes.map(size => (
                    <div
                      key={size.id}
                      className={`border rounded-lg p-2 cursor-pointer text-center text-sm text-white ${
                        formData.selectedSizes.includes(size.id)
                          ? 'border-blue-500 bg-blue-900/30'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                      onClick={() => handleSizeToggle(size.id)}
                    >
                      {size.name}
                    </div>
                  ))}
                </div>
              </div>

              {/* Checkboxes */}
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-white">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                    className="rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500 focus:ring-2"
                  />
                  Featured Product
                </label>
                <label className="flex items-center gap-2 text-white">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500 focus:ring-2"
                  />
                  Active
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <IoCheckmark />
                  {submitting ? 'Saving...' : (editingProduct ? 'Update Product' : 'Create Product')}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products List */}
      <div className="bg-gray-900 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-900 divide-y divide-gray-800">
            {filteredProducts.map((product: Product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {product.images?.[0] && (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-10 h-10 rounded object-cover mr-3"
                      />
                    )}
                    <div>
                      <div className="text-sm font-medium text-white">{product.name}</div>
                      {product.sku && (
                        <div className="text-sm text-gray-400">SKU: {product.sku}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="capitalize text-sm text-white">{product.category}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  ${product.price.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  <div className="flex items-center gap-2">
                    <span>{product.stock_quantity}</span>
                    {product.stock_quantity === 0 && (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        Out
                      </span>
                    )}
                    {product.stock_quantity > 0 && product.stock_quantity <= 10 && (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Low
                      </span>
                    )}
                    {product.stock_quantity > 10 && (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        OK
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-1">
                    {product.is_active && (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    )}
                    {!product.is_active && (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        Inactive
                      </span>
                    )}
                    {product.is_featured && (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        Featured
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <IoPencil />
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <IoTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-400">
                  {allProducts.length === 0 
                    ? "No products found. Add your first product to get started."
                    : "No products match the current filters. Try adjusting your search criteria."
                  }
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ProductManagement 