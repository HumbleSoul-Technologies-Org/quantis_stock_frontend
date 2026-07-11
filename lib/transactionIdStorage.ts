const CREDIT_SALE_TXN_ID_COUNTER_KEY = "credit_sale_txn_counter";

export function getCreditSaleTxnCounterStorageKey(): string {
  return CREDIT_SALE_TXN_ID_COUNTER_KEY;
}

export function getCurrentCreditSaleTxnId(): string {
  if (typeof window === "undefined") {
    return "00001";
  }

  try {
    const storedValue = window.localStorage.getItem(
      CREDIT_SALE_TXN_ID_COUNTER_KEY,
    );
    const parsedValue = Number(storedValue);
    const currentCounter =
      Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : 0;
    return String(currentCounter + 1).padStart(5, "0");
  } catch (error) {
    console.error("Failed to read credit sale transaction ID counter:", error);
    return "00001";
  }
}

export function getNextCreditSaleTxnId(): string {
  if (typeof window === "undefined") {
    return "00001";
  }

  try {
    const storedValue = window.localStorage.getItem(
      CREDIT_SALE_TXN_ID_COUNTER_KEY,
    );
    const parsedValue = Number(storedValue);
    const currentCounter =
      Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : 0;
    const nextValue = currentCounter + 1;
    const formattedValue = String(nextValue).padStart(5, "0");

    window.localStorage.setItem(
      CREDIT_SALE_TXN_ID_COUNTER_KEY,
      String(nextValue),
    );

    return formattedValue;
  } catch (error) {
    console.error("Failed to generate credit sale transaction ID:", error);
    try {
      window.localStorage.setItem(CREDIT_SALE_TXN_ID_COUNTER_KEY, "1");
    } catch (storageError) {
      console.error(
        "Failed to persist credit sale transaction ID counter:",
        storageError,
      );
    }
    return "00001";
  }
}

export function preserveCreditSaleTxnCounterOnLogout(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const storedCounter = window.localStorage.getItem(
      CREDIT_SALE_TXN_ID_COUNTER_KEY,
    );
    window.localStorage.clear();

    if (storedCounter !== null) {
      window.localStorage.setItem(
        CREDIT_SALE_TXN_ID_COUNTER_KEY,
        storedCounter,
      );
    }
  } catch (error) {
    console.error(
      "Failed to preserve credit sale transaction ID counter on logout:",
      error,
    );
  }
}
