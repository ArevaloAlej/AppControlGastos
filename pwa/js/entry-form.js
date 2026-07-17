let debounceTasaId = null;

function initEntryForm() {
  const form = document.getElementById("form-movimiento");
  if (!form) return;

  document.getElementById("mov-fecha").valueAsDate = new Date();
  actualizarCategorias();

  form.tipo.forEach && form.tipo.forEach(r => r.addEventListener("change", actualizarCategorias));
  document.querySelectorAll('input[name="tipo"]').forEach(r =>
    r.addEventListener("change", actualizarCategorias)
  );

  document.getElementById("mov-monto").addEventListener("input", programarPreviewTasa);
  document.getElementById("mov-fecha").addEventListener("change", programarPreviewTasa);

  form.addEventListener("submit", onSubmitMovimiento);
}

function actualizarCategorias() {
  const tipo = document.querySelector('input[name="tipo"]:checked')?.value || "gasto";
  const select = document.getElementById("mov-categoria");
  const lista = tipo === "gasto" ? CATEGORIAS_GASTO : CATEGORIAS_INGRESO;
  select.innerHTML = lista.map(c => `<option value="${c}">${c}</option>`).join("");
}

function programarPreviewTasa() {
  clearTimeout(debounceTasaId);
  debounceTasaId = setTimeout(mostrarPreviewTasa, 400);
}

async function mostrarPreviewTasa() {
  const fecha = document.getElementById("mov-fecha").value;
  const monto = parseFloat(document.getElementById("mov-monto").value);
  const preview = document.getElementById("mov-preview-usd");
  if (!fecha || !monto) {
    preview.textContent = "";
    return;
  }
  try {
    const { tasa } = await apiGet("getTasa", { fecha });
    const usd = (monto / tasa).toFixed(2);
    preview.textContent = `≈ $${usd} USD (tasa BCV: ${tasa} Bs — ${fecha})`;
  } catch (err) {
    preview.textContent = "No se pudo calcular la tasa: " + err.message;
  }
}

async function onSubmitMovimiento(ev) {
  ev.preventDefault();
  const form = ev.target;
  const boton = form.querySelector("button[type=submit]");
  boton.disabled = true;

  try {
    await apiPost("crearMovimiento", {
      fecha: form.querySelector("#mov-fecha").value,
      tipo: form.querySelector('input[name="tipo"]:checked').value,
      categoria: form.querySelector("#mov-categoria").value,
      monto_bs: form.querySelector("#mov-monto").value,
      nota: form.querySelector("#mov-nota").value
    });

    mostrarToast("Movimiento guardado");
    form.reset();
    document.getElementById("mov-fecha").valueAsDate = new Date();
    document.getElementById("mov-preview-usd").textContent = "";
    actualizarCategorias();
  } catch (err) {
    mostrarToast("Error: " + err.message, true);
  } finally {
    boton.disabled = false;
  }
}

function mostrarToast(texto, esError = false) {
  const toast = document.getElementById("toast");
  toast.textContent = texto;
  toast.className = esError ? "toast toast-error visible" : "toast visible";
  setTimeout(() => toast.classList.remove("visible"), 3000);
}
