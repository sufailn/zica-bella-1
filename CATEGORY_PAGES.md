# Category Pages Feature

This feature provides dedicated pages for browsing products by category, offering a better user experience for customers who want to shop specific product types.

## Pages Created

### 1. Categories Overview Page (`/shop/categories`)
- **Location**: `src/app/shop/categories/page.tsx`
- **Purpose**: Displays all available product categories in a grid layout
- **Features**:
  - Shows category name, description, and link to individual category page
  - Responsive grid layout (1 column on mobile, 2 on tablet, 3 on desktop)
  - Loading states and error handling
  - Link back to main shop page

### 2. Individual Category Page (`/shop/category/[slug]`)
- **Location**: `src/app/shop/category/[slug]/page.tsx`
- **Purpose**: Shows all products from a specific category
- **Features**:
  - Dynamic routing based on category slug
  - Breadcrumb navigation
  - Product grid with lazy loading
  - Category name and description display
  - Error handling for invalid categories
  - Link back to categories overview

### 3. Category Navigation Component
- **Location**: `src/components/Shop/CategoryLinks.tsx`
- **Purpose**: Provides navigation links to category pages
- **Features**:
  - Fetches categories from API
  - Displays as horizontal scrollable navigation
  - Optional "View All" link
  - Loading states

### 4. Category Breadcrumb Component
- **Location**: `src/components/Shop/CategoryBreadcrumb.tsx`
- **Purpose**: Shows navigation hierarchy on category pages
- **Features**:
  - Shop > Categories > [Category Name] breadcrumb
  - Clickable navigation links
  - Consistent styling with the rest of the site

## URL Structure

- `/shop` - Main shop page with all products
- `/shop/categories` - Categories overview page
- `/shop/category/[slug]` - Individual category page (e.g., `/shop/category/tshirts`)

## Database Integration

The feature integrates with the existing database schema:

- **Categories Table**: Stores category information (name, slug, description)
- **Products Table**: Contains category field that links to categories
- **API Routes**: 
  - `/api/categories` - Fetches all categories
  - `/api/products` - Fetches products (can filter by category)

## Features

### User Experience
- **SEO-friendly URLs**: Category pages use slug-based URLs
- **Responsive Design**: Works on all device sizes
- **Loading States**: Smooth loading experience with skeletons
- **Error Handling**: Graceful error states with retry options
- **Navigation**: Clear breadcrumb and back navigation

### Performance
- **Lazy Loading**: Components load only when needed
- **Caching**: API responses are cached for better performance
- **Optimized Images**: Product images are optimized for web

### Accessibility
- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Focus Management**: Clear focus indicators

## Usage

### For Customers
1. Visit `/shop/categories` to see all available categories
2. Click on any category to view products in that category
3. Use breadcrumbs to navigate back to previous pages
4. Use the "View All" link to see all products

### For Developers
The category pages are built using:
- **Next.js 13+** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **React Context** for state management
- **Supabase** for database operations

## Future Enhancements

Potential improvements for the category pages:
- Category-specific filtering (price, size, color)
- Category-specific sorting options
- Category banners/hero images
- Related categories suggestions
- Category-specific SEO meta tags
- Category analytics tracking 