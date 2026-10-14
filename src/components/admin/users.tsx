"use client";

import * as React from "react";
import { Pencil, Plus } from "lucide-react";
import AdminHeader from "./admin-header";
import {
  AdminDialog,
  AdminTable,
  api,
  DeleteButton,
  Field,
  iconButtonClass,
  isValidEmail,
  SwitchField,
  Td,
  Th,
  toastError,
  toastSuccess,
  Tr,
  useAdminData,
} from "./admin-utils";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { LoadingState, ErrorState, EmptyState } from "@/components/site/states";
import type { AdminRole, AdminUser, UserStatus } from "@/lib/types";

const ADMIN_ROLES: AdminRole[] = [
  "SUPER_ADMIN",
  "CONTENT_MANAGER",
  "BUSINESS_MANAGER",
  "VIEWER",
];

const ROLE_BADGE_STYLES: Record<AdminRole, string> = {
  SUPER_ADMIN:
    "border-electric/25 bg-electric/[0.06] text-electric",
  CONTENT_MANAGER: "border-amber-600/25 bg-amber-50 text-[#B45309]",
  BUSINESS_MANAGER: "border-cyan-700/25 bg-cyan-50 text-[#0E7490]",
  VIEWER: "border-hairline bg-white text-ink-soft",
};

/* ---------------------------------------------------------------- */
/* Dialogs                                                            */
/* ---------------------------------------------------------------- */

function UserDialog({
  item,
  isSelf,
  onClose,
  onSaved,
}: {
  item: AdminUser | null;
  isSelf: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = React.useState(item?.name ?? "");
  const [email, setEmail] = React.useState(item?.email ?? "");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState<AdminRole>(item?.role ?? "CONTENT_MANAGER");
  const [status, setStatus] = React.useState<UserStatus>(item?.status ?? "ACTIVE");
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [submitting, setSubmitting] = React.useState(false);

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = "Name must be at least 2 characters.";
    if (!isValidEmail(email)) next.email = "Please provide a valid email address.";
    if (item === null && password.length < 8) {
      next.password = "Password must be at least 8 characters.";
    }
    if (item !== null && password !== "" && password.length < 8) {
      next.password = "New password must be at least 8 characters (or leave empty).";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (item === null) {
        await api("/api/admin/users", "POST", {
          name: name.trim(),
          email: email.trim(),
          password,
          role,
        });
        toastSuccess("User created");
      } else {
        const payload: Record<string, unknown> = {
          name: name.trim(),
          email: email.trim(),
          role,
          status,
        };
        if (password !== "") payload.password = password;
        await api(`/api/admin/users/${item.id}`, "PUT", payload);
        toastSuccess("Changes saved");
      }
      onSaved();
      onClose();
    } catch (e) {
      toastError(
        item === null ? "Could not create user." : "Could not save changes.",
        e instanceof Error ? e.message : undefined
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminDialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={item === null ? "Add User" : `Edit ${item.name}`}
      description={
        item === null
          ? "Create an admin account — the new user can sign in immediately."
          : "Update account details, role or status. Leave the password blank to keep the current one."
      }
      submitting={submitting}
      submitLabel={item === null ? "Create User" : "Save Changes"}
      onSubmit={submit}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" required error={errors.name}>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ETARNITY Admin"
            className="h-10 border-hairline focus-visible:ring-electric"
          />
        </Field>
        <Field label="Email" required error={errors.email}>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@etarnity.com"
            className="h-10 border-hairline focus-visible:ring-electric"
          />
        </Field>
        <Field
          label={item === null ? "Password" : "New Password"}
          required={item === null}
          error={errors.password}
          hint={item === null ? "Minimum 8 characters." : "Leave blank to keep unchanged."}
        >
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
            className="h-10 border-hairline focus-visible:ring-electric"
          />
        </Field>
        <Field label="Role" required>
          <Select value={role} onValueChange={(v) => setRole(v as AdminRole)}>
            <SelectTrigger className="h-10 w-full border-hairline bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ADMIN_ROLES.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        {item !== null ? (
          <div className="sm:col-span-2">
            <SwitchField
              label="Active"
              hint={
                isSelf
                  ? "You cannot suspend your own account."
                  : "Suspended users cannot sign in."
              }
              checked={status === "ACTIVE"}
              onCheckedChange={(v) => setStatus(v ? "ACTIVE" : "SUSPENDED")}
            />
          </div>
        ) : null}
      </div>
    </AdminDialog>
  );
}

/* ---------------------------------------------------------------- */
/* Section                                                            */
/* ---------------------------------------------------------------- */

export default function UsersSection({ me }: { me: AdminUser }) {
  const admin = useAdminData<AdminUser[]>("/api/admin/users");

  const [dialog, setDialog] = React.useState<{
    item: AdminUser | null;
    key: string;
  } | null>(null);

  const toggleStatus = async (user: AdminUser) => {
    const next: UserStatus = user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      await api(`/api/admin/users/${user.id}`, "PUT", { status: next });
      toastSuccess(next === "ACTIVE" ? "User activated" : "User suspended");
      admin.refresh();
    } catch (e) {
      toastError(
        "Could not update status.",
        e instanceof Error ? e.message : undefined
      );
    }
  };

  const remove = async (user: AdminUser) => {
    try {
      await api(`/api/admin/users/${user.id}`, "DELETE");
      toastSuccess(`Deleted "${user.name}".`);
      admin.refresh();
    } catch (e) {
      toastError(
        "Could not delete user.",
        e instanceof Error ? e.message : undefined
      );
    }
  };

  return (
    <div>
      <AdminHeader
        section="Users"
        title="Users"
        description="Admin accounts and roles — only super admins can manage users."
        action={
          <button
            type="button"
            onClick={() => setDialog({ item: null, key: `new-${Date.now()}` })}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-graphite px-5 text-sm font-medium text-white transition-colors hover:bg-[#23262D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
          >
            <Plus className="size-4" />
            Add User
          </button>
        }
      />

      {admin.loading ? <LoadingState label="Loading users" /> : null}

      {!admin.loading && admin.error ? (
        <ErrorState message={admin.error} onRetry={admin.refresh} />
      ) : null}

      {!admin.loading && !admin.error && (admin.data ?? []).length === 0 ? (
        <EmptyState
          title="No users yet."
          description="Create the first admin account."
        />
      ) : null}

      {!admin.loading && !admin.error && (admin.data ?? []).length > 0 ? (
        <AdminTable>
          <thead>
            <tr className="border-b border-hairline">
              <Th>User</Th>
              <Th>Role</Th>
              <Th className="text-center">Status</Th>
              <Th>Created</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {(admin.data ?? []).map((user) => {
              const isSelf = user.id === me.id;
              return (
                <Tr key={user.id}>
                  <Td>
                    <div className="flex flex-col">
                      <span className="font-medium text-graphite">
                        {user.name}
                        {isSelf ? (
                          <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.15em] text-electric">
                            You
                          </span>
                        ) : null}
                      </span>
                      <span className="text-xs text-ink-soft">{user.email}</span>
                    </div>
                  </Td>
                  <Td>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.15em] ${ROLE_BADGE_STYLES[user.role]}`}
                    >
                      {user.role.replace(/_/g, " ")}
                    </span>
                  </Td>
                  <Td className="text-center">
                    <Switch
                      checked={user.status === "ACTIVE"}
                      disabled={isSelf}
                      onCheckedChange={() => void toggleStatus(user)}
                      aria-label={`Toggle active for ${user.name}`}
                    />
                  </Td>
                  <Td>
                    <span className="font-mono text-[11px] text-ink-soft">
                      {new Date(user.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </Td>
                  <Td>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        aria-label={`Edit ${user.name}`}
                        className={iconButtonClass}
                        onClick={() =>
                          setDialog({ item: user, key: `edit-${user.id}` })
                        }
                      >
                        <Pencil className="size-4" />
                      </button>
                      <DeleteButton
                        ariaLabel={`Delete ${user.name}`}
                        onConfirm={() => remove(user)}
                      />
                    </div>
                  </Td>
                </Tr>
              );
            })}
          </tbody>
        </AdminTable>
      ) : null}

      {dialog ? (
        <UserDialog
          key={dialog.key}
          item={dialog.item}
          isSelf={dialog.item?.id === me.id}
          onClose={() => setDialog(null)}
          onSaved={admin.refresh}
        />
      ) : null}
    </div>
  );
}
