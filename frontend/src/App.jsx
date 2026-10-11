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
    setNotice(`${product.name || 'Item'} added to your bag`)
    window.setTimeout(() => setNotice(''), 2400)
  }

  function removeFromCart(indexToRemove) {
    setCart((current) => current.filter((_, index) => index !== indexToRemove))
  }

  return (
    <div className="app-shell">
      <div className="announcement">
        <span className="announcement-star">✳</span>
        Thoughtful design. Everyday comfort. Made for your home.
        <span className="announcement-star">✳</span>
      </div>

      <header className="site-header">
        <a className="brand" href="#home" aria-label="FurniMart home">
          <span className="brand-mark">f.</span>
          <span>
            furni<span className="brand-light">mart</span>
          </span>
        </a>

        <nav className="main-nav" aria-label="Main navigation">
          <a href="#shop">Shop all</a>
          <a href="#story">Our philosophy</a>
          <a href="#footer">Contact</a>
        </nav>

        <button className="cart-button" onClick={() => setCartOpen(true)}>
          <span className="bag-icon" aria-hidden="true">♧</span>
          <span>My bag</span>
          <span className="cart-count">{cart.length}</span>
        </button>
      </header>

      <main id="home">
        <section className="hero" id="story">
          <div className="hero-copy">
            <div className="hero-kicker">
              <span /> THE ART OF FEELING AT HOME
            </div>

            <h1>
              Spaces that
              <br />
              tell your <em>story.</em>
            </h1>

            <p className="hero-description">
              Furniture should do more than fill a room. It should make you
              feel something. Discover thoughtful pieces for the life you love.
            </p>

            <div className="hero-actions">
              <a className="primary-button" href="#shop">
                Explore the collection <span>↗</span>
              </a>
              <a className="text-link" href="#shop">
                Discover our pieces <span>↓</span>
              </a>
            </div>

            <div className="hero-proof">
              <div className="proof-avatars">
                <span>F</span>
                <span>H</span>
                <span>+</span>
              </div>
              <p>
                <strong>Made for real life</strong>
                <br />
                Designed with intention.
              </p>
            </div>
          </div>

          <div className="hero-visual" aria-label="Contemporary living room">
            <img
              className="hero-real-image"
              src={furnitureImages.living}
              alt="Contemporary living room furniture"
              fetchPriority="high"
            />

            <div className="hero-visual-top">
              <span>THE SLOW LIVING EDIT</span>
              <span>No. 001</span>
            </div>

            <div className="hero-visual-bottom">
              <span>Natural textures</span>
              <span>Timeless silhouettes</span>
            </div>

            <div className="hero-stamp">
              <span>LIVE</span>
              <span>LOVELY</span>
              <i>✳</i>
            </div>
          </div>

          <div className="hero-bottom-note">
            <span>01 / CONSIDERED LIVING</span>
            <span>Good design, without the fuss ↓</span>
          </div>
        </section>

        <section className="values-strip" aria-label="Our values">
          <div><span className="value-symbol">✳</span><p>Thoughtful design</p></div>
          <div><span className="value-symbol">◈</span><p>Everyday comfort</p></div>
          <div><span className="value-symbol">⌂</span><p>Made for your space</p></div>
          <div><span className="value-symbol">♡</span><p>Pieces to keep</p></div>
        </section>

        <section className="shop-section" id="shop">
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                <span className="heading-dash" /> A LITTLE SOMETHING FOR EVERY ROOM
              </p>
              <h2>
                Find your <em>kind of comfort.</em>
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
          </div>

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

                    <ProductImage
                      product={product}
                      index={index}
                    />

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
              <span>GOOD THINGS TAKE SHAPE HERE <i>✳</i></span>
            </div>
          )}
        </section>

        <section className="editorial-section">
          <div className="editorial-art editorial-photo">
            <img
              src={furnitureImages.wooden}
              alt="Natural wood furniture and warm interior details"
              loading="lazy"
            />
            <span className="editorial-label">A QUIETER KIND OF LUXURY</span>
          </div>

          <div className="editorial-copy">
            <p className="eyebrow">
              <span className="heading-dash" /> OUR PHILOSOPHY
            </p>
            <h2>
              Less, but
              <br />
              a whole lot <em>better.</em>
            </h2>
            <p>
              We believe the best rooms aren't the ones that look perfect.
              They're the ones that feel right. Warm materials, considered
              forms, and room for the little moments that make life yours.
            </p>
            <a className="editorial-link" href="#shop">
              Find pieces that feel like you <span>↗</span>
            </a>
          </div>
        </section>

        <section className="closing-banner">
          <span className="closing-spark">✳</span>
          <p className="eyebrow">YOUR HOME, YOUR STORY</p>
          <h2>
            Come on in.
            <br />
            <em>Make yourself at home.</em>
          </h2>
          <a className="closing-button" href="#shop">
            Find your favourite piece <span>↗</span>
          </a>
          <span className="closing-caption">GOOD DESIGN. GOOD FEELINGS.</span>
        </section>
      </main>

      <footer id="footer">
        <a className="brand footer-brand" href="#home">
          <span className="brand-mark">f.</span>
          <span>furni<span className="brand-light">mart</span></span>
        </a>
        <p>Furniture for the way you really live.</p>
        <div className="footer-links">
          <a href="#shop">Shop</a>
          <a href="#story">Our story</a>
          <a href="mailto:hello@furnimart.example">Get in touch</a>
        </div>
        <span>© {new Date().getFullYear()} FurniMart</span>
      </footer>

      {notice && (
        <div className="notice-toast" role="status">
          <span>✓</span>{notice}
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
                <h2>Your bag <em>({cart.length})</em></h2>
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