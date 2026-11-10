import { useEffect, useRef, useState } from "react";
import { updateUrl } from "../../js/utils";

/**
 * Хук для параметра phase в URL.
 *
 * @param {Object}   options
 * @param {Array}    [options.values]      - допустимые значения (для дискретного набора, напр. ["r16","r8",...]).
 *                                            Значение из URL сравнивается через String().
 * @param {number}   [options.min]         - минимум (для диапазона, напр. 1).
 * @param {number}   [options.max]         - максимум (для диапазона).
 * @param {Function} [options.parse]       - (raw: string) => value | null — кастомный парсер.
 *                                            Если не задан, для диапазона используется parseInt.
 * @param {string}   [options.param="phase"] - имя URL-параметра.
 *
 * @returns {[value, setValue, direction]}
 *   value      — текущее валидное значение (не из URL, а уже нормализованное).
 *   setValue   — (nextValue, direction?) => void.
 *   direction  — 1 | -1 (для анимации; меняется при setValue).
 *
 * Значение из URL нормализуется:
 *   - если невалидно/отсутствует — берётся первое допустимое и сразу пишется в URL.
 *   - при смене value — пишется в URL через updateUrl(param, value).
 */
export function useUrlPhase({ values, min, max, parse, param = "phase" } = {}) {
  // --- валидатор ---
  const isValid = (v) => {
    if (values) return values.includes(v);
    if (typeof min === "number" && typeof max === "number") {
      const n = Number(v);
      return Number.isFinite(n) && n >= min && n <= max;
    }
    return false;
  };

  // --- парсер из URL ---
  const parseFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get(param);
    if (raw == null) return null;
    const parsed = parse ? parse(raw) : values ? raw : Number(raw);
    return isValid(parsed) ? parsed : null;
  };

  // --- первое допустимое значение ---
  const getFirst = () => {
    if (values) return values[0];
    if (typeof min === "number") return min;
    return null;
  };

  const [value, setValueState] = useState(() => parseFromUrl() ?? getFirst());
  const [direction, setDirection] = useState(1);
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
    updateUrl(param, value);
  }, [value]);

  // Публичный setter: обновляет direction и value
  const setValue = (nextValue, dir = 1) => {
    if (!isValid(nextValue)) return;
    setDirection(dir);
    setValueState(nextValue);
  };

  return [value, setValue, direction];
}
