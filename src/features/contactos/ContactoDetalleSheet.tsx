"use client";

import { useEffect } from "react";
import { X, Phone, MessageCircle, MapPin, Calendar, User, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useSession } from "@/lib/session/SessionProvider";
import { eliminarContacto, puedeEliminar } from "@/lib/repo/contactos";
import { getDB } from "@/lib/repo/db";
import { cn } from "@/lib/utils";
import type { Contacto } from "@/types/domain";

type Props = {
  contacto: Contacto | null;
  onClose: () => void;
  onDelete?: () => void;
};

export function ContactoDetalleSheet({ contacto, onClose, onDelete }: Props) {
  const { session } = useSession();

  useEffect(() => {
    if (!contacto) return;
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [contacto, onClose]);

  if (!contacto || !session) return null;

  const registrador = getDB().usuarios.find((u) => u.id === contacto.colportor_id);
  const telClean = contacto.telefono?.replace(/\s+/g, "");
  const canDelete = puedeEliminar(session, contacto);

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Detalles del contacto">
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />

      <div
        className="absolute inset-x-0 bottom-0 mx-auto max-h-[85vh] max-w-lg overflow-y-auto rounded-t-3xl bg-(--color-surface) p-5 shadow-[0_-8px_40px_-10px_rgba(15,23,42,0.25)] safe-bottom"
        style={{ animation: "slideUp 220ms cubic-bezier(0.22, 1, 0.36, 1)" }}
      >
        <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>

        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-(--color-border)" aria-hidden />

        <header className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold tracking-tight">{contacto.nombre}</h2>
            <div className="mt-2">
              <StatusBadge status={contacto.estado} />
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-(--color-fg-muted) hover:bg-(--color-surface-2)"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </header>

        {telClean && (
          <div className="mb-4 flex gap-2">
            <a
              href={`tel:${telClean}`}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-(--color-brand) px-4 py-3 text-sm font-semibold text-white transition hover:bg-(--color-brand-hover)"
            >
              <Phone size={16} />
              Llamar
            </a>
            <a
              href={`https://wa.me/${telClean.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-3 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50"
            >
              <MessageCircle size={16} />
              WhatsApp
            </a>
          </div>
        )}

        <dl className="space-y-3">
          {contacto.telefono && (
            <Row icon={<Phone size={16} />} label="Teléfono">
              <a href={`tel:${telClean}`} className="font-medium text-(--color-brand)">
                {contacto.telefono}
              </a>
            </Row>
          )}

          {contacto.nota && (
            <Row icon={<MessageCircle size={16} />} label="Nota">
              <p className="whitespace-pre-wrap text-sm">{contacto.nota}</p>
            </Row>
          )}

          <Row icon={<Calendar size={16} />} label="Primer contacto">
            <p className="text-sm">
              {format(new Date(contacto.creado_en), "d 'de' MMMM, yyyy · HH:mm", { locale: es })}
            </p>
            <p className="mt-0.5 text-xs text-(--color-fg-subtle)">
              hace {formatDistanceToNow(new Date(contacto.creado_en), { locale: es })}
            </p>
          </Row>

          {contacto.actualizado_en !== contacto.creado_en && (
            <Row icon={<Calendar size={16} />} label="Última actualización">
              <p className="text-sm">
                {format(new Date(contacto.actualizado_en), "d 'de' MMMM, yyyy · HH:mm", { locale: es })}
              </p>
            </Row>
          )}

          {session.esMonitor && registrador && (
            <Row icon={<User size={16} />} label="Registrado por">
              <p className="text-sm font-medium">{registrador.nombre}</p>
              {registrador.ciudad && (
                <p className="text-xs text-(--color-fg-muted)">
                  {registrador.ciudad}
                  {registrador.departamento ? `, ${registrador.departamento}` : ""}
                </p>
              )}
            </Row>
          )}

          <Row icon={<MapPin size={16} />} label="Ubicación aproximada">
            {contacto.ubicacion ? (
              <p className="text-sm">
                {contacto.ubicacion.lat.toFixed(5)}, {contacto.ubicacion.lng.toFixed(5)}
                <span className="ml-1 text-xs text-(--color-fg-subtle)">(±100 m)</span>
              </p>
            ) : (
              <p className="text-sm text-(--color-fg-muted)">Sin ubicación registrada</p>
            )}
          </Row>
        </dl>

        {canDelete && (
          <button
            type="button"
            onClick={() => {
              if (!confirm(`¿Eliminar a ${contacto.nombre}?`)) return;
              const ok = eliminarContacto(session, contacto.id);
              if (ok) {
                toast.success(`${contacto.nombre} eliminada`);
                onDelete?.();
                onClose();
              } else {
                toast.error("No tienes permiso");
              }
            }}
            className={cn(
              "mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-(--color-error) transition hover:bg-red-100"
            )}
          >
            <Trash2 size={16} />
            Eliminar contacto
          </button>
        )}
      </div>
    </div>
  );
}

function Row({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-(--color-border) bg-(--color-surface-2)/40 p-3">
      <dt className="flex items-center gap-1.5 text-xs font-medium text-(--color-fg-muted)">
        <span className="text-(--color-fg-subtle)">{icon}</span>
        {label}
      </dt>
      <dd className="mt-1">{children}</dd>
    </div>
  );
}
