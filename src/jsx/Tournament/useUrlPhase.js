import { useEffect, useRef, useState } from "react";
import { updateUrl } from "../../js/utils";

export function useUrlPhase({ values, min, max, parse, param = "phase" } = {}) {
  const isValid = (v) => {
    if (values) return values.includes(v);
    if (typeof min === "number" && typeof max === "number") {
      const n = Number(v);
      return Number.isFinite(n) && n >= min && n <= max;
    }
    return false;
  };

  const parseFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get(param);
    if (raw == null) return null;
    const parsed = parse ? parse(raw) : values ? raw : Number(raw);
    return isValid(parsed) ? parsed : null;
  };

  const getFirst = () => {
    if (values) return values[0];
    if (typeof min === "number") return min;
    return null;
  };

  // Атомарный стейт: value + direction вместе
  const [state, setState] = useState(() => ({
    value: parseFromUrl() ?? getFirst(),
    direction: 1,
  }));

  const didMountRef = useRef(false);
  const didNormalizeRef = useRef(false);

  // Нормализация URL при монтировании
  useEffect(() => {
    if (didNormalizeRef.current) return;
    didNormalizeRef.current = true;

    const params = new URLSearchParams(window.location.search);
    const raw = params.get(param);
    const parsed = parse ? parse(raw) : values ? raw : Number(raw);
    if (!isValid(parsed)) {
      updateUrl(param, getFirst());
    }
  }, []);

  // Синхронизация URL при смене значения
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    updateUrl(param, state.value);
  }, [state.value]);

  // Публичный setter: одна атомарная запись
  const setValue = (nextValue, dir = 1) => {
    if (!isValid(nextValue)) return;
    setState({ value: nextValue, direction: dir });
  };

  return [state.value, setValue, state.direction];
}
