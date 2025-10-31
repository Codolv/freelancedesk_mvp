"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatePresence } from "framer-motion";
import { Motion } from "@/components/custom/Motion"
import { Plus, Trash2 } from "lucide-react";

type Item = {
  description: string;
  quantity: number | null;
  unit_price_cents: number | null;
};

export function ItemsField({ initialItems }: { initialItems?: Item[] } = {}) {
  const [items, setItems] = useState<Item[]>(
    initialItems && initialItems.length > 0
      ? initialItems
      : [{ description: "", quantity: null, unit_price_cents: null }]
  );
 const [total, setTotal] = useState(0);

  useEffect(() => {
    const totalCents = items.reduce(
      (sum, it) => sum + ((it.quantity || 0) * (it.unit_price_cents || 0)),
      0
    );
    setTotal(totalCents);
  }, [items]);

  const handleItemChange = (index: number, field: keyof Item, value: string) => {
    const updated = [...items];
    if (field === "quantity") {
      updated[index][field] = value === "" ? null : parseFloat(value);
    } else if (field === "unit_price_cents") {
      updated[index][field] =
        value === "" ? null : Math.round(parseFloat(value) * 100);
    } else {
      updated[index][field] = value;
    }
    setItems(updated);
  };

  const addItem = () =>
    setItems([...items, { description: "", quantity: null, unit_price_cents: null }]);
  const removeItem = (index: number) =>
    setItems(items.filter((_, i) => i !== index));

  return (
    <div className="space-y-3">
      <Label>Rechnungsposten</Label>
      <input type="hidden" name="items" value={JSON.stringify(items)} />

      <Card className="bg-background/60 border-border/60">
        <CardContent className="p-4 space-y-3">
          <AnimatePresence initial={false}>
            {items.map((item, index) => (
              <Motion
                key={index}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-12 gap-2 items-center"
              >
                {/* Beschreibung */}
                <div className="col-span-5">
                  <Input
                    placeholder="Beschreibung"
                    value={item.description}
                    onChange={(e) =>
                      handleItemChange(index, "description", e.target.value)
                    }
                  />
                </div>

                {/* Menge */}
                <div className="col-span-2">
                  <Input
                    type="number"
                    placeholder="Menge"
                    value={item.quantity === null ? "" : item.quantity}
                    onChange={(e) =>
                      handleItemChange(index, "quantity", e.target.value)
                    }
                  />
                </div>

                {/* Einzelpreis */}
                <div className="col-span-3">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Einzelpreis (€)"
                    value={
                      item.unit_price_cents === null
                        ? ""
                        : (item.unit_price_cents / 100).toString()
                    }
                    onChange={(e) =>
                      handleItemChange(index, "unit_price_cents", e.target.value)
                    }
                  />
                </div>

                {/* Einzel-Total */}
                <div className="col-span-1 text-right text-sm font-medium">
                  {item.quantity && item.unit_price_cents
                    ? ((item.quantity * item.unit_price_cents) / 100).toLocaleString(
                        "de-DE",
                        { style: "currency", currency: "EUR" }
                      )
                    : ""}
                </div>

                {/* Löschen */}
                <div className="col-span-1 flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(index)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Motion>
            ))}
          </AnimatePresence>

          {/* Hinzufügen + Gesamt */}
          <div className="flex justify-between items-center pt-2 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addItem}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Position hinzufügen
            </Button>

            <div className="text-right font-semibold text-sm">
              Gesamt:{" "}
              {(total / 100).toLocaleString("de-DE", {
                style: "currency",
                currency: "EUR",
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
