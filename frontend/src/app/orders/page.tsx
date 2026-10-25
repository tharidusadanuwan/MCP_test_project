
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowDownUp,
  Check,
  CheckCircle2,
  ChevronDown,
  CirclePlus,
  ClipboardList,
  LoaderCircle,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShoppingBag,
  Trash2,
  TrendingUp,
  Users,
  X,
} from "lucide-react";

const API = (
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
).replace(/\/$/, "");

type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

type Order = {
  id: number;
  customer_name: string;
  customer_email: string;
  product_name: string;
  quantity: number;
  unit_price: string | number;
  total_amount: string | number;
  status: OrderStatus;
  created_at: string;
};

type OrderForm = {
  customer_name: string;
  customer_email: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  status: OrderStatus;
};

const statuses: OrderStatus[] = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

const emptyForm: OrderForm = {
  customer_name: "",
  customer_email: "",
  product_name: "",
  quantity: 1,
  unit_price: 0,
  status: "pending",
};

function formatMoney(value: string | number) {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-LK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function customerInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [formOpen, setFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [form, setForm] = useState<OrderForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const [deleteOrder, setDeleteOrder] = useState<Order | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}/orders`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Failed to load orders (HTTP ${response.status}).`);
      }

      const data: Order[] = await response.json();
      setOrders(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? `${err.message} Check that your FastAPI backend is running at ${API}.`
          : "Unable to load orders.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    if (!notice) return;

    const timer = window.setTimeout(() => setNotice(""), 4000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const stats = useMemo(() => {
    const activeOrders = orders.filter(
      (order) => order.status !== "cancelled",
    );

    return {
      total: orders.length,
      pending: orders.filter((order) => order.status === "pending").length,
      confirmed: orders.filter(
        (order) => order.status === "confirmed",
      ).length,
      value: activeOrders.reduce(
        (sum, order) => sum + Number(order.total_amount),
        0,
      ),
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const query = search.toLowerCase().trim();

    return orders.filter((order) => {
      const matchesSearch =
        !query ||
        [
          String(order.id),
          order.customer_name,
          order.customer_email,
          order.product_name,
        ].some((value) => value.toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  function openCreateModal() {
    setError("");
    setEditingOrder(null);
    setForm({ ...emptyForm });
    setFormOpen(true);
  }

  function openEditModal(order: Order) {
    setError("");
    setEditingOrder(order);

    setForm({
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      product_name: order.product_name,
      quantity: order.quantity,
      unit_price: Number(order.unit_price),
      status: order.status,
    });

    setFormOpen(true);
  }

  function closeForm() {
    if (saving) return;

    setFormOpen(false);
    setEditingOrder(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setError("");

    try {
      const isEditing = editingOrder !== null;
      const url = isEditing
        ? `${API}/orders/${editingOrder.id}`
        : `${API}/orders`;

      const payload = {
        customer_name: form.customer_name.trim(),
        customer_email: form.customer_email.trim(),
        product_name: form.product_name.trim(),
        quantity: Number(form.quantity),
        unit_price: Number(form.unit_price).toFixed(2),
        ...(isEditing ? { status: form.status } : {}),
      };

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const detail = body?.detail;

        let message = `Unable to save order (HTTP ${response.status}).`;

        if (typeof detail === "string") {
          message = detail;
        } else if (Array.isArray(detail)) {
          message = detail
            .map((item: { msg?: string }) => item.msg || "Invalid input")
            .join(" ");
        }

        throw new Error(message);
      }

      setFormOpen(false);
      setEditingOrder(null);

      setNotice(
        isEditing
          ? "Order updated successfully."
          : "Order created successfully.",
      );

      await loadOrders();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteOrder) return;

    setDeleting(true);
    setError("");

    try {
      const response = await fetch(`${API}/orders/${deleteOrder.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(
          body?.detail || `Unable to delete order (HTTP ${response.status}).`,
        );
      }

      const deletedId = deleteOrder.id;

      setDeleteOrder(null);
      setNotice(`Order #${deletedId} deleted successfully.`);

      await loadOrders();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete this order.",
      );
    } finally {
      setDeleting(false);
    }
  }

  function updateField<K extends keyof OrderForm>(
    key: K,
    value: OrderForm[K],
  ) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  const calculatedTotal =
    Math.max(0, Number(form.quantity) || 0) *
    Math.max(0, Number(form.unit_price) || 0);

  return (
    <div className="space-y-7">
      {/* Page heading */}
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-bold tracking-[1.8px] text-cyan-700">
            <ShoppingBag size={15} />
            ORDER OPERATIONS
          </div>

          <h1 className="page-heading">Manage Orders</h1>

          <p className="page-description">
            Create, update, track, and manage your customer orders.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void loadOrders()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#102a43] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#193b59]"
          >
            <Plus size={18} />
            Add order
          </button>
        </div>
      </section>

      {/* Notifications */}
      {notice && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          <CheckCircle2 size={18} />
          <span className="flex-1">{notice}</span>
          <button
            type="button"
            onClick={() => setNotice("")}
            aria-label="Dismiss notification"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <p className="flex-1 break-words">{error}</p>
          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* Statistics */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total orders"
          value={String(stats.total)}
          description="Orders in your database"
          icon={<ClipboardList size={21} />}
          tone="blue"
        />

        <StatCard
          title="Pending orders"
          value={String(stats.pending)}
          description="Awaiting processing"
          icon={<Users size={21} />}
          tone="amber"
        />

        <StatCard
          title="Confirmed orders"
          value={String(stats.confirmed)}
          description="Orders confirmed"
          icon={<CheckCircle2 size={21} />}
          tone="green"
        />

        <StatCard
          title="Order value"
          value={formatMoney(stats.value)}
          description="Excludes cancelled orders"
          icon={<TrendingUp size={21} />}
          tone="purple"
        />
      </section>

      {/* Orders table */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 md:flex-row md:items-center md:px-6">
          <div>
            <h2 className="text-base font-bold text-[#102a43]">
              All orders
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Search your records or filter orders by status.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search orders..."
                aria-label="Search orders"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 sm:w-60"
              />
            </div>

            <div className="relative">
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                aria-label="Filter orders by status"
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-9 text-sm outline-none focus:border-cyan-500 sm:w-44"
              >
                <option value="all">All statuses</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {formatStatus(status)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50/70 px-5 py-3 text-xs text-slate-500 md:px-6">
          <span>
            Showing{" "}
            <strong className="text-slate-800">
              {filteredOrders.length}
            </strong>{" "}
            of {orders.length} orders
          </span>

          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Connected to FastAPI
          </span>
        </div>

        <div className="max-h-[520px] overflow-auto">
          <table className="w-full min-w-[950px] text-left">
            <thead className="sticky top-0 z-10">
              <tr className="border-y border-slate-100 bg-white text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4">Order ID</th>
                <th className="px-4 py-4">Customer</th>
                <th className="px-4 py-4">Product</th>
                <th className="px-4 py-4">Total</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <LoaderCircle
                      size={28}
                      className="mx-auto animate-spin text-cyan-600"
                    />
                    <p className="mt-3 text-sm text-slate-500">
                      Loading orders...
                    </p>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                      <Package size={24} />
                    </div>

                    <p className="mt-4 text-sm font-bold text-slate-800">
                      No orders found
                    </p>

                    <p className="mt-2 text-xs text-slate-500">
                      Try another search or create a new order.
                    </p>

                    {orders.length === 0 && (
                      <button
                        type="button"
                        onClick={openCreateModal}
                        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-700 hover:text-cyan-900"
                      >
                        <CirclePlus size={17} />
                        Create your first order
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="transition hover:bg-slate-50/80"
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-800">
                        #{String(order.id).padStart(4, "0")}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-50 text-xs font-bold text-cyan-800">
                          {customerInitials(order.customer_name)}
                        </div>

                        <div className="min-w-0">
                          <p className="max-w-48 truncate text-sm font-semibold text-slate-800">
                            {order.customer_name}
                          </p>
                          <p className="mt-1 max-w-48 truncate text-xs text-slate-500">
                            {order.customer_email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <p className="max-w-48 truncate text-sm font-medium text-slate-700">
                        {order.product_name}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Quantity: {order.quantity}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <p className="whitespace-nowrap text-sm font-bold text-slate-900">
                        {formatMoney(order.total_amount)}
                      </p>
                      <p className="mt-1 whitespace-nowrap text-xs text-slate-500">
                        {formatMoney(order.unit_price)} / unit
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <StatusBadge status={order.status} />
                    </td>

                    <td className="px-4 py-4">
                      <span className="whitespace-nowrap text-xs font-medium text-slate-600">
                        {formatDate(order.created_at)}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(order)}
                          title="Edit order"
                          aria-label={`Edit order ${order.id}`}
                          className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setError("");
                            setDeleteOrder(order);
                          }}
                          title="Delete order"
                          aria-label={`Delete order ${order.id}`}
                          className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 px-6 py-4 text-xs text-slate-500">
          Displaying up to 100 recent orders from your PostgreSQL database.
        </div>
      </section>

      {/* Add / Edit modal */}
      {formOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !saving
            ) {
              closeForm();
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-form-title"
            className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2
                  id="order-form-title"
                  className="text-lg font-bold text-[#102a43]"
                >
                  {editingOrder ? "Update order" : "Add new order"}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {editingOrder
                    ? `Editing order #${editingOrder.id}`
                    : "Enter customer and product details below."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                aria-label="Close order form"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 p-6">
              <div>
                <SectionLabel>Customer information</SectionLabel>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <FormField label="Customer name">
                    <input
                      required
                      minLength={1}
                      maxLength={100}
                      value={form.customer_name}
                      onChange={(event) =>
                        updateField("customer_name", event.target.value)
                      }
                      placeholder="Enter customer name"
                      className={inputClass}
                    />
                  </FormField>

                  <FormField label="Email address">
                    <input
                      required
                      type="email"
                      value={form.customer_email}
                      onChange={(event) =>
                        updateField("customer_email", event.target.value)
                      }
                      placeholder="customer@example.com"
                      className={inputClass}
                    />
                  </FormField>
                </div>
              </div>

              <div>
                <SectionLabel>Product information</SectionLabel>

                <div className="mt-4 space-y-4">
                  <FormField label="Product name">
                    <input
                      required
                      minLength={1}
                      maxLength={200}
                      value={form.product_name}
                      onChange={(event) =>
                        updateField("product_name", event.target.value)
                      }
                      placeholder="Enter product name"
                      className={inputClass}
                    />
                  </FormField>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField label="Quantity">
                      <input
                        required
                        type="number"
                        min={1}
                        step={1}
                        value={form.quantity}
                        onChange={(event) =>
                          updateField(
                            "quantity",
                            event.target.value === ""
                              ? 1
                              : Math.max(1, Number(event.target.value)),
                          )
                        }
                        className={inputClass}
                      />
                    </FormField>

                    <FormField label="Unit price (LKR)">
                      <input
                        required
                        type="number"
                        min={0}
                        max={99999999.99}
                        step="0.01"
                        value={form.unit_price}
                        onChange={(event) =>
                          updateField(
                            "unit_price",
                            event.target.value === ""
                              ? 0
                              : Math.max(0, Number(event.target.value)),
                          )
                        }
                        className={inputClass}
                      />
                    </FormField>
                  </div>
                </div>
              </div>

              {editingOrder && (
                <FormField label="Order status">
                  <select
                    value={form.status}
                    onChange={(event) =>
                      updateField(
                        "status",
                        event.target.value as OrderStatus,
                      )
                    }
                    className={inputClass}
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {formatStatus(status)}
                      </option>
                    ))}
                  </select>
                </FormField>
              )}

              <div className="flex items-center justify-between gap-4 rounded-xl border border-cyan-100 bg-cyan-50/70 p-4">
                <div>
                  <p className="text-xs font-semibold text-slate-700">
                    Estimated order total
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Quantity × unit price
                  </p>
                </div>

                <p className="text-xl font-bold text-[#102a43]">
                  {formatMoney(calculatedTotal)}
                </p>
              </div>

              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"
                >
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#102a43] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#193b59] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <LoaderCircle size={17} className="animate-spin" />
                  ) : editingOrder ? (
                    <Check size={17} />
                  ) : (
                    <CirclePlus size={17} />
                  )}

                  {saving
                    ? "Saving..."
                    : editingOrder
                      ? "Save changes"
                      : "Create order"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteOrder && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <Trash2 size={23} />
            </div>

            <h2
              id="delete-dialog-title"
              className="mt-5 text-lg font-bold text-slate-900"
            >
              Delete this order?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              You are about to delete order{" "}
              <strong className="text-slate-800">
                #{deleteOrder.id}
              </strong>{" "}
              for{" "}
              <strong className="text-slate-800">
                {deleteOrder.customer_name}
              </strong>
              . This action cannot be undone.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteOrder(null)}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={() => void handleDelete()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? (
                  <LoaderCircle size={17} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
                {deleting ? "Deleting..." : "Delete order"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 disabled:bg-slate-50";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-[1.5px] text-slate-500">
      {children}
    </p>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const styles: Record<OrderStatus, string> = {
    pending: "bg-amber-50 text-amber-700 ring-amber-200",
    confirmed: "bg-blue-50 text-blue-700 ring-blue-200",
    shipped: "bg-violet-50 text-violet-700 ring-violet-200",
    delivered: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    cancelled: "bg-red-50 text-red-700 ring-red-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1.5 text-[11px] font-semibold ring-1 ring-inset ${styles[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {formatStatus(status)}
    </span>
  );
}

function StatCard({
  title,
  value,
  description,
  icon,
  tone,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  tone: "blue" | "amber" | "green" | "purple";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
    green: "bg-emerald-50 text-emerald-700",
    purple: "bg-violet-50 text-violet-700",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${colors[tone]}`}
        >
          {icon}
        </div>

        <ArrowDownUp size={16} className="text-slate-300" />
      </div>

      <p className="mt-5 text-xs font-medium text-slate-500">{title}</p>

      <p className="mt-2 break-words text-2xl font-bold tracking-tight text-slate-900">
        {value}
      </p>

      <p className="mt-2 text-[11px] text-slate-500">{description}</p>
    </div>
  );
}
