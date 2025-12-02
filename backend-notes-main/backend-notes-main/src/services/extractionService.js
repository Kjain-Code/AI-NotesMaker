import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

export async function extractTextFromPDF(buffer) {
  try {
    if (!buffer || buffer.length === 0) {
      throw new Error("Empty PDF buffer");
    }

    console.log("PDF extraction started, buffer size:", buffer.length);

    // Load document from buffer
    const loadingTask = getDocument({ data: new Uint8Array(buffer) });
    const pdf = await loadingTask.promise;

    let fullText = "";

    // Loop through pages
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();

      const pageText = content.items.map((item) => item.str).join(" ");

      fullText += pageText + "\n\n";
    }

    console.log(
      "PDF extraction successful! Pages:",
      pdf.numPages,
      "Text length:",
      fullText.length
    );

    return {
      success: true,
      text: fullText,
      pages: pdf.numPages,
    };
  } catch (error) {
    console.error("PDF extraction failed:", error);
    return { success: false, error: error.message };
  }
}

export function extractTextFromFile(buffer) {
  try {
    if (!buffer || buffer.length === 0) {
      throw new Error("Empty text buffer");
    }

    const text = buffer.toString("utf-8");

    return { success: true, text };
  } catch (error) {
    console.error("Text extraction failed:", error);
    return { success: false, error: error.message };
  }
}
