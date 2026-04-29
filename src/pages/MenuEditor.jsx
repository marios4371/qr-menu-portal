// src/pages/MenuEditor.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Icon, PageHeader } from '../components/Primitives';
import { saveMenu } from '../services/api';

export default function MenuEditor() {
  const { shops, setShops } = useAuth();
  const [currentShopId, setCurrentShopId] = useState(shops[0]?.shop_id ?? null);
  const shop = shops.find(s => s.shop_id === currentShopId) || shops[0];

  const [menu, setMenu] = useState(shop?.menu || []);
  const [open, setOpen] = useState({ [shop?.menu?.[0]?.id]: true });
  const [editingCat, setEditingCat] = useState(null);
  const [search, setSearch] = useState('');
  const [dirty, setDirty] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [saveErr, setSaveErr] = useState('');

  useEffect(() => {
    if (shop) {
      setMenu(shop.menu || []);
      setOpen({ [shop.menu?.[0]?.id]: true });
      setDirty(false);
    }
  }, [shop?.shop_id]);

  const update = (newMenu) => { setMenu(newMenu); setDirty(true); };
  const toggleCat = (id) => setOpen(o => ({ ...o, [id]: !o[id] }));
  const renameCat = (id, name) => update(menu.map(c => c.id === id ? { ...c, name } : c));
  const deleteCat = (id) => {
    if (window.confirm('Διαγραφή κατηγορίας;')) update(menu.filter(c => c.id !== id));
  };
  const addCat = () => {
    const id = 'c' + Date.now();
    update([...menu, { id, name: 'Νέα κατηγορία', items: [] }]);
    setOpen(o => ({ ...o, [id]: true }));
    setEditingCat(id);
  };
  const addProduct = (catId) => {
    const id = 'p' + Date.now();
    update(menu.map(c => c.id === catId
      ? { ...c, items: [...c.items, { id, name: 'Νέο προϊόν', price: 0, description: '', station: 'KITCHEN' }] }
      : c));
  };
  const updateProduct = (catId, pid, patch) => {
    update(menu.map(c => c.id === catId
      ? { ...c, items: c.items.map(p => p.id === pid ? { ...p, ...patch } : p) }
      : c));
  };
  const deleteProduct = (catId, pid) => {
    update(menu.map(c => c.id === catId ? { ...c, items: c.items.filter(p => p.id !== pid) } : c));
  };

  const save = async () => {
    setSaveErr('');
    try {
      await saveMenu({ shopId: shop.shop_id, data: { menu } });
      // update shops in context
      setShops(prev => prev.map(s => s.shop_id === shop.shop_id ? { ...s, menu } : s));
      setDirty(false);
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 2000);
    } catch (e) {
      setSaveErr(e.message || 'Σφάλμα αποθήκευσης');
    }
  };

  const totalProducts = menu.reduce((acc, c) => acc + c.items.length, 0);
  const filtered = search
    ? menu.map(c => ({ ...c, items: c.items.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.description||'').toLowerCase().includes(search.toLowerCase()))
      })).filter(c => c.items.length > 0 || c.name.toLowerCase().includes(search.toLowerCase()))
    : menu;

  const right = (
    <div className="dash-shop-select-wrap">
      <span className="dash-shop-select-lab">SHOP</span>
      <select className="dash-shop-select" value={currentShopId} onChange={e => setCurrentShopId(e.target.value)}>
        {shops.map(s => <option key={s.shop_id} value={s.shop_id}>{s.shopName}</option>)}
      </select>
    </div>
  );

  if (!shop) return null;

  return (
    <main className="page-main">
      <PageHeader
        kicker="02 / Επεξεργασία Μενού"
        title="Διαχείριση μενού"
        sub="Προσθέστε κατηγορίες και προϊόντα. Οι αλλαγές αποθηκεύονται στο μενού του πελάτη."
        right={right}
      />

      <div className="me-toolbar">
        <div className="me-search">
          <Icon name="search" size={13}/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Αναζήτηση προϊόντων…"/>
        </div>
        <div className="me-counter">
          <span className={dirty ? 'me-dirty' : ''}>
            <strong>{menu.length}</strong> κατηγορίες · <strong>{totalProducts}</strong> προϊόντα
            {dirty && ' · μη αποθηκευμένο'}
          </span>
        </div>
        <div className="grow"/>
        <button className="btn btn-ghost btn-sm" onClick={() => { setMenu(shop.menu); setDirty(false); }} disabled={!dirty}>Επαναφορά</button>
        <button className="btn btn-primary btn-sm" onClick={save} disabled={!dirty}>
          <Icon name="save" size={12}/>Αποθήκευση
        </button>
      </div>

      {saveErr && <div className="msg-error" style={{marginBottom:14}}>{saveErr}</div>}

      {filtered.length === 0 && (
        <div className="me-empty">
          <span className="icon">∅</span>
          <span>Δεν βρέθηκαν αποτελέσματα για «{search}»</span>
          <button className="btn btn-ghost btn-sm" onClick={() => setSearch('')}>Καθαρισμός</button>
        </div>
      )}

      <div className="me-cat-list">
        {filtered.map((cat, i) => (
          <div key={cat.id} className={`me-cat ${open[cat.id] ? 'open' : ''} ticks`}>
            <div className="me-cat-head" onClick={() => toggleCat(cat.id)}>
              <span className="me-cat-num">{String(i+1).padStart(2,'0')}</span>
              <button className={`me-cat-toggle ${open[cat.id] ? 'on' : ''}`}><Icon name="chev-r" size={13}/></button>
              <div className="me-cat-name" onClick={e => { e.stopPropagation(); setEditingCat(cat.id); }}>
                {editingCat === cat.id ? (
                  <input autoFocus value={cat.name}
                         onChange={e => renameCat(cat.id, e.target.value)}
                         onBlur={() => setEditingCat(null)}
                         onKeyDown={e => e.key === 'Enter' && setEditingCat(null)}
                         onClick={e => e.stopPropagation()}/>
                ) : cat.name}
              </div>
              <span className="me-cat-count">{cat.items.length} items</span>
              <div className="me-cat-acts" onClick={e => e.stopPropagation()}>
                <button className="btn btn-ghost btn-sm" onClick={() => addProduct(cat.id)}><Icon name="plus" size={11}/>Προϊόν</button>
                <button className="btn btn-ghost btn-sm" onClick={() => deleteCat(cat.id)}><Icon name="trash" size={11}/></button>
              </div>
            </div>
            {open[cat.id] && (
              <div className="me-prod-list">
                {cat.items.length === 0 && <div className="me-prod-empty">// Καμία προσθήκη ακόμα — πατήστε «+ Προϊόν»</div>}
                {cat.items.map(p => (
                  <ProductRow key={p.id} product={p}
                              onUpdate={patch => updateProduct(cat.id, p.id, patch)}
                              onDelete={() => deleteProduct(cat.id, p.id)}/>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <button className="me-add-cat" onClick={addCat}><Icon name="plus" size={12}/>Προσθήκη κατηγορίας</button>

      {savedToast && <div className="toast">✓ Οι αλλαγές αποθηκεύτηκαν</div>}
    </main>
  );
}

function ProductRow({ product, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(null);
  return (
    <div className="me-prod">
      <div className="me-prod-info">
        {editing === 'name' ? (
          <input autoFocus value={product.name} onChange={e => onUpdate({ name: e.target.value })}
                 onBlur={() => setEditing(null)} onKeyDown={e => e.key === 'Enter' && setEditing(null)}
                 style={{padding:'4px 8px', fontSize:'0.9rem'}}/>
        ) : (
          <span className="me-prod-name" onClick={() => setEditing('name')}>{product.name}</span>
        )}
        {editing === 'desc' ? (
          <input autoFocus value={product.description || ''} onChange={e => onUpdate({ description: e.target.value })}
                 onBlur={() => setEditing(null)} onKeyDown={e => e.key === 'Enter' && setEditing(null)}
                 placeholder="Περιγραφή" style={{padding:'4px 8px', fontSize:'0.78rem'}}/>
        ) : (
          <span className="me-prod-desc" onClick={() => setEditing('desc')}>
            {product.description || <em style={{color:'var(--text-muted)'}}>+ προσθέστε περιγραφή</em>}
          </span>
        )}
      </div>
      <span className={`me-prod-station ${product.station === 'BAR' ? 'bar' : 'kit'}`}
            onClick={() => onUpdate({ station: product.station === 'BAR' ? 'KITCHEN' : 'BAR' })}
            title="Click για εναλλαγή" style={{cursor:'pointer'}}>
        <Icon name={product.station === 'BAR' ? 'bar' : 'kitchen'} size={10}/>
        {product.station === 'BAR' ? 'Bar' : 'Kit'}
      </span>
      {editing === 'price' ? (
        <input autoFocus type="number" step="0.10" value={product.price}
               onChange={e => onUpdate({ price: parseFloat(e.target.value) || 0 })}
               onBlur={() => setEditing(null)} onKeyDown={e => e.key === 'Enter' && setEditing(null)}
               style={{padding:'4px 8px', fontSize:'0.84rem', textAlign:'right', fontFamily:'var(--font-mono)'}}/>
      ) : (
        <span className="me-prod-price" onClick={() => setEditing('price')}>
          {Number(product.price).toFixed(2).replace('.',',')}€
        </span>
      )}
      <div className="me-prod-acts">
        <button className="btn btn-ghost btn-sm" onClick={onDelete}><Icon name="trash" size={11}/></button>
      </div>
    </div>
  );
}
