import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowRight, Check, ChevronLeft, ChevronRight, Minus, Plus, Menu, Music2, Send, X, Search as SearchIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { legalInfo, tradeRegisterText } from '@/config/legal';
import ZoomModal from '@/components/ZoomModal';
import PostOfficeAutocomplete, { type PostOffice } from '@/components/PostOfficeAutocomplete';
import {
  type Product,
  type GarmentType,
  type ColorVariant,
  type Size,
  type SubcollectionName,
  allProducts,
  getSizesForGarment,
  getSizeHintsForGarment,
  formatPrice,
  getGarmentLabel,
  getColorLabel,
  COLLECTIONS,
  FUTURE_COLLECTIONS,
  TSHIRT_SIZE_CHART,
  HOODIE_SIZE_CHART,
} from '@/data/catalog';
import OfferPage from '@/pages/OfferPage';
import PrivacyPage from '@/pages/PrivacyPage';
import DeliveryReturnsPage from '@/pages/DeliveryReturnsPage';
import PaymentPage from '@/pages/PaymentPage';
import OrderSuccessPage from '@/pages/OrderSuccessPage';

type CartItem = {
  id: string;
  product: Product;
  size: Size;
  quantity: number;
  unitPrice: number;
  color: ColorVariant;
};

type FormState = {
  fullName: string;
  phone: string;
  email: string;
  telegram: string;
  pickupPoint: string;
  shippingMethod: string;
};

const initialForm: FormState = {
  fullName: '',
  phone: '',
  email: '',
  telegram: '',
  pickupPoint: '',
  shippingMethod: 'Европочта',
};

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name-asc';
type Route = 'home' | 'offer' | 'privacy' | 'delivery-returns' | 'payment' | 'order-success';

const getRouteFromHash = (): Route => {
  const hash = window.location.hash.replace('#/', '').replace('#', '');
  if (hash === 'offer') return 'offer';
  if (hash === 'privacy') return 'privacy';
  if (hash === 'delivery-returns') return 'delivery-returns';
  if (hash === 'payment') return 'payment';
  if (hash === 'order-success') return 'order-success';
  return 'home';
};

function App() {
  const [route, setRoute] = useState<Route>(getRouteFromHash());
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState<FormState>(initialForm);
  const [cardSizes, setCardSizes] = useState<Record<string, Size>>({});
  const [cardQuantities, setCardQuantities] = useState<Record<string, number>>({});
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [expandedProduct, setExpandedProduct] = useState<Product | null>(null);
  const [paramsProduct, setParamsProduct] = useState<Product | null>(null);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [sizeGuideImage, setSizeGuideImage] = useState(TSHIRT_SIZE_CHART);
  const [addedProduct, setAddedProduct] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<GarmentType>('tshirts');
  const [activeSubcollection, setActiveSubcollection] = useState<SubcollectionName | null>(null);
  const [activeTheme, setActiveTheme] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [colorFilter, setColorFilter] = useState<ColorVariant | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [selectedOffice, setSelectedOffice] = useState<PostOffice | null>(null);
  const [consentOffer, setConsentOffer] = useState(false);
  const [consentTerms, setConsentTerms] = useState(false);
  const [consentData, setConsentData] = useState(false);
  const [lastOrder, setLastOrder] = useState<{ number: string; email: string; shippingMethod: string; pickupPoint: string } | null>(null);

  useEffect(() => {
    const handler = () => {
      setRoute(getRouteFromHash());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  useEffect(() => {
    if (paramsProduct) {
      const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setParamsProduct(null); };
      window.addEventListener('keydown', handler);
      document.body.style.overflow = 'hidden';
      return () => {
        window.removeEventListener('keydown', handler);
        document.body.style.overflow = '';
      };
    }
  }, [paramsProduct]);

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const getCardSize = (product: Product): Size => cardSizes[product.id] ?? 'M';
  const getCardQuantity = (product: Product): number => cardQuantities[product.id] ?? 1;

  const changeCardQuantity = (product: Product, amount: number) => {
    const nextQuantity = Math.max(1, getCardQuantity(product) + amount);
    setCardQuantities((current) => ({ ...current, [product.id]: nextQuantity }));
  };

  const addToCart = (product: Product) => {
    const size = getCardSize(product);
    const quantity = getCardQuantity(product);
    const unitPrice = product.currentPrice;
    const id = `${product.id}-${size}`;

    setCart((current) => {
      const existing = current.find((item) => item.id === id);
      if (existing) {
        return current.map((item) => item.id === id ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...current, { id, product, size, quantity, unitPrice, color: product.color }];
    });
    setAddedProduct(product.title);
    window.setTimeout(() => setAddedProduct(null), 1800);
  };

  const updateCartQuantity = (id: string, amount: number) => {
    setCart((current) => current.map((item) => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + amount) } : item));
  };

  const removeFromCart = (id: string) => {
    setCart((current) => current.filter((item) => item.id !== id));
  };

  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const productsTotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const filteredProducts = useMemo(() => {
    let result = allProducts.filter((p) => p.garmentType === activeTab);

    if (activeSubcollection) {
      result = result.filter((p) => p.subcollection === activeSubcollection);
    }
    if (activeTheme) {
      result = result.filter((p) => p.theme === activeTheme);
    }
    if (colorFilter !== 'all') {
      result = result.filter((p) => p.color === colorFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((p) =>
        p.title.toLowerCase().includes(q) ||
        p.collection.toLowerCase().includes(q) ||
        p.subcollection.toLowerCase().includes(q) ||
        p.theme.toLowerCase().includes(q) ||
        getGarmentLabel(p.garmentType).toLowerCase().includes(q) ||
        getColorLabel(p.color).toLowerCase().includes(q)
      );
    }

    if (sortBy === 'price-asc') result = [...result].sort((a, b) => a.currentPrice - b.currentPrice);
    else if (sortBy === 'price-desc') result = [...result].sort((a, b) => b.currentPrice - a.currentPrice);
    else if (sortBy === 'name-asc') result = [...result].sort((a, b) => a.title.localeCompare(b.title, 'ru'));

    return result;
  }, [activeTab, activeSubcollection, activeTheme, colorFilter, searchQuery, sortBy]);

  const activeSizes = getSizesForGarment(activeTab);
  const sizeHints = getSizeHintsForGarment(activeTab);
  const activeSizeChart = activeTab === 'tshirts' ? TSHIRT_SIZE_CHART : HOODIE_SIZE_CHART;

  const belarusSubcollections = COLLECTIONS[0].subcollections;
  const mapThemes = belarusSubcollections.find((s) => s.name === 'МАПА')?.themes ?? [];
  const cosmosThemes = belarusSubcollections.find((s) => s.name === 'КОСМАС')?.themes ?? [];

  const submitOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (cart.length === 0) {
      setError('Добавьте хотя бы одну вещь в корзину.');
      return;
    }
    if (!consentOffer || !consentTerms || !consentData) {
      setError('Необходимо принять все условия для оформления заказа.');
      return;
    }

    setIsSending(true);
    const orderNumber = `MEZHA-${Date.now().toString().slice(-6)}`;
    const telegram = form.telegram.trim() || 'Не заполнялось';
    const productSummary = cart.map((item) =>
      `${item.product.title} — ${item.size}, ${getGarmentLabel(item.product.garmentType)}, ${getColorLabel(item.color)}, ${item.quantity} шт., ${formatPrice(item.unitPrice)}/шт.`
    ).join('\n');
    const sizeSummary = cart.map((item) => `${item.product.title}: ${item.size}`).join('; ');

    if (supabase) {
      const { error: insertError } = await supabase.from('mezha_orders').insert({
        full_name: form.fullName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        telegram,
        size: sizeSummary,
        pickup_point: form.pickupPoint.trim(),
        shipping_method: form.shippingMethod,
        product: productSummary,
      });

      if (insertError) {
        setError('Не удалось отправить заявку. Попробуйте ещё раз или напишите нам в Telegram.');
        setIsSending(false);
        return;
      }
    }

    setLastOrder({
      number: orderNumber,
      email: form.email.trim(),
      shippingMethod: form.shippingMethod,
      pickupPoint: form.pickupPoint.trim(),
    });
    setForm(initialForm);
    setCart([]);
    setIsSending(false);
    window.location.hash = '#/order-success';
  };

  const openSizeGuide = (product: Product) => {
    setSizeGuideImage(product.sizeChart);
    setSizeGuideOpen(true);
  };

  const navigateTo = (r: Route) => {
    if (r === 'home') window.location.hash = '';
    else window.location.hash = `#/${r}`;
    setMenuOpen(false);
  };

  // --- LEGAL PAGES ---
  if (route === 'offer') return <><Nav menuOpen={menuOpen} setMenuOpen={setMenuOpen} navigateTo={navigateTo} cartCount={totalQuantity} /><OfferPage /><Footer navigateTo={navigateTo} /></>;
  if (route === 'privacy') return <><Nav menuOpen={menuOpen} setMenuOpen={setMenuOpen} navigateTo={navigateTo} cartCount={totalQuantity} /><PrivacyPage /><Footer navigateTo={navigateTo} /></>;
  if (route === 'delivery-returns') return <><Nav menuOpen={menuOpen} setMenuOpen={setMenuOpen} navigateTo={navigateTo} cartCount={totalQuantity} /><DeliveryReturnsPage /><Footer navigateTo={navigateTo} /></>;
  if (route === 'payment') return <><Nav menuOpen={menuOpen} setMenuOpen={setMenuOpen} navigateTo={navigateTo} cartCount={totalQuantity} /><PaymentPage /><Footer navigateTo={navigateTo} /></>;
  if (route === 'order-success' && lastOrder) {
    return <><Nav menuOpen={menuOpen} setMenuOpen={setMenuOpen} navigateTo={navigateTo} cartCount={0} /><OrderSuccessPage {...lastOrder} onBack={() => navigateTo('home')} /><Footer navigateTo={navigateTo} /></>;
  }

  return (
    <main>
      <Nav menuOpen={menuOpen} setMenuOpen={setMenuOpen} navigateTo={navigateTo} cartCount={totalQuantity} />

      <section className="hero container" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span className="dot" /> белорусский streetwear · 2026</p>
          <h1>Одежда<br /><em>твоего</em><br />края.</h1>
          <p className="hero-text">МЕЖА — локальный бренд из Беларуси, созданный на стыке брутального минимализма и глубоких смыслов. Форма для тех, кто не боится очерчивать свои границы.</p>
          <a className="button button-dark" href="#catalog">Смотреть вещи <ArrowDown size={17} /></a>
        </div>
        <div className="hero-art">
          <div className="hero-art-top"><span>МЕЖА / 01</span><span>Беларусь</span></div>
          <img src="/images/logo.png" alt="Логотип бренда МЕЖА" />
          <div className="hero-art-bottom"><span>KEEP YOUR LINE</span><span>53°31′45″ N / 28°02′42″ E</span></div>
          <div className="art-cross cross-one" /><div className="art-cross cross-two" />
        </div>
      </section>

      <div className="ticker" aria-label="МЕЖА — держи свою линию"><div className="ticker-track">МЕЖА <span>•</span> ОДЕЖДА ТВОЕГО КРАЯ <span>•</span> БЕЛАРУСЬ <span>•</span> МЕЖА <span>•</span> ОДЕЖДА ТВОЕГО КРАЯ <span>•</span> БЕЛАРУСЬ <span>•</span></div></div>

      <section className="about container" id="about">
        <div className="section-label"><span>01</span><span>О бренде</span></div>
        <div className="about-grid"><h2>Одежда —<br /><span>это позиция.</span></h2><div className="about-copy"><p>Мы создаём вещи с внутренним стержнем. МЕЖА говорит о границах, которые мы проводим сами — и о смелости их двигать.</p><p>Каждая коллекция собрана в Беларуси небольшими тиражами. Мы не гонимся за скоростью. Мы за то, чтобы вещь осталась с тобой надолго.</p></div></div>
      </section>

      <section className="catalog container" id="catalog">
        <div className="section-heading"><div className="section-label"><span>02</span><span>Каталог</span></div><h2>Вещи<br /><em>с характером.</em></h2><p>Базовая форма. Нестандартная мысль.</p></div>

        <div className="catalog-tabs">
          <button className={activeTab === 'tshirts' ? 'active' : ''} onClick={() => { setActiveTab('tshirts'); setActiveSubcollection(null); setActiveTheme(null); setColorFilter('all'); }}>ФУТБОЛКИ</button>
          <button className={activeTab === 'hoodies' ? 'active' : ''} onClick={() => { setActiveTab('hoodies'); setActiveSubcollection(null); setActiveTheme(null); setColorFilter('all'); }}>ТОЛСТОВКИ</button>
        </div>

        <div className="collection-tabs">
          <button className={activeSubcollection === null ? 'active' : ''} onClick={() => { setActiveSubcollection(null); setActiveTheme(null); }}>ВСЕ</button>
          {belarusSubcollections.map((sub) => (
            <button
              key={sub.name}
              className={activeSubcollection === sub.name && !activeTheme ? 'active' : ''}
              onClick={() => { setActiveSubcollection(sub.name); setActiveTheme(null); }}
            >{sub.name}</button>
          ))}
        </div>

        {activeSubcollection === 'МАПА' && mapThemes.length > 0 && (
          <div className="theme-tabs">
            <button className={activeTheme === null ? 'active' : ''} onClick={() => setActiveTheme(null)}>ВСЕ</button>
            {mapThemes.map((t) => (
              <button key={t.name} className={activeTheme === t.name ? 'active' : ''} onClick={() => setActiveTheme(t.name)}>{t.name}</button>
            ))}
          </div>
        )}
        {activeSubcollection === 'КОСМАС' && cosmosThemes.length > 0 && (
          <div className="theme-tabs">
            <button className={activeTheme === null ? 'active' : ''} onClick={() => setActiveTheme(null)}>ВСЕ</button>
            {cosmosThemes.map((t) => (
              <button key={t.name} className={activeTheme === t.name ? 'active' : ''} onClick={() => setActiveTheme(t.name)}>{t.name}</button>
            ))}
          </div>
        )}

        {activeSubcollection === 'КОСМАС' && (
          <div className="color-filter-row">
            <span className="color-filter-label">ЦВЕТ:</span>
            <button className={`color-filter-btn ${colorFilter === 'all' ? 'active' : ''}`} onClick={() => setColorFilter('all')}>Все</button>
            <button className={`color-filter-btn ${colorFilter === 'white' ? 'active' : ''}`} onClick={() => setColorFilter('white')}>Белый</button>
            <button className={`color-filter-btn ${colorFilter === 'black' ? 'active' : ''}`} onClick={() => setColorFilter('black')}>Чёрный</button>
          </div>
        )}

        <div className="catalog-search-row">
          <div className="catalog-search-wrap">
            <SearchIcon size={15} className="catalog-search-icon" />
            <input
              type="text"
              className="catalog-search-input"
              placeholder="Поиск по названию, коллекции, теме…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select className="catalog-sort" value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)}>
            <option value="default">По умолчанию</option>
            <option value="price-asc">Цена ↑</option>
            <option value="price-desc">Цена ↓</option>
            <option value="name-asc">Название А–Я</option>
          </select>
        </div>

        <div className="product-grid">
          {filteredProducts.map((product, i) => {
            const total = filteredProducts.length;
            return <article className="product-card" key={product.id}>
              <div className="product-image" onClick={() => setExpandedProduct(product)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setExpandedProduct(product); } }} role="button" tabIndex={0} aria-label={`Рассмотреть ${getGarmentLabel(product.garmentType)} ${product.title}`}>
                <img className="product-photo" src={product.image} alt={`${getGarmentLabel(product.garmentType)} ${product.title}`} loading="lazy" onError={(e) => { console.warn(`Image not found: ${product.title} — ${product.image}`); (e.target as HTMLImageElement).style.opacity = '0.3'; }} />
                <span className="product-number">{String(i + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
                <span className="product-stamp">МЕЖА<br />MADE IN BY</span>
                {product.color !== 'bone' && <span className="product-color-badge">{product.color === 'black' ? 'ЧЁРН' : 'БЕЛ'}</span>}
              </div>
              <div className="product-info">
                <div><h3>{product.title}</h3><p>{product.density}</p></div>
                <div className="product-price-wrap">
                  {product.oldPrice && <span className="product-old-price">{formatPrice(product.oldPrice)}</span>}
                  <strong>{formatPrice(product.currentPrice)}</strong>
                </div>
              </div>
              <button className="product-choose" onClick={() => setParamsProduct(product)}>Выбрать параметры <ArrowRight size={16} /></button>
            </article>;
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="catalog-empty-tab">
            <p>Коллекция готовится.</p>
          </div>
        )}

        {FUTURE_COLLECTIONS.length > 0 && (
          <div className="future-collections">
            {FUTURE_COLLECTIONS.map((col) => (
              <div key={col} className="future-collection-item">{col}</div>
            ))}
          </div>
        )}

        <p className="catalog-sizes-note">Размеры соответствуют стандартным белорусским. Если вы хотите, чтобы вещь сидела свободно (оверсайз), рекомендуем заказывать на один размер больше вашего привычного.</p>
      </section>

      <section className="size-guide container" id="sizes">
        <div className="size-guide-heading"><div className="section-label"><span>03</span><span>Размеры · {activeTab === 'tshirts' ? 'Футболки' : 'Толстовки'}</span></div><h2>Найди<br /><em>свой размер.</em></h2><p>Сними мерки по любимой вещи и сравни с таблицей. Для оверсайз-посадки выбирай размер по ширине изделия под проймой.</p></div>
        <div className="size-guide-card"><img src={activeSizeChart} alt={`Таблица размеров ${activeTab === 'tshirts' ? 'маек' : 'толстовок'} МЕЖА`} onClick={() => { setSizeGuideImage(activeSizeChart); setSizeGuideOpen(true); }} /><div className="size-guide-note"><span>РАЗМЕРЫ</span><strong>XS — {sizeHints[0]}<br />S — {sizeHints[1]}<br />M — {sizeHints[2]}<br />L — {sizeHints[3]}</strong><p>Измеряй вещь на ровной поверхности.</p></div></div>
      </section>

      <section className="manifesto container"><div className="manifesto-line" /><p>НЕ ИЩИ<br /><span>СВОЁ МЕСТО.</span><br />СОЗДАЙ ЕГО.</p><span className="manifesto-mark">М / 2026</span></section>

      <section className="order-section container" id="order">
        <div className="order-intro"><div className="section-label"><span>04</span><span>Заказ</span></div><h2>Вещь<br /><em>тебе.</em></h2><p>Заполните форму — мы изготовим ваш заказ и передадим его в службу доставки в течение 5–7 рабочих дней. Номер для отслеживания посылки придет вам на электронную почту.</p></div>
        <div className="order-form-wrap">
          <form className="order-form" onSubmit={submitOrder}>
            <p className="required-note"><span>*</span> обязательные поля</p>
            <label><span>ФИО <b>*</b></span><input required value={form.fullName} onChange={(event) => updateField('fullName', event.target.value)} placeholder="Как к вам обращаться?" /></label>
            <div className="form-row"><label><span>ТЕЛЕФОН <b>*</b></span><input required type="tel" value={form.phone} onChange={(event) => updateField('phone', event.target.value)} placeholder="+375 (__) ___-__-__" /></label><label><span>ЭЛЕКТРОННАЯ ПОЧТА <b>*</b></span><input required type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} placeholder="example@gmail.com" /></label></div>
            <label><span>TELEGRAM</span><input value={form.telegram} onChange={(event) => updateField('telegram', event.target.value)} placeholder="Необязательно" /></label>
            <fieldset><legend>СПОСОБ ДОСТАВКИ <b>*</b></legend><div className="shipping-options">{['Европочта', 'Белпочта'].map((shippingMethod) => <label className={form.shippingMethod === shippingMethod ? 'active' : ''} key={shippingMethod}><input type="radio" name="shippingMethod" value={shippingMethod} checked={form.shippingMethod === shippingMethod} onChange={(event) => { updateField('shippingMethod', event.target.value); updateField('pickupPoint', ''); setSelectedOffice(null); }} />{shippingMethod}</label>)}</div></fieldset>
            <label><span>ОТДЕЛЕНИЕ ПОЛУЧЕНИЯ <b>*</b></span>
              <PostOfficeAutocomplete
                provider={form.shippingMethod === 'Белпочта' ? 'belpost' : 'evropochta'}
                value={form.pickupPoint}
                onChange={(v) => updateField('pickupPoint', v)}
                onSelect={setSelectedOffice}
                error={!!form.pickupPoint && !selectedOffice ? '' : ''}
              />
            </label>
            <div className="cart-panel"><div className="cart-heading"><h3>Корзина</h3><span>{totalQuantity} шт.</span></div>{cart.length === 0 ? <p className="cart-empty">Добавьте вещи из каталога, чтобы оформить заказ.</p> : <div className="cart-items">{cart.map((item) => <div className="cart-item" key={item.id}><div><strong>{item.product.title}</strong><span>{getGarmentLabel(item.product.garmentType)} · Размер {item.size} · {getColorLabel(item.color)} · {formatPrice(item.unitPrice)} / шт.</span></div><div className="cart-item-actions"><div className="quantity-control"><button type="button" onClick={() => updateCartQuantity(item.id, -1)} aria-label="Уменьшить количество"><Minus size={13} /></button><strong>{item.quantity}</strong><button type="button" onClick={() => updateCartQuantity(item.id, 1)} aria-label="Увеличить количество"><Plus size={13} /></button></div><button className="remove-item" type="button" onClick={() => removeFromCart(item.id)}>Убрать</button></div></div>)}</div>}
              <div className="cart-summary">
                <div><span>ТОВАРЫ</span><strong>{formatPrice(productsTotal)}</strong></div>
                <div className="cart-delivery-row"><span>ДОСТАВКА</span><strong>Оплата при получении</strong></div>
                <div className="cart-delivery-notice">Стоимость доставки не входит в сумму онлайн-оплаты. Доставка Белпочтой или Европочтой оплачивается получателем отдельно при получении отправления.</div>
                <div className="cart-total"><span>ИТОГО К ОПЛАТЕ</span><strong>{formatPrice(productsTotal)}</strong></div>
              </div>
            </div>

            <div className="consent-group">
              <label className="consent-label"><input type="checkbox" checked={consentOffer} onChange={(e) => setConsentOffer(e.target.checked)} /><span>Я ознакомился и принимаю условия <a href="#/offer" onClick={() => navigateTo('offer')}>Публичной оферты</a>.</span></label>
              <label className="consent-label"><input type="checkbox" checked={consentTerms} onChange={(e) => setConsentTerms(e.target.checked)} /><span>Я ознакомился с условиями <a href="#/delivery-returns" onClick={() => navigateTo('delivery-returns')}>оплаты, доставки, отмены заказа и возврата</a>.</span></label>
              <label className="consent-label"><input type="checkbox" checked={consentData} onChange={(e) => setConsentData(e.target.checked)} /><span>Я согласен на <a href="#/privacy" onClick={() => navigateTo('privacy')}>обработку персональных данных</a> для оформления и исполнения заказа.</span></label>
            </div>

            {error && <p className="form-error">{error}</p>}
            <button className="submit-button" type="submit" disabled={isSending}>{isSending ? 'Отправляем…' : <>Оформить заказ <Send size={17} /></>}</button>
            <p className="form-footnote">Нажимая кнопку, вы подтверждаете ознакомление с Публичной офертой, условиями оплаты, доставки и обработки персональных данных.</p>
          </form>
        </div>
      </section>

      {sizeGuideOpen && <ZoomModal imageSrc={sizeGuideImage} imageAlt="Таблица размеров МЕЖА — увеличенный просмотр" title="Таблица размеров" onClose={() => setSizeGuideOpen(false)} />}
      {expandedProduct && <ZoomModal imageSrc={expandedProduct.image} imageAlt={`${expandedProduct.title} — увеличенный просмотр`} title={expandedProduct.title} subtitle={`${expandedProduct.subcollection}${expandedProduct.theme ? ' · ' + expandedProduct.theme : ''}`} onClose={() => setExpandedProduct(null)} />}

      {paramsProduct && (
        <div className="image-modal params-modal" role="dialog" aria-modal="true" aria-label={`Выбор параметров: ${paramsProduct.title}`} onClick={() => setParamsProduct(null)}>
          <div className="params-modal-content" onClick={(event) => event.stopPropagation()}>
            <button className="params-modal-close" onClick={() => setParamsProduct(null)} aria-label="Закрыть окно выбора параметров"><X size={21} /></button>
            <div className="params-modal-photo" onClick={() => setExpandedProduct(paramsProduct)} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setExpandedProduct(paramsProduct); } }} aria-label={`Рассмотреть ${getGarmentLabel(paramsProduct.garmentType)} ${paramsProduct.title}`}>
              <img src={paramsProduct.image} alt={`${getGarmentLabel(paramsProduct.garmentType)} ${paramsProduct.title}`} />
              {paramsProduct.color !== 'bone' && <span className="product-color-badge">{paramsProduct.color === 'black' ? 'ЧЁРН' : 'БЕЛ'}</span>}
            </div>
            <div className="params-modal-side">
              <div className="params-modal-info">
                <span className="params-modal-mark">{paramsProduct.subcollection}{paramsProduct.theme ? ' · ' + paramsProduct.theme : ''}</span>
                <h3>{paramsProduct.title}</h3>
                <p>{getGarmentLabel(paramsProduct.garmentType)} · {paramsProduct.density}</p>
                <p className="params-modal-material">{paramsProduct.material}</p>
                <p className="params-modal-color">{getColorLabel(paramsProduct.color)}</p>
                <div className="params-modal-price-row">
                  {paramsProduct.oldPrice && <span className="product-old-price">{formatPrice(paramsProduct.oldPrice)}</span>}
                  <strong>{formatPrice(paramsProduct.currentPrice)}</strong>
                </div>
                <button type="button" className="params-modal-size-link" onClick={() => openSizeGuide(paramsProduct)}>ТАБЛИЦА РАЗМЕРОВ</button>
              </div>
              <div className="params-modal-options">
                <div className="product-size-picker">
                  <span>РАЗМЕР</span>
                  <div className="size-choice-row">
                    {activeSizes.map((size) => (
                      <button className={getCardSize(paramsProduct) === size ? 'active' : ''} key={size} type="button" onClick={() => setCardSizes((current) => ({ ...current, [paramsProduct.id]: size }))}>{size}</button>
                    ))}
                  </div>
                  <div className="size-hints">{activeSizes.map((size, i) => <span key={size}>{sizeHints[i]}</span>)}</div>
                </div>
                <div className="product-quantity">
                  <span>КОЛ-ВО</span>
                  <div>
                    <button type="button" onClick={() => changeCardQuantity(paramsProduct, -1)} aria-label="Уменьшить количество"><Minus size={13} /></button>
                    <strong>{getCardQuantity(paramsProduct)} шт.</strong>
                    <button type="button" onClick={() => changeCardQuantity(paramsProduct, 1)} aria-label="Увеличить количество"><Plus size={13} /></button>
                  </div>
                </div>
              </div>
              <button className="params-modal-add" onClick={() => { addToCart(paramsProduct); setParamsProduct(null); }}>Добавить в корзину <ArrowRight size={16} /></button>
            </div>
          </div>
        </div>
      )}
      {addedProduct && <div className="toast-notification"><Check size={16} /> <span>{addedProduct} добавлено в корзину</span></div>}

      <Footer navigateTo={navigateTo} />
    </main>
  );
}

// --- NAV COMPONENT ---
function Nav({ menuOpen, setMenuOpen, navigateTo, cartCount }: { menuOpen: boolean; setMenuOpen: (fn: (open: boolean) => boolean) => void; navigateTo: (r: Route) => void; cartCount: number }) {
  return (
    <nav className="nav container">
      <a className="wordmark" href="#top" aria-label="МЕЖА — в начало">МЕЖА</a>
      <div className={`nav-links ${menuOpen ? 'is-open' : ''}`}>
        <a href="#about" onClick={() => setMenuOpen(() => false)}>О бренде</a>
        <a href="#catalog" onClick={() => setMenuOpen(() => false)}>Каталог</a>
        <a href="#order" onClick={() => setMenuOpen(() => false)}>Корзина{cartCount > 0 && ` (${cartCount})`}</a>
        <a href="#/payment" onClick={() => navigateTo('payment')}>Оплата</a>
      </div>
      <a className="nav-order" href="#order">Корзина{cartCount > 0 && ` (${cartCount})`} <ArrowRight size={16} /></a>
      <button className="menu-button" onClick={() => setMenuOpen((open) => !open)} aria-label="Открыть меню">
        {menuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>
    </nav>
  );
}

// --- FOOTER COMPONENT ---
function Footer({ navigateTo }: { navigateTo: (r: Route) => void }) {
  return (
    <footer className="footer container">
      <div className="footer-top">
        <div className="footer-col footer-brand">
          <a className="wordmark" href="#top">МЕЖА</a>
          <p>Одежда твоего края.</p>
          <span className="footer-copy">© 2026 МЕЖА</span>
        </div>
        <div className="footer-col">
          <h4>ПОКУПАТЕЛЮ</h4>
          <a href="#catalog">Каталог</a>
          <a href="#/delivery-returns" onClick={() => navigateTo('delivery-returns')}>Доставка и возврат</a>
          <a href="#/payment" onClick={() => navigateTo('payment')}>Оплата</a>
          <a href="#sizes">Таблица размеров</a>
          <a href="#/offer" onClick={() => navigateTo('offer')}>Публичная оферта</a>
          <a href="#/privacy" onClick={() => navigateTo('privacy')}>Обработка персональных данных</a>
        </div>
        <div className="footer-col footer-contacts">
          <h4>КОНТАКТЫ</h4>
          <a href={`mailto:${legalInfo.email}`}>{legalInfo.email}</a>
          <a href="tel:+375298406458">{legalInfo.phone}</a>
          <div className="footer-links"><a href="https://t.me/moi_angel" aria-label="Telegram"><Send size={17} /></a><a href="https://www.tiktok.com/@shop.mezha" aria-label="TikTok"><Music2 size={17} /></a></div>
        </div>
      </div>
      <div className="legal-details">
        <p>{legalInfo.entrepreneur}, {legalInfo.country}, {legalInfo.city}, {legalInfo.address}</p>
        <p>УНП {legalInfo.unp} от {legalInfo.unpDate} выдано {legalInfo.unpIssuedBy}</p>
        <p>{tradeRegisterText}</p>
        <p>Режим работы: {legalInfo.workingHours}.</p>
      </div>
      <div className="footer-payment">
        <span className="footer-payment-label">СПОСОБЫ ОПЛАТЫ</span>
        <img src="/images/payment-methods.png" alt="Способы оплаты — банковские карты" className="payment-methods-img" />
      </div>
    </footer>
  );
}

export default App;
