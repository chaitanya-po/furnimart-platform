import { useEffect, useMemo, useState } from 'react'
import './App.css'

import './index.css';

const categories = ['All', 'Living Room', 'Bedroom', 'Dining', 'Office']

const furnitureImages = {
  living: '/images/hero-living-room.jpg',
  dining: '/images/dining-room.jpg',
  wooden: '/images/wooden-furniture.jpg',
}

function getCategory(product) {
  const text = `${product.name ?? ''} ${product.category ?? ''}`.toLowerCase()

  if (/bed|mattress|wardrobe/.test(text)) return 'Bedroom'
  if (/dining|table|chair/.test(text)) return 'Dining'
  if (/office|desk/.test(text)) return 'Office'
  return 'Living Room'
}

function getPrice(product) {
  const value = Number(product.price ?? product.unit_price ?? product.cost)

  if (!Number.isFinite(value) || value <= 0) {
    return 'Price on request'
  }

  return value.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  })
}

function getProductImage(product, index = 0) {
  const text =
    `${product.name ?? ''} ${product.category ?? ''} ${product.description ?? ''}`
      .toLowerCase()

  if (/sofa|couch|loveseat|sectional|living room/.test(text)) {
    return furnitureImages.living
  }

  if (/dining|table|chair|stool/.test(text)) {
    return furnitureImages.dining
  }

  if (/bed|mattress|wardrobe|cabinet|shelf|storage|wood/.test(text)) {
    return furnitureImages.wooden
  }

  return [
    furnitureImages.living,
    furnitureImages.dining,
    furnitureImages.wooden,
  ][index % 3]
}

function ProductImage({ product, index = 0, className = '', alt }) {
  const [failed, setFailed] = useState(false)
  const image = getProductImage(product, index)

  if (failed) {
    return (
      <div className={`image-fallback ${className}`} role="img" aria-label={alt || product.name}>
        <span>f.</span>
      </div>
    )
  }

  return (
    <img
      className={`real-furniture-image ${className}`}
      src={image}
      alt={alt || product.name || 'Furniture'}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  )
}

function App() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [cart, setCart] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [notice, setNotice] = useState('')

  async function loadProducts() {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/products')

      if (!response.ok) {
        throw new Error(`Catalog API returned HTTP ${response.status}`)
      }

      const data = await response.json()
      setProducts(Array.isArray(data) ? data : data.products ?? [])
    } catch (err) {
      setError(err.message || 'Unable to load the catalog.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const visibleProducts = useMemo(() => {
    const term = search.trim().toLowerCase()

    return products.filter((product) => {
      const searchable =
        `${product.name ?? ''} ${product.description ?? ''} ${product.category ?? ''}`
          .toLowerCase()

      return (
        searchable.includes(term) &&
        (category === 'All' || getCategory(product) === category)
      )
    })
  }, [products, search, category])

  function addToCart(product) {
    setCart((current) => [...current, product])
    setCartOpen(true)
    setNotice(`${product.name || 'Item'} added to your bag`)
    window.setTimeout(() => setNotice(''), 2400)
  }

  function removeFromCart(indexToRemove) {
    setCart((current) => current.filter((_, index) => index !== indexToRemove))
  }

  return (
    <div className="app-shell">
      <main className="collection-page" id="home">
        <section className="shop-section" id="shop">
          <div className="section-heading">
            <div className="title-stack">
              <p className="eyebrow">
                <span className="heading-dash" />
                A LITTLE SOMETHING FOR EVERY ROOM
              </p>
              <h2>
                Find your <em>kind</em> of comfort.
              </h2>
            </div>

            <p className="section-description">
              From slow Sunday mornings to lively dinner parties, meet the
              pieces that make a house yours.
            </p>
          </div>

          <div className="shop-toolbar">
            <div className="category-list" aria-label="Filter products by category">
              {categories.map((item) => (
                <button
                  key={item}
                  className={`category-chip ${category === item ? 'active' : ''}`}
                  onClick={() => setCategory(item)}
                >
                  {item}
                  {category === item && <span> ↗</span>}
                </button>
              ))}
            </div>

            <div className="shop-controls">
              <label className="search-box">
                <span aria-hidden="true">⌕</span>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search your next favourite..."
                  aria-label="Search products"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}
              </label>
              <button
                className="cart-button"
                onClick={() => setCartOpen(true)}
                aria-label={`Open bag, ${cart.length} items`}
              >
                <span className="bag-icon" aria-hidden="true">♧</span>
                <span>My bag</span>
                <span className="cart-count">{cart.length}</span>
              </button>
            </div>
          </div>

          <div className="divider" aria-hidden="true" />

          {loading ? (
            <div className="status-panel">
              <span className="loading-orbit" /> Curating your collection…
            </div>
          ) : error ? (
            <div className="status-panel error-panel">
              <span className="status-icon">!</span>
              <h3>Our collection is taking a little break.</h3>
              <p>{error}. Check the catalog service and try again.</p>
              <button className="primary-button" onClick={loadProducts}>
                Try again <span>↻</span>
              </button>
            </div>
          ) : visibleProducts.length === 0 ? (
            <div className="status-panel">
              <span className="status-icon">⌕</span>
              <h3>No pieces found just yet.</h3>
              <p>Try another search or explore a different category.</p>
              <button
                className="secondary-button"
                onClick={() => {
                  setSearch('')
                  setCategory('All')
                }}
              >
                Show all pieces
              </button>
            </div>
          ) : (
            <div className="product-grid">
              {visibleProducts.map((product, index) => (
                <article
                  className="product-card"
                  key={product.id ?? `${product.name}-${index}`}
                >
                  <div className={`product-image product-tone-${index % 4}`}>
                    <div className="product-image-top">
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      <span>{product.category || getCategory(product)}</span>
                    </div>

                    {index === 0 && (
                      <span className="product-badge">A FAVOURITE</span>
                    )}

                    <ProductImage product={product} index={index} />

                    <button
                      className="quick-add"
                      onClick={() => addToCart(product)}
                      aria-label={`Add ${product.name || 'item'} to bag`}
                    >
                      +
                    </button>

                    <div className="product-hover-label">
                      A PIECE FOR YOUR PLACE ↗
                    </div>
                  </div>

                  <div className="product-info">
                    <div>
                      <h3>{product.name || 'A thoughtful piece'}</h3>
                      <p>
                        {product.description || 'Simple design. Everyday living.'}
                      </p>
                    </div>
                    <span className="product-price">{getPrice(product)}</span>
                  </div>

                  <button
                    className="add-link"
                    onClick={() => addToCart(product)}
                  >
                    <span>Add to bag</span>
                    <span className="add-arrow">↗</span>
                  </button>
                </article>
              ))}
            </div>
          )}

          {!loading && !error && (
            <div className="collection-footer">
              <span>
                SHOWING {visibleProducts.length} OF {products.length} PIECES
              </span>
              <span>
                GOOD THINGS TAKE SHAPE HERE <i>✳</i>
              </span>
            </div>
          )}
        </section>
      </main>

      {notice && (
        <div className="notice-toast" role="status">
          <span>✓</span>
          {notice}
        </div>
      )}

      {cartOpen && (
        <div
          className="cart-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setCartOpen(false)
          }}
        >
          <aside className="cart-drawer" aria-label="Shopping bag">
            <div className="cart-drawer-header">
              <div>
                <p className="eyebrow">THE GOOD STUFF</p>
                <h2>
                  Your bag <em>({cart.length})</em>
                </h2>
              </div>
              <button
                className="close-cart"
                onClick={() => setCartOpen(false)}
                aria-label="Close bag"
              >
                ×
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="empty-cart">
                <span>♡</span>
                <h3>A little room for something lovely.</h3>
                <p>Your bag is waiting for its first favourite.</p>
                <button
                  className="primary-button"
                  onClick={() => {
                    setCartOpen(false)
                    document.getElementById('shop')?.scrollIntoView({
                      behavior: 'smooth',
                    })
                  }}
                >
                  Explore the collection ↗
                </button>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map((product, index) => (
                    <div
                      className="cart-item"
                      key={`${product.id ?? product.name}-${index}`}
                    >
                      <div className={`cart-item-art product-tone-${index % 4}`}>
                        <ProductImage product={product} index={index} />
                      </div>

                      <div className="cart-item-info">
                        <h3>{product.name || 'A thoughtful piece'}</h3>
                        <p>{getPrice(product)}</p>
                        <button onClick={() => removeFromCart(index)}>
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-drawer-footer">
                  <p>This is a demo bag. Checkout isn't connected yet.</p>
                  <button
                    className="primary-button"
                    onClick={() => setCartOpen(false)}
                  >
                    Keep exploring ↗
                  </button>
                </div>
              </>
            )}
          </aside>
        </div>
      )}
    </div>
  )
}

export default App