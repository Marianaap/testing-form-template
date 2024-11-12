import jsPDF from "jspdf";

const form = document.getElementById("testForm");
const evidenceInput = document.getElementById("testEvidence");
const uploadBtn = document.getElementById("uploadBtn");
const previewGrid = document.getElementById("previewGrid");

uploadBtn.addEventListener("click", () => {
  evidenceInput.click();
});

evidenceInput.addEventListener("change", () => {
  previewGrid.innerHTML = ""; // Limpa prévias anteriores

  const files = evidenceInput.files;
  Array.from(files).forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement("img");
      img.src = e.target.result;
      previewGrid.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
});



document.getElementById("generatePdfBtn").addEventListener("click", async () => {
  const doc = new jsPDF();

  const boxMargin = 10;
  const boxWidth = 180;
  let yOffset = 20;

  doc.setFontSize(18);
  doc.setFont("calibri", "bold");
  doc.text("Manual de Testes", 10, yOffset);
  yOffset += 15;

  function addDivider(doc, yPosition) {
    doc.setLineWidth(0.05);
    doc.line(10, yPosition, 200, yPosition);
    return yPosition + 5;
  }

  function addTextWithLineBreak(doc, label, content, yPosition) {
    doc.setFont("calibri", "bold");
    doc.setFontSize(14);

    doc.text(`${label}`, boxMargin, yPosition);
    doc.setFont("calibri", "normal");
    doc.setFontSize(12);

    // Quebra o conteúdo em linhas com base na largura máxima
    const lines = doc.splitTextToSize(content, boxWidth);
    doc.text(lines, boxMargin, yPosition + 7);
    return yPosition + 12 + lines.length * 6; // Calcula nova posição y com base na quantidade de linhas
  }

  yOffset = addTextWithLineBreak(doc, "Título", form.testTitle.value, yOffset);
  addDivider(doc, yOffset - 8);
  yOffset = addTextWithLineBreak(doc, "Descrição", form.testDescription.value, yOffset);
  addDivider(doc, yOffset - 8);
  yOffset = addTextWithLineBreak(doc, "Tipo do teste", form.testType.value, yOffset);
  addDivider(doc, yOffset - 8);
  yOffset = addTextWithLineBreak(doc, "Prioridade", form.testPriority.value, yOffset);
  addDivider(doc, yOffset - 8);
  yOffset = addTextWithLineBreak(doc, "Data do teste", form.testDate.value ? new Date(form.testDate.value).toLocaleDateString() : "N/A", yOffset);
  addDivider(doc, yOffset - 8);
  yOffset = addTextWithLineBreak(doc, "Projeto", form.projectName.value, yOffset);
  addDivider(doc, yOffset - 8);
  yOffset = addTextWithLineBreak(doc, "Ambiente", form.environment.value, yOffset);
  addDivider(doc, yOffset - 8);

  if (evidenceInput.files.length > 0) {
    doc.setFontSize(14);
    doc.setFont("calibri", "bold");
    doc.text("Evidências", 10, yOffset);
    yOffset += 10;

    const files = evidenceInput.files;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const imageData = await readImageFile(file);

      if (yOffset + 60 > doc.internal.pageSize.height) {
        doc.addPage();
        yOffset = 20;
      }
      doc.addImage(imageData, "JPEG", 10, yOffset, 50, 50);
      yOffset += 60;
    }
  }

  doc.save(`Manual de Testes - ${form.testTitle.value}.pdf`);
});

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

// Função para copiar dados formatados para o clipboard
document.getElementById("copyTextBtn").addEventListener("click", () => {
  const files = evidenceInput.files;
  const evidenceText = Array.from(files).map(file => file.name).join(", ");

  const formattedText = `
    Title Test: ${form.testTitle.value}
    Test Priority: ${form.testPriority.value}
    Test Date: ${form.testDate.value}
    Description: ${form.testDescription.value}
    Project Name: ${form.projectName.value}
    Environment: ${form.environment.value}
    Evidence Files: ${evidenceText}
  `;

  navigator.clipboard.writeText(formattedText).then(() => {
    alert("Text copied to clipboard!");
  });
});