'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ProductCategory = 'wedding' | 'nightclub' | 'event' | 'holiday' | 'vip' | 'starter';
type ProductStatus = 'draft' | 'active' | 'paused' | 'out_of_stock';
type SampleStatus = 'none' | 'requested' | 'received' | 'filming';
type VideoFormat = 'showcase' | 'tutorial' | 'unboxing' | 'behind_scenes' | 'testimonial' | 'trending';
type VideoStatus = 'idea' | 'scripted' | 'filmed' | 'editing' | 'posted';
type TabView = 'overview' | 'products' | 'videos';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: ProductCategory;
  price: number;
  commissionRate: number;
  status: ProductStatus;
  sampleStatus: SampleStatus;
  tiktokUrl: string;
  notes: string;
  createdAt: string;
}

interface Video {
  id: string;
  productId: string;
  title: string;
  hook: string;
  format: VideoFormat;
  status: VideoStatus;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  ordersGenerated: number;
  gmvGenerated: number;
  postedDate: string;
  notes: string;
  createdAt: string;
}

interface Metric {
  id: string;
  date: string;
  period: string;
  totalGmv: number;
  totalOrders: number;
  totalViews: number;
  totalVideosPosted: number;
  commissionEarned: number;
  topProduct: string;
  notes: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PRODUCT_CATEGORIES: { key: ProductCategory; label: string; badge: string }[] = [
  { key: 'wedding', label: 'Wedding', badge: 'badge-gold' },
  { key: 'nightclub', label: 'Nightclub', badge: 'badge-blue' },
  { key: 'event', label: 'Event', badge: 'badge-gray' },
  { key: 'holiday', label: 'Holiday', badge: 'badge-green' },
  { key: 'vip', label: 'VIP', badge: 'badge-blue' },
  { key: 'starter', label: 'Starter', badge: 'badge-gray' },
];

const PRODUCT_STATUSES: { key: ProductStatus; label: string; color: string }[] = [
  { key: 'draft', label: 'Draft', color: 'bg-gray-500' },
  { key: 'active', label: 'Active', color: 'bg-emerald-500' },
  { key: 'paused', label: 'Paused', color: 'bg-gold-400' },
  { key: 'out_of_stock', label: 'Out of Stock', color: 'bg-red-500' },
];

const VIDEO_FORMATS: { key: VideoFormat; label: string }[] = [
  { key: 'showcase', label: 'Showcase' },
  { key: 'tutorial', label: 'Tutorial' },
  { key: 'unboxing', label: 'Unboxing' },
  { key: 'behind_scenes', label: 'Behind Scenes' },
  { key: 'testimonial', label: 'Testimonial' },
  { key: 'trending', label: 'Trending' },
];

const VIDEO_STATUSES: { key: VideoStatus; label: string; color: string }[] = [
  { key: 'idea', label: 'Idea', color: 'bg-gray-500' },
  { key: 'scripted', label: 'Scripted', color: 'bg-blue-500' },
  { key: 'filmed', label: 'Filmed', color: 'bg-purple-500' },
  { key: 'editing', label: 'Editing', color: 'bg-gold-400' },
  { key: 'posted', label: 'Posted', color: 'bg-emerald-500' },
];

const EMPTY_PRODUCT: Omit<Product, 'id' | 'createdAt'> = {
  name: '', sku: '', category: 'wedding', price: 0, commissionRate: 0,
  status: 'draft', sampleStatus: 'none', tiktokUrl: '', notes: '',
};

const EMPTY_VIDEO: Omit<Video, 'id' | 'createdAt' | 'views' | 'likes' | 'comments' | 'shares' | 'ordersGenerated' | 'gmvGenerated'> = {
  productId: '', title: '', hook: '', format: 'showcase', status: 'idea',
  postedDate: '', notes: '',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmt(n: number): string {
  return n.toLocaleString('en-US');
}

function fmtCurrency(n: number): string {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtPct(n: number): string {
  return n.toFixed(1) + '%';
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '--';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function categoryBadge(cat: ProductCategory) {
  const found = PRODUCT_CATEGORIES.find((c) => c.key === cat);
  return found ? found.badge : 'badge-gray';
}

function categoryLabel(cat: ProductCategory) {
  const found = PRODUCT_CATEGORIES.find((c) => c.key === cat);
  return found ? found.label : cat;
}

function statusColor(status: ProductStatus) {
  const found = PRODUCT_STATUSES.find((s) => s.key === status);
  return found ? found.color : 'bg-gray-500';
}

function statusLabel(status: ProductStatus) {
  const found = PRODUCT_STATUSES.find((s) => s.key === status);
  return found ? found.label : status;
}

function videoStatusColor(status: VideoStatus) {
  const found = VIDEO_STATUSES.find((s) => s.key === status);
  return found ? found.color : 'bg-gray-500';
}

function videoStatusLabel(status: VideoStatus) {
  const found = VIDEO_STATUSES.find((s) => s.key === status);
  return found ? found.label : status;
}

function videoFormatLabel(format: VideoFormat) {
  const found = VIDEO_FORMATS.find((f) => f.key === format);
  return found ? found.label : format;
}

function likeRate(views: number, likes: number): string {
  if (views === 0) return '0.0%';
  return ((likes / views) * 100).toFixed(1) + '%';
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function TikTokShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabView>('overview');

  // Product modal states
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState(EMPTY_PRODUCT);
  const [productSaving, setProductSaving] = useState(false);

  // Video modal states
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [videoForm, setVideoForm] = useState(EMPTY_VIDEO);
  const [videoSaving, setVideoSaving] = useState(false);

  // --- Data Fetching ---
  const fetchData = useCallback(async () => {
    try {
      const [prodRes, vidRes, metRes] = await Promise.all([
        fetch('/api/tiktok-shop/products'),
        fetch('/api/tiktok-shop/videos'),
        fetch('/api/tiktok-shop/metrics'),
      ]);
      if (prodRes.ok) setProducts(await prodRes.json());
      if (vidRes.ok) setVideos(await vidRes.json());
      if (metRes.ok) setMetrics(await metRes.json());
    } catch (e) {
      console.error('Failed to fetch TikTok Shop data:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Computed Stats ---
  const overviewStats = useMemo(() => {
    const activeProducts = products.filter((p) => p.status === 'active').length;
    const postedVideos = videos.filter((v) => v.status === 'posted');
    const totalViews = postedVideos.reduce((sum, v) => sum + v.views, 0);
    const totalLikes = postedVideos.reduce((sum, v) => sum + v.likes, 0);
    const totalComments = postedVideos.reduce((sum, v) => sum + v.comments, 0);
    const totalGmv = postedVideos.reduce((sum, v) => sum + v.gmvGenerated, 0);
    const totalOrders = postedVideos.reduce((sum, v) => sum + v.ordersGenerated, 0);
    const totalCommission = totalGmv * 0.15; // approximate avg commission
    const avgLikeRate = totalViews > 0 ? (totalLikes / totalViews) * 100 : 0;
    const videosInPipeline = videos.filter((v) => v.status !== 'posted' && v.status !== 'idea').length;

    // Weekly metrics
    const weeklyMetrics = metrics.filter((m) => m.period === 'weekly').sort((a, b) => b.date.localeCompare(a.date));
    const latestWeek = weeklyMetrics[0];
    const previousWeek = weeklyMetrics[1];
    const gmvTrend = latestWeek && previousWeek
      ? ((latestWeek.totalGmv - previousWeek.totalGmv) / previousWeek.totalGmv) * 100
      : 0;

    return {
      activeProducts,
      totalProducts: products.length,
      postedVideos: postedVideos.length,
      totalVideos: videos.length,
      totalViews,
      totalLikes,
      totalComments,
      totalGmv,
      totalOrders,
      totalCommission,
      avgLikeRate,
      videosInPipeline,
      latestWeek,
      gmvTrend,
    };
  }, [products, videos, metrics]);

  const videosByStatus = useMemo(() => {
    const map: Record<VideoStatus, Video[]> = {
      idea: [], scripted: [], filmed: [], editing: [], posted: [],
    };
    videos.forEach((v) => {
      if (map[v.status]) map[v.status].push(v);
    });
    return map;
  }, [videos]);

  // --- Product Handlers ---
  function openAddProduct() {
    setEditingProduct(null);
    setProductForm({ ...EMPTY_PRODUCT });
    setShowProductModal(true);
  }

  function openEditProduct(product: Product) {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: product.price,
      commissionRate: product.commissionRate,
      status: product.status,
      sampleStatus: product.sampleStatus,
      tiktokUrl: product.tiktokUrl,
      notes: product.notes,
    });
    setShowProductModal(true);
  }

  async function handleSaveProduct() {
    setProductSaving(true);
    try {
      const isEdit = !!editingProduct;
      const url = isEdit ? `/api/tiktok-shop/products/${editingProduct!.id}` : '/api/tiktok-shop/products';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productForm),
      });
      if (res.ok) {
        setShowProductModal(false);
        setEditingProduct(null);
        await fetchData();
      }
    } catch (e) {
      console.error('Failed to save product:', e);
    } finally {
      setProductSaving(false);
    }
  }

  async function handleDeleteProduct() {
    if (!editingProduct) return;
    if (!confirm('Delete this product? Associated videos will remain.')) return;
    try {
      const res = await fetch(`/api/tiktok-shop/products/${editingProduct.id}`, { method: 'DELETE' });
      if (res.ok) {
        setShowProductModal(false);
        setEditingProduct(null);
        await fetchData();
      }
    } catch (e) {
      console.error('Failed to delete product:', e);
    }
  }

  // --- Video Handlers ---
  function openAddVideo() {
    setEditingVideo(null);
    setVideoForm({ ...EMPTY_VIDEO, productId: products[0]?.id || '' });
    setShowVideoModal(true);
  }

  function openEditVideo(video: Video) {
    setEditingVideo(video);
    setVideoForm({
      productId: video.productId,
      title: video.title,
      hook: video.hook,
      format: video.format,
      status: video.status,
      postedDate: video.postedDate,
      notes: video.notes,
    });
    setShowVideoModal(true);
  }

  async function handleSaveVideo() {
    setVideoSaving(true);
    try {
      const isEdit = !!editingVideo;
      const url = isEdit ? `/api/tiktok-shop/videos/${editingVideo!.id}` : '/api/tiktok-shop/videos';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(videoForm),
      });
      if (res.ok) {
        setShowVideoModal(false);
        setEditingVideo(null);
        await fetchData();
      }
    } catch (e) {
      console.error('Failed to save video:', e);
    } finally {
      setVideoSaving(false);
    }
  }

  async function handleDeleteVideo() {
    if (!editingVideo) return;
    if (!confirm('Delete this video?')) return;
    try {
      const res = await fetch(`/api/tiktok-shop/videos/${editingVideo.id}`, { method: 'DELETE' });
      if (res.ok) {
        setShowVideoModal(false);
        setEditingVideo(null);
        await fetchData();
      }
    } catch (e) {
      console.error('Failed to delete video:', e);
    }
  }

  function getProductName(productId: string): string {
    const p = products.find((prod) => prod.id === productId);
    return p ? p.name : 'Unknown';
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-400 animate-pulse">Loading TikTok Shop...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------------ */}
      {/* Page Header                                                        */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">TikTok Shop</h1>
          <p className="text-gray-400 mt-1">
            Manage products, track video content, and monitor GMV performance
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={openAddProduct} className="btn-secondary flex items-center gap-2 text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Product
          </button>
          <button onClick={openAddVideo} className="btn-primary flex items-center gap-2 text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Video
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* KPI Cards                                                          */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="card !p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{fmtCurrency(overviewStats.totalGmv)}</p>
          <p className="text-xs text-gray-400 mt-1">Total GMV</p>
          {overviewStats.gmvTrend !== 0 && (
            <p className={`text-xs mt-1 ${overviewStats.gmvTrend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {overviewStats.gmvTrend > 0 ? '+' : ''}{overviewStats.gmvTrend.toFixed(0)}% WoW
            </p>
          )}
        </div>
        <div className="card !p-4 text-center">
          <p className="text-2xl font-bold text-white">{fmt(overviewStats.totalOrders)}</p>
          <p className="text-xs text-gray-400 mt-1">Total Orders</p>
        </div>
        <div className="card !p-4 text-center">
          <p className="text-2xl font-bold text-white">{fmt(overviewStats.totalViews)}</p>
          <p className="text-xs text-gray-400 mt-1">Total Views</p>
        </div>
        <div className="card !p-4 text-center">
          <p className="text-2xl font-bold text-gold-400">{fmtPct(overviewStats.avgLikeRate)}</p>
          <p className="text-xs text-gray-400 mt-1">Avg Like Rate</p>
        </div>
        <div className="card !p-4 text-center">
          <p className="text-2xl font-bold text-white">{overviewStats.postedVideos}</p>
          <p className="text-xs text-gray-400 mt-1">Videos Posted</p>
        </div>
        <div className="card !p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{overviewStats.activeProducts}</p>
          <p className="text-xs text-gray-400 mt-1">Active Products</p>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Tab Navigation                                                     */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex bg-navy-800 rounded-lg p-1 border border-navy-700 w-fit">
        {(['overview', 'products', 'videos'] as TabView[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm rounded-md transition-colors capitalize ${
              activeTab === tab
                ? 'bg-gold-400 text-navy-950 font-semibold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Overview Tab                                                       */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Weekly Metrics */}
          {metrics.filter((m) => m.period === 'weekly').length > 0 && (
            <div className="card">
              <h2 className="text-lg font-semibold text-white mb-4">Weekly Performance</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-navy-700">
                      <th className="table-header">Week</th>
                      <th className="table-header">GMV</th>
                      <th className="table-header">Orders</th>
                      <th className="table-header">Views</th>
                      <th className="table-header">Videos</th>
                      <th className="table-header">Commission</th>
                      <th className="table-header">Top Product</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-800">
                    {metrics
                      .filter((m) => m.period === 'weekly')
                      .sort((a, b) => b.date.localeCompare(a.date))
                      .map((m) => (
                        <tr key={m.id} className="hover:bg-navy-800/50 transition-colors">
                          <td className="table-cell text-white font-medium">{formatDate(m.date)}</td>
                          <td className="table-cell text-emerald-400 font-semibold">{fmtCurrency(m.totalGmv)}</td>
                          <td className="table-cell">{fmt(m.totalOrders)}</td>
                          <td className="table-cell">{fmt(m.totalViews)}</td>
                          <td className="table-cell">{m.totalVideosPosted}</td>
                          <td className="table-cell text-gold-400">{fmtCurrency(m.commissionEarned)}</td>
                          <td className="table-cell text-gray-400 text-xs">{m.topProduct}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Video Pipeline (Kanban-style) */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Content Pipeline</h2>
            <div className="overflow-x-auto pb-4 -mx-2">
              <div className="flex gap-4 min-w-max px-2">
                {VIDEO_STATUSES.map((stage) => {
                  const stageVideos = videosByStatus[stage.key];
                  return (
                    <div
                      key={stage.key}
                      className="w-64 flex-shrink-0 bg-navy-900/50 border border-navy-700 rounded-xl flex flex-col max-h-[400px]"
                    >
                      <div className="p-3 border-b border-navy-700 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${stage.color}`} />
                          <h3 className="text-sm font-semibold text-white">{stage.label}</h3>
                        </div>
                        <span className="text-xs font-medium text-gray-500 bg-navy-800 rounded-full px-2 py-0.5">
                          {stageVideos.length}
                        </span>
                      </div>
                      <div className="p-2 space-y-2 overflow-y-auto flex-1">
                        {stageVideos.length === 0 ? (
                          <div className="text-center py-6 text-gray-600 text-xs">No videos</div>
                        ) : (
                          stageVideos.map((video) => (
                            <button
                              key={video.id}
                              onClick={() => openEditVideo(video)}
                              className="w-full text-left bg-navy-800 hover:bg-navy-700 border border-navy-700 hover:border-navy-600 rounded-lg p-3 transition-all group cursor-pointer"
                            >
                              <p className="text-sm font-medium text-white group-hover:text-gold-400 transition-colors line-clamp-2">
                                {video.title}
                              </p>
                              <p className="text-xs text-gray-500 mt-1 truncate">{getProductName(video.productId)}</p>
                              {video.status === 'posted' && (
                                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                                  <span>{fmt(video.views)} views</span>
                                  <span>{fmtCurrency(video.gmvGenerated)} GMV</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-navy-700 text-gray-400">
                                  {videoFormatLabel(video.format)}
                                </span>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Top Performing Videos */}
          {videos.filter((v) => v.status === 'posted').length > 0 && (
            <div className="card">
              <h2 className="text-lg font-semibold text-white mb-4">Top Performing Videos</h2>
              <div className="space-y-3">
                {videos
                  .filter((v) => v.status === 'posted')
                  .sort((a, b) => b.views - a.views)
                  .slice(0, 5)
                  .map((video, idx) => (
                    <div
                      key={video.id}
                      className="flex items-center gap-4 p-3 bg-navy-800 border border-navy-700 rounded-lg hover:border-navy-600 transition-colors cursor-pointer"
                      onClick={() => openEditVideo(video)}
                    >
                      <div className="w-8 h-8 rounded-full bg-navy-700 flex items-center justify-center text-sm font-bold text-gold-400 flex-shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{video.title}</p>
                        <p className="text-xs text-gray-500 truncate">{video.hook}</p>
                      </div>
                      <div className="flex items-center gap-4 text-sm flex-shrink-0">
                        <div className="text-center">
                          <p className="font-semibold text-white">{fmt(video.views)}</p>
                          <p className="text-[10px] text-gray-500">views</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-gold-400">{likeRate(video.views, video.likes)}</p>
                          <p className="text-[10px] text-gray-500">like rate</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-emerald-400">{fmtCurrency(video.gmvGenerated)}</p>
                          <p className="text-[10px] text-gray-500">GMV</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-white">{video.ordersGenerated}</p>
                          <p className="text-[10px] text-gray-500">orders</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Products Tab                                                       */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === 'products' && (
        <div className="card !p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-navy-700">
                  <th className="table-header">Product</th>
                  <th className="table-header">SKU</th>
                  <th className="table-header">Category</th>
                  <th className="table-header">Price</th>
                  <th className="table-header">Commission</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Sample</th>
                  <th className="table-header">Videos</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-gray-500">
                      No products yet. Add your first TikTok Shop product!
                    </td>
                  </tr>
                ) : (
                  products.map((product) => {
                    const videoCount = videos.filter((v) => v.productId === product.id).length;
                    const productGmv = videos
                      .filter((v) => v.productId === product.id)
                      .reduce((sum, v) => sum + v.gmvGenerated, 0);
                    return (
                      <tr key={product.id} className="hover:bg-navy-800/50 transition-colors">
                        <td className="table-cell">
                          <div>
                            <p className="font-medium text-white">{product.name}</p>
                            {productGmv > 0 && (
                              <p className="text-xs text-emerald-400">{fmtCurrency(productGmv)} GMV</p>
                            )}
                          </div>
                        </td>
                        <td className="table-cell text-gray-400 font-mono text-xs">{product.sku}</td>
                        <td className="table-cell">
                          <span className={categoryBadge(product.category)}>
                            {categoryLabel(product.category)}
                          </span>
                        </td>
                        <td className="table-cell font-medium text-white">{fmtCurrency(product.price)}</td>
                        <td className="table-cell text-gold-400">{product.commissionRate}%</td>
                        <td className="table-cell">
                          <span className="inline-flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${statusColor(product.status)}`} />
                            {statusLabel(product.status)}
                          </span>
                        </td>
                        <td className="table-cell">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            product.sampleStatus === 'filming' ? 'bg-emerald-500/10 text-emerald-400' :
                            product.sampleStatus === 'received' ? 'bg-gold-400/10 text-gold-400' :
                            product.sampleStatus === 'requested' ? 'bg-blue-500/10 text-blue-400' :
                            'bg-navy-700 text-gray-500'
                          }`}>
                            {product.sampleStatus === 'none' ? 'N/A' : product.sampleStatus}
                          </span>
                        </td>
                        <td className="table-cell text-center">
                          <span className="text-white font-medium">{videoCount}</span>
                        </td>
                        <td className="table-cell">
                          <button
                            onClick={() => openEditProduct(product)}
                            className="text-gray-400 hover:text-gold-400 transition-colors p-1"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Videos Tab                                                         */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === 'videos' && (
        <div className="card !p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-navy-700">
                  <th className="table-header">Title</th>
                  <th className="table-header">Product</th>
                  <th className="table-header">Format</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Views</th>
                  <th className="table-header">Likes</th>
                  <th className="table-header">Orders</th>
                  <th className="table-header">GMV</th>
                  <th className="table-header">Posted</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800">
                {videos.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-12 text-gray-500">
                      No videos yet. Create your first TikTok Shop video!
                    </td>
                  </tr>
                ) : (
                  videos.map((video) => (
                    <tr key={video.id} className="hover:bg-navy-800/50 transition-colors">
                      <td className="table-cell">
                        <div>
                          <p className="font-medium text-white text-sm">{video.title}</p>
                          {video.hook && (
                            <p className="text-xs text-gray-500 truncate max-w-xs">{video.hook}</p>
                          )}
                        </div>
                      </td>
                      <td className="table-cell text-gray-400 text-xs">{getProductName(video.productId)}</td>
                      <td className="table-cell">
                        <span className="text-xs px-2 py-0.5 rounded bg-navy-700 text-gray-300">
                          {videoFormatLabel(video.format)}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className="inline-flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${videoStatusColor(video.status)}`} />
                          {videoStatusLabel(video.status)}
                        </span>
                      </td>
                      <td className="table-cell text-white font-medium">
                        {video.views > 0 ? fmt(video.views) : '--'}
                      </td>
                      <td className="table-cell">
                        {video.likes > 0 ? (
                          <div>
                            <span className="text-white">{fmt(video.likes)}</span>
                            <span className="text-gray-500 text-xs ml-1">({likeRate(video.views, video.likes)})</span>
                          </div>
                        ) : '--'}
                      </td>
                      <td className="table-cell text-white">
                        {video.ordersGenerated > 0 ? video.ordersGenerated : '--'}
                      </td>
                      <td className="table-cell text-emerald-400 font-medium">
                        {video.gmvGenerated > 0 ? fmtCurrency(video.gmvGenerated) : '--'}
                      </td>
                      <td className="table-cell text-gray-400 text-xs">
                        {formatDate(video.postedDate)}
                      </td>
                      <td className="table-cell">
                        <button
                          onClick={() => openEditVideo(video)}
                          className="text-gray-400 hover:text-gold-400 transition-colors p-1"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Add / Edit Product Modal                                           */}
      {/* ------------------------------------------------------------------ */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowProductModal(false)}
          />
          <div className="relative bg-navy-900 border border-navy-700 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  {editingProduct ? 'Edit Product' : 'Add Product'}
                </h2>
                <button onClick={() => setShowProductModal(false)} className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Product Name *</label>
                  <input
                    type="text" className="input-field"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="e.g. Wedding Sparkler Starter Pack (12pc)"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">SKU</label>
                    <input
                      type="text" className="input-field"
                      value={productForm.sku}
                      onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                      placeholder="KOS-WED-12"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Category</label>
                    <select
                      className="select-field"
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value as ProductCategory })}
                    >
                      {PRODUCT_CATEGORIES.map((cat) => (
                        <option key={cat.key} value={cat.key}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Price ($)</label>
                    <input
                      type="number" step="0.01" className="input-field"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Commission Rate (%)</label>
                    <input
                      type="number" step="1" className="input-field"
                      value={productForm.commissionRate}
                      onChange={(e) => setProductForm({ ...productForm, commissionRate: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Status</label>
                    <select
                      className="select-field"
                      value={productForm.status}
                      onChange={(e) => setProductForm({ ...productForm, status: e.target.value as ProductStatus })}
                    >
                      {PRODUCT_STATUSES.map((s) => (
                        <option key={s.key} value={s.key}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Sample Status</label>
                    <select
                      className="select-field"
                      value={productForm.sampleStatus}
                      onChange={(e) => setProductForm({ ...productForm, sampleStatus: e.target.value as SampleStatus })}
                    >
                      <option value="none">None</option>
                      <option value="requested">Requested</option>
                      <option value="received">Received</option>
                      <option value="filming">Filming</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Notes</label>
                  <textarea
                    className="textarea-field" rows={2}
                    value={productForm.notes}
                    onChange={(e) => setProductForm({ ...productForm, notes: e.target.value })}
                    placeholder="Content strategy notes for this product..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-navy-700">
                <div>
                  {editingProduct && (
                    <button onClick={handleDeleteProduct} className="btn-danger text-sm">Delete</button>
                  )}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowProductModal(false)} className="btn-secondary">Cancel</button>
                  <button
                    onClick={handleSaveProduct}
                    disabled={productSaving || !productForm.name}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {productSaving ? 'Saving...' : editingProduct ? 'Update' : 'Add Product'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Add / Edit Video Modal                                             */}
      {/* ------------------------------------------------------------------ */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowVideoModal(false)}
          />
          <div className="relative bg-navy-900 border border-navy-700 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  {editingVideo ? 'Edit Video' : 'Add Video'}
                </h2>
                <button onClick={() => setShowVideoModal(false)} className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Title *</label>
                  <input
                    type="text" className="input-field"
                    value={videoForm.title}
                    onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                    placeholder="e.g. $3 sparklers vs $20 sparklers for your wedding"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Hook</label>
                  <input
                    type="text" className="input-field"
                    value={videoForm.hook}
                    onChange={(e) => setVideoForm({ ...videoForm, hook: e.target.value })}
                    placeholder="e.g. Stop buying sparklers from Amazon..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Product</label>
                    <select
                      className="select-field"
                      value={videoForm.productId}
                      onChange={(e) => setVideoForm({ ...videoForm, productId: e.target.value })}
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Format</label>
                    <select
                      className="select-field"
                      value={videoForm.format}
                      onChange={(e) => setVideoForm({ ...videoForm, format: e.target.value as VideoFormat })}
                    >
                      {VIDEO_FORMATS.map((f) => (
                        <option key={f.key} value={f.key}>{f.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Status</label>
                  <select
                    className="select-field"
                    value={videoForm.status}
                    onChange={(e) => setVideoForm({ ...videoForm, status: e.target.value as VideoStatus })}
                  >
                    {VIDEO_STATUSES.map((s) => (
                      <option key={s.key} value={s.key}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Notes</label>
                  <textarea
                    className="textarea-field" rows={2}
                    value={videoForm.notes}
                    onChange={(e) => setVideoForm({ ...videoForm, notes: e.target.value })}
                    placeholder="Filming notes, content strategy..."
                  />
                </div>
              </div>

              {/* Show performance stats for posted videos in edit mode */}
              {editingVideo && editingVideo.status === 'posted' && (
                <div className="mt-4 p-3 bg-navy-800 border border-navy-700 rounded-lg">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">Performance</h3>
                  <div className="grid grid-cols-4 gap-3 text-center">
                    <div>
                      <p className="text-sm font-bold text-white">{fmt(editingVideo.views)}</p>
                      <p className="text-[10px] text-gray-500">Views</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{fmt(editingVideo.likes)}</p>
                      <p className="text-[10px] text-gray-500">Likes</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-emerald-400">{editingVideo.ordersGenerated}</p>
                      <p className="text-[10px] text-gray-500">Orders</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-emerald-400">{fmtCurrency(editingVideo.gmvGenerated)}</p>
                      <p className="text-[10px] text-gray-500">GMV</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-navy-700">
                <div>
                  {editingVideo && (
                    <button onClick={handleDeleteVideo} className="btn-danger text-sm">Delete</button>
                  )}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowVideoModal(false)} className="btn-secondary">Cancel</button>
                  <button
                    onClick={handleSaveVideo}
                    disabled={videoSaving || !videoForm.title}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {videoSaving ? 'Saving...' : editingVideo ? 'Update' : 'Add Video'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
