export async function downloadReceiptPdf(
  receiptElement: HTMLElement,
  filename = `receipt-${new Date().toISOString().slice(0, 10)}.pdf`,
): Promise<void> {
  const html2canvasModule = await import("html2canvas");
  const jsPDFModule = await import("jspdf");
  const html2canvas = html2canvasModule.default;
  const { jsPDF } = jsPDFModule;

  // Clone the receipt element and sanitize styles to avoid css color functions
  // (like lab()) that html2canvas cannot parse. We apply simple inline styles
  // to ensure predictable rendering in the generated canvas.
  const clone = receiptElement.cloneNode(true) as HTMLElement;

  // Inline computed styles to preserve the visual appearance of the receipt
  // when rendering with html2canvas. This copies resolved styles into
  // inline styles on each cloned element so the canvas render matches the
  // preview shown in the app.
  const inlineComputedStyles = (el: HTMLElement) => {
    const cs = window.getComputedStyle(el as Element);
    const props = [
      "background",
      "background-color",
      "background-image",
      "color",
      "font",
      "font-size",
      "font-weight",
      "font-family",
      "line-height",
      "letter-spacing",
      "text-align",
      "padding",
      "margin",
      "border",
      "border-radius",
      "box-shadow",
      "display",
      "width",
      "height",
      "min-width",
      "max-width",
      "min-height",
      "max-height",
      "white-space",
    ];

    props.forEach((p) => {
      try {
        const val = cs.getPropertyValue(p);
        if (val) el.style.setProperty(p, val);
      } catch {
        // ignore
      }
    });

    // Handle simple pseudo-element content by creating spans if needed
    ["::before", "::after"].forEach((pseudo) => {
      try {
        const pcs = window.getComputedStyle(
          el as Element,
          pseudo as unknown as Element,
        );
        const content = pcs.getPropertyValue("content");
        if (content && content !== "none" && content !== "normal") {
          const text = content.replace(/^"|"$/g, "");
          const span = document.createElement("span");
          span.textContent = text;
          // copy a few visual properties
          [
            "color",
            "font",
            "font-size",
            "font-weight",
            "background",
            "background-color",
          ].forEach((pp) => {
            try {
              const v = pcs.getPropertyValue(pp);
              if (v) span.style.setProperty(pp, v);
            } catch {}
          });
          if (pseudo === "::before") el.insertBefore(span, el.firstChild);
          else el.appendChild(span);
        }
      } catch {
        // ignore pseudo-element reads
      }
    });

    Array.from(el.children).forEach((child) => {
      if (child instanceof HTMLElement) inlineComputedStyles(child);
    });
  };

  inlineComputedStyles(clone);

  // Place offscreen so images/fonts can load if needed
  clone.style.position = "fixed";
  clone.style.left = "-9999px";
  clone.style.top = "0";
  document.body.appendChild(clone);

  let canvas: HTMLCanvasElement | null = null;
  try {
    // Wait for web fonts to be ready so text renders correctly in the canvas
    if (document.fonts && document.fonts.ready) {
      try {
        await document.fonts.ready;
      } catch {
        // ignore font loading errors
      }
    }

    canvas = await html2canvas(clone, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
    });
  } catch {
    // Fallback: create a simple text-only PDF if html2canvas fails (e.g., unsupported color functions)
    const text = clone.innerText || receiptElement.innerText || "Receipt";
    const pdfFallback = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = pdfFallback.internal.pageSize.getWidth();
    const margin = 10;
    const usableWidth = pageWidth - margin * 2;
    const lines = pdfFallback.splitTextToSize(text, usableWidth);
    pdfFallback.text(lines, margin, margin + 10);
    // cleanup DOM
    document.body.removeChild(clone);
    pdfFallback.save(filename);
    return;
  }

  // remove the clone after rendering
  document.body.removeChild(clone);

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const imgWidth = pageWidth - margin * 2;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  const printableHeight = pageHeight - margin * 2;
  const totalPages = Math.ceil(imgHeight / printableHeight);

  for (let page = 0; page < totalPages; page += 1) {
    if (page > 0) {
      pdf.addPage();
    }
    const position = -page * printableHeight + margin;
    pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
  }

  pdf.save(filename);
}
