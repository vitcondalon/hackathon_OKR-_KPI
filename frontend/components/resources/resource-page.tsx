"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";

import {
  ApiError,
  createResource,
  deleteResource,
  getResourceList,
  updateResource,
} from "@/lib/api";
import { formatValue, titleCase } from "@/lib/utils";

type FieldType = "text" | "textarea" | "number" | "date" | "email" | "password" | "select" | "checkbox";

type FieldConfig = {
  name: string;
  label: string;
  type?: FieldType;
  required?: boolean;
  options?: Array<{ label: string; value: string }>;
  optionResource?: {
    path: string;
    labelField: string;
    valueField: string;
  };
};

type ResourcePageProps = {
  title: string;
  description: string;
  resourcePath: string;
  fields: FieldConfig[];
};

function buildInitialState(fields: FieldConfig[]) {
  return fields.reduce<Record<string, string | boolean>>((acc, field) => {
    acc[field.name] = field.type === "checkbox" ? false : "";
    return acc;
  }, {});
}

function coerceValue(field: FieldConfig, value: string | boolean) {
  if (field.type === "checkbox") {
    return Boolean(value);
  }
  if (typeof value !== "string") {
    return value;
  }
  if (value === "") {
    return field.required ? value : null;
  }
  if (field.type === "number") {
    return Number(value);
  }
  return value;
}

export function ResourcePage({ title, description, resourcePath, fields }: ResourcePageProps) {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [form, setForm] = useState<Record<string, string | boolean>>(buildInitialState(fields));
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [optionSets, setOptionSets] = useState<Record<string, Array<{ label: string; value: string }>>>({});

  const displayFields = useMemo(() => fields.filter((field) => field.name !== "password"), [fields]);

  async function loadItems() {
    setLoading(true);
    setError("");
    try {
      const data = await getResourceList<Record<string, unknown>>(resourcePath);
      setItems(data);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : `Unable to load ${title}`;
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, [resourcePath]);

  useEffect(() => {
    async function loadOptions() {
      const resourceFields = fields.filter((field) => field.optionResource);
      if (resourceFields.length === 0) {
        return;
      }

      try {
        const entries = await Promise.all(
          resourceFields.map(async (field) => {
            const config = field.optionResource!;
            const data = await getResourceList<Record<string, unknown>>(config.path);
            return [
              field.name,
              data.map((item) => ({
                label: String(item[config.labelField] ?? item[config.valueField]),
                value: String(item[config.valueField]),
              })),
            ] as const;
          })
        );

        setOptionSets(Object.fromEntries(entries));
      } catch (err) {
        const message = err instanceof ApiError ? err.message : "Unable to load related options";
        setError(message);
      }
    }

    loadOptions();
  }, [fields]);

  function resetForm() {
    setForm(buildInitialState(fields));
    setEditingId(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const payload = Object.fromEntries(
      fields
        .filter((field) => field.name !== "password" || form[field.name] !== "")
        .map((field) => [field.name, coerceValue(field, form[field.name])])
        .filter(([, value]) => value !== null)
    );

    try {
      if (editingId === null) {
        await createResource(resourcePath, payload);
      } else {
        await updateResource(resourcePath, editingId, payload);
      }
      resetForm();
      await loadItems();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Unable to save record";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Delete this record?")) {
      return;
    }

    try {
      await deleteResource(resourcePath, id);
      if (editingId === id) {
        resetForm();
      }
      await loadItems();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Unable to delete record";
      setError(message);
    }
  }

  function handleEdit(item: Record<string, unknown>) {
    const nextState = buildInitialState(fields);
    fields.forEach((field) => {
      const value = item[field.name];
      if (field.type === "checkbox") {
        nextState[field.name] = Boolean(value);
      } else {
        nextState[field.name] = value === null || value === undefined ? "" : String(value);
      }
    });
    if ("password" in nextState) {
      nextState.password = "";
    }
    setForm(nextState);
    setEditingId(Number(item.id));
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <section className="rounded-[28px] bg-white p-6 shadow-panel">
        <div className="mb-4">
          <p className="text-sm text-slate-500">{description}</p>
          <h3 className="text-2xl font-semibold text-slate-950">
            {editingId === null ? `Create ${title}` : `Edit ${title}`}
          </h3>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {fields.map((field) => {
            const options = field.options ?? optionSets[field.name] ?? [];
            const value = form[field.name];

            return (
              <label key={field.name} className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">{field.label}</span>
                {field.type === "textarea" ? (
                  <textarea
                    rows={4}
                    value={String(value)}
                    onChange={(event) => setForm((prev) => ({ ...prev, [field.name]: event.target.value }))}
                    required={field.required}
                  />
                ) : field.type === "select" ? (
                  <select
                    value={String(value)}
                    onChange={(event) => setForm((prev) => ({ ...prev, [field.name]: event.target.value }))}
                    required={field.required}
                  >
                    <option value="">Select {field.label}</option>
                    {options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === "checkbox" ? (
                  <input
                    checked={Boolean(value)}
                    onChange={(event) => setForm((prev) => ({ ...prev, [field.name]: event.target.checked }))}
                    type="checkbox"
                    className="h-5 w-5 rounded border-slate-300"
                  />
                ) : (
                  <input
                    value={String(value)}
                    onChange={(event) => setForm((prev) => ({ ...prev, [field.name]: event.target.value }))}
                    type={field.type ?? "text"}
                    step={field.type === "number" ? "0.01" : undefined}
                    required={editingId === null ? field.required : false}
                  />
                )}
              </label>
            );
          })}

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-brand-500 px-5 py-3 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {saving ? "Saving..." : editingId === null ? "Create" : "Update"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-2xl border border-slate-200 px-5 py-3 text-sm text-slate-700 hover:bg-slate-50"
            >
              Clear
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-[28px] bg-white p-6 shadow-panel">
        <div className="mb-4">
          <p className="text-sm text-slate-500">Records</p>
          <h3 className="text-2xl font-semibold text-slate-950">{title} list</h3>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Loading records...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500">
                  {displayFields.map((field) => (
                    <th key={field.name} className="px-3 py-3 font-medium">
                      {field.label}
                    </th>
                  ))}
                  <th className="px-3 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={String(item.id)} className="border-b border-slate-100 align-top">
                    {displayFields.map((field) => (
                      <td key={field.name} className="px-3 py-3 text-slate-700">
                        {formatValue(item[field.name])}
                      </td>
                    ))}
                    <td className="px-3 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(Number(item.id))}
                          className="rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={displayFields.length + 1} className="px-3 py-8 text-center text-slate-500">
                      No {titleCase(title)} records yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
