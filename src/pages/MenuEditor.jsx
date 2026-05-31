// src/pages/MenuEditor.jsx — Figma frame 06 (two-pane editor)
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Icon, PageHeader, ShopSelectPill } from '../components/Primitives';
import { saveMenu } from '../services/api';
import s from './MenuEditor.module.css';

// ── Modals ──────────────────────────────────────────────────────────────────
function CategoryModal({ initialName, onClose, onSave }) {
  const [name, setName] = useState(initialName || '');
  const submit = () => { if (name.trim()) onSave(name.trim()); };
  return (
    <div className={s.modalOverlay} onClick={onClose}>
      <div className={s.modal} onClick={e => e.stopPropagation()}>
        <div className={s.modalHead}>
          <span className={s.modalTitle}>{initialName ? 'Επεξεργασία κατηγορίας' : 'Νέα κατηγορία'}</span>
          <button className={s.modalClose} onClick={onClose} aria-label="Κλείσιμο">
            <Icon name="x" size={14}/>
          </button>
        </div>
        <div className={s.modalBody}>
          <div className={s.formField}>
            <label className={s.formLabel}>Όνομα κατηγορίας</label>
            <input
              className={s.formInput}
              placeholder="π.χ. Καφέδες"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
              autoFocus
            />
          </div>
        </div>
        <div className={s.modalFoot}>
          <button className={`${s.btn} ${s.btnGhost}`} onClick={onClose}>Ακύρωση</button>
          <button className={`${s.btn} ${s.btnPrimary}`} onClick={submit} disabled={!name.trim()}>
            {initialName ? 'Αποθήκευση' : 'Προσθήκη'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductModal({ initialData, onClose, onSubmit }) {
  const isEdit = !!initialData;
  const [name, setName]               = useState(initialData?.name        || '');
  const [price, setPrice]             = useState(initialData?.price != null ? String(initialData.price) : '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [station, setStation]         = useState(initialData?.station      || 'KITCHEN');

  const submit = () => {
    if (!name.trim()) return;
    onSubmit({
      id: initialData?.id || ('p' + Date.now()),
      name: name.trim(),
      price: parseFloat(price) || 0,
      description: description.trim(),
      station,
    });
  };

  return (
    <div className={s.modalOverlay} onClick={onClose}>
      <div className={s.modal} onClick={e => e.stopPropagation()}>
        <div className={s.modalHead}>
          <span className={s.modalTitle}>{isEdit ? 'Επεξεργασία προϊόντος' : 'Νέο προϊόν'}</span>
          <button className={s.modalClose} onClick={onClose} aria-label="Κλείσιμο">
            <Icon name="x" size={14}/>
          </button>
        </div>
        <div className={s.modalBody}>
          <div className={s.formField}>
            <label className={s.formLabel}>Όνομα *</label>
            <input className={s.formInput} placeholder="π.χ. Μπριζόλα Χοιρινή"
              value={name} onChange={e => setName(e.target.value)} autoFocus/>
          </div>
          <div className={s.formGrid}>
            <div className={s.formField}>
              <label className={s.formLabel}>Τιμή (€)</label>
              <input className={s.formInput} type="number" min="0" step="0.10" placeholder="0.00"
                value={price} onChange={e => setPrice(e.target.value)}/>
            </div>
            <div className={s.formField}>
              <label className={s.formLabel}>Πόστο</label>
              <select className={s.formInput} value={station} onChange={e => setStation(e.target.value)}>
                <option value="KITCHEN">KITCHEN</option>
                <option value="BAR">BAR</option>
                <option value="GRILL">GRILL</option>
                <option value="COLD">COLD</option>
              </select>
            </div>
          </div>
          <div className={s.formField}>
            <label className={s.formLabel}>Περιγραφή</label>
            <textarea className={s.formTextarea} rows={3} placeholder="Προαιρετική περιγραφή…"
              value={description} onChange={e => setDescription(e.target.value)}/>
          </div>
        </div>
        <div className={s.modalFoot}>
          <button className={`${s.btn} ${s.btnGhost}`} onClick={onClose}>Ακύρωση</button>
          <button className={`${s.btn} ${s.btnPrimary}`} onClick={submit} disabled={!name.trim()}>
            {isEdit ? 'Αποθήκευση' : 'Προσθήκη'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function MenuEditor() {
  const { shops, setShops, currentShopId, setCurrentShopId } = useAuth();
  const shop = shops.find(sh => sh.shop_id === currentShopId) || shops[0];

  const [menu, setMenu] = useState(shop?.menu || []);
  const [selectedCatId, setSelectedCatId] = useState(shop?.menu?.[0]?.id || null);
  const [dirty, setDirty] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [saveErr, setSaveErr] = useState('');

  const [catModalOpen, setCatModalOpen] = useState(false);          // new category
  const [editCatId, setEditCatId] = useState(null);                  // edit existing
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  // Drag-and-drop reordering of categories
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Sync local state when shop changes
  useEffect(() => {
    if (shop) {
      setMenu(shop.menu || []);
      setSelectedCatId(shop.menu?.[0]?.id || null);
      setDirty(false);
    }
  }, [shop?.shop_id]);

  if (!shop) return null;

  const selectedCat = menu.find(c => c.id === selectedCatId) || menu[0];
  const editingCat  = editCatId ? menu.find(c => c.id === editCatId) : null;

  const update = (nm) => { setMenu(nm); setDirty(true); };

  // category ops
  const addCat = (name) => {
    const id = 'c' + Date.now();
    update([...menu, { id, name, items: [] }]);
    setSelectedCatId(id);
  };
  const renameCat = (id, name) => update(menu.map(c => c.id === id ? { ...c, name } : c));
  const deleteCat = (id) => {
    if (!window.confirm('Διαγραφή κατηγορίας; Θα διαγραφούν και όλα τα προϊόντα της.')) return;
    const nm = menu.filter(c => c.id !== id);
    update(nm);
    if (selectedCatId === id) setSelectedCatId(nm[0]?.id || null);
  };
  // Reorder via drag-and-drop — persists on Save and so reflects in the public menu order.
  const reorderCats = (from, to) => {
    if (from == null || to == null || from === to) return;
    const nm = [...menu];
    const [moved] = nm.splice(from, 1);
    nm.splice(to, 0, moved);
    update(nm);
  };

  // product ops
  const addProduct = (catId, productData) => {
    update(menu.map(c => c.id === catId ? { ...c, items: [...(c.items||[]), productData] } : c));
  };
  const updateProduct = (catId, pid, patch) => {
    update(menu.map(c => c.id === catId
      ? { ...c, items: c.items.map(p => p.id === pid ? { ...p, ...patch } : p) }
      : c));
  };
  const deleteProduct = (catId, pid) => {
    if (!window.confirm('Διαγραφή προϊόντος;')) return;
    update(menu.map(c => c.id === catId ? { ...c, items: c.items.filter(p => p.id !== pid) } : c));
  };

  const save = async () => {
    setSaveErr('');
    try {
      await saveMenu({ shopId: shop.shop_id, data: { menu } });
      setShops(prev => prev.map(sh => sh.shop_id === shop.shop_id ? { ...sh, menu } : sh));
      setDirty(false);
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 2000);
    } catch (e) {
      setSaveErr(e.message || 'Σφάλμα αποθήκευσης');
    }
  };

  // Topbar: centered shop pill + Save button on the right
  const centerPill = (
    <ShopSelectPill
      value={currentShopId}
      onChange={e => setCurrentShopId(e.target.value)}
      shops={shops}
    />
  );
  const right = (
    <button className={`${s.btn} ${s.btnPrimary}`} onClick={save} disabled={!dirty}>
      <Icon name="save" size={12}/>Αποθήκευση
    </button>
  );

  return (
    <main className={s.pageMain}>
      <PageHeader
        topbarLabel="Επεξεργασία Μενού"
        center={centerPill}
        right={right}
      />

      {saveErr && <div className={s.msgError}>{saveErr}</div>}

      {/* Two-pane layout: categories | products */}
      <div className={s.editorLayout}>
        {/* ── Categories panel ── */}
        <aside className={s.catPanel}>
          <div className={s.panelHead}>
            <span className={s.panelTitle}>Κατηγορίες</span>
            <button className={`${s.btn} ${s.btnPrimary} ${s.btnSm}`} onClick={() => setCatModalOpen(true)}>
              <Icon name="plus" size={11}/>Νέα
            </button>
          </div>

          <div className={s.catList}>
            {menu.length === 0 && (
              <div className={s.emptyHint}>Δεν υπάρχουν κατηγορίες ακόμα.</div>
            )}
            {menu.map((cat, i) => (
              <div
                key={cat.id}
                className={[
                  s.catItem,
                  selectedCatId === cat.id ? s.catItemOn : '',
                  dragIndex === i ? s.catItemDragging : '',
                  dragOverIndex === i && dragIndex !== i ? s.catItemDragOver : '',
                ].join(' ')}
                onClick={() => setSelectedCatId(cat.id)}
                draggable={menu.length > 1}
                onDragStart={(e) => { setDragIndex(i); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(i)); }}
                onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; if (dragOverIndex !== i) setDragOverIndex(i); }}
                onDrop={(e) => { e.preventDefault(); const from = Number(e.dataTransfer.getData('text/plain')); reorderCats(from, i); setDragIndex(null); setDragOverIndex(null); }}
                onDragEnd={() => { setDragIndex(null); setDragOverIndex(null); }}
              >
                <span className={s.catName}>{cat.name}</span>
                <div className={s.catActions} onClick={e => e.stopPropagation()}>
                  <button className={s.iconBtn} onClick={() => setEditCatId(cat.id)} title="Επεξεργασία">
                    <Icon name="edit-solid" size={14}/>
                  </button>
                  <button className={`${s.iconBtn} ${s.iconBtnDel}`} onClick={() => deleteCat(cat.id)} title="Διαγραφή">
                    <Icon name="trash-solid" size={14}/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* ── Products panel ── */}
        <section className={s.prodPanel}>
          {!selectedCat && (
            <div className={s.emptyState}>
              <span className={s.emptyIcon}><Icon name="grid" size={24}/></span>
              <span>Επιλέξτε ή δημιουργήστε κατηγορία για να ξεκινήσετε.</span>
            </div>
          )}

          {selectedCat && (
            <>
              <div className={s.panelHead}>
                <span className={s.prodPanelTitle}>{selectedCat.name}</span>
                <button
                  className={`${s.btn} ${s.btnPrimary} ${s.btnSm}`}
                  onClick={() => { setEditProduct(null); setProductModalOpen(true); }}
                >
                  <Icon name="plus" size={11}/>Νέο Προϊόν
                </button>
              </div>

              <div className={s.prodTableHead}>
                <span>Προϊόν</span>
                <span>Τιμή</span>
                <span>Πόστο</span>
                <span aria-hidden="true"/>
              </div>

              <div className={s.prodList}>
                {(selectedCat.items || []).length === 0 && (
                  <div className={s.emptyHint}>// Καμία προσθήκη ακόμα — πατήστε «+ Νέο Προϊόν»</div>
                )}
                {(selectedCat.items || []).map(p => (
                  <div key={p.id} className={s.prodRow}>
                    <div className={s.prodCellMain}>
                      <span className={s.prodName}>{p.name}</span>
                      {p.description && <span className={s.prodDesc}>{p.description}</span>}
                    </div>
                    <span className={s.prodPrice}>
                      {Number(p.price).toFixed(2).replace('.', ',')}€
                    </span>
                    <span className={s.prodStation}>{p.station || 'KITCHEN'}</span>
                    <div className={s.prodActs}>
                      <button
                        className={`${s.btnPill}`}
                        onClick={() => { setEditProduct({ catId: selectedCat.id, product: p }); setProductModalOpen(true); }}
                      >
                        <span>Επεξεργασία</span>
                        <Icon name="edit" size={11}/>
                      </button>
                      <button
                        className={`${s.btnPill}`}
                        onClick={() => deleteProduct(selectedCat.id, p.id)}
                      >
                        <span>Διαγραφή</span>
                        <Icon name="trash" size={11}/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </div>

      {savedToast && <div className={s.toast}>✓ Οι αλλαγές αποθηκεύτηκαν</div>}

      {catModalOpen && (
        <CategoryModal
          onClose={() => setCatModalOpen(false)}
          onSave={(name) => { addCat(name); setCatModalOpen(false); }}
        />
      )}

      {editingCat && (
        <CategoryModal
          initialName={editingCat.name}
          onClose={() => setEditCatId(null)}
          onSave={(name) => { renameCat(editCatId, name); setEditCatId(null); }}
        />
      )}

      {productModalOpen && (
        <ProductModal
          initialData={editProduct?.product}
          onClose={() => { setProductModalOpen(false); setEditProduct(null); }}
          onSubmit={(productData) => {
            if (editProduct) {
              updateProduct(editProduct.catId, editProduct.product.id, productData);
            } else {
              addProduct(selectedCat.id, productData);
            }
            setProductModalOpen(false);
            setEditProduct(null);
          }}
        />
      )}
    </main>
  );
}
