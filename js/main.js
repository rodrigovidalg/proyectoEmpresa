
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js";

// Bootstrap Modal (importa desde window.Bootstrap)
const Modal = window.bootstrap.Modal;

// Configuración Firebase
const firebaseConfig = {
  apiKey: "AIzaSyActULR2Fqu4F3A_A1TUOXQbfrORZecqiI",
  authDomain: "ofertassuper-a9841.firebaseapp.com",
  projectId: "ofertassuper-a9841",
  storageBucket: "ofertassuper-a9841.appspot.com",
  messagingSenderId: "29615340161",
  appId: "1:29615340161:web:bbca60564936cdc9e1ab80"
};

// Inicializar Firebase y Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// -------------------- SUPERMERCADOS --------------------

const form = document.getElementById("form-supermercado");
const tbodySupermercados = document.getElementById("tbody-supermercados");

// Modal variables
let modalSupermercadoId = null;
let modalSupermercadoNombre = null;
let modalInstance = null;

const modalConfirmarEl = document.getElementById("modalConfirmar");
const modalNombreSpan = document.getElementById("modal-nombre");
const modalDireccionSpan = document.getElementById("modal-direccion");
const modalTelefonoSpan = document.getElementById("modal-telefono");
const checkboxConsciente = document.getElementById("checkbox-consciente");
const inputConfirmacion = document.getElementById("input-confirmacion");
const btnConfirmar = document.getElementById("btn-confirmar");
const formConfirmacion = document.getElementById("form-confirmacion");

function resetModal() {
  checkboxConsciente.checked = false;
  inputConfirmacion.value = "";
  btnConfirmar.disabled = true;
}

function validarModal() {
  const textoValido = inputConfirmacion.value.trim().toLowerCase() === modalSupermercadoNombre.toLowerCase();
  const checkboxValido = checkboxConsciente.checked;
  btnConfirmar.disabled = !(textoValido && checkboxValido);
}

checkboxConsciente.addEventListener("change", validarModal);
inputConfirmacion.addEventListener("input", validarModal);

formConfirmacion.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    await updateDoc(doc(db, "supermercados", modalSupermercadoId), { activo: false });
    modalInstance.hide();
    mostrarSupermercados();
    alert(`Supermercado "${modalSupermercadoNombre}" desactivado correctamente.`);
  } catch (error) {
    alert("Error al desactivar supermercado: " + error.message);
  }
});

// Mostrar supermercados en tabla
async function mostrarSupermercados() {
  tbodySupermercados.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "supermercados"));
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const activo = data.activo !== undefined ? data.activo : true;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${data.nombre}</td>
      <td>${data.direccion || ""}</td>
      <td>${data.telefono || ""}</td>
      <td>
        <span class="badge ${activo ? 'bg-success' : 'bg-secondary'}">
          ${activo ? 'Activo' : 'Inactivo'}
        </span>
      </td>
      <td>
        <button class="btn btn-sm btn-${activo ? 'warning' : 'success'} btn-toggle-estado">
          ${activo ? 'Desactivar' : 'Activar'}
        </button>
        <button class="btn btn-danger btn-sm btn-eliminar">Eliminar</button>
      </td>
    `;

    // Botón activar/desactivar
    tr.querySelector(".btn-toggle-estado").addEventListener("click", async () => {
      if (activo) {
        // Mostrar modal para desactivar
        modalSupermercadoId = docSnap.id;
        modalSupermercadoNombre = data.nombre;
        modalNombreSpan.textContent = data.nombre;
        modalDireccionSpan.textContent = data.direccion || "(No especificada)";
        modalTelefonoSpan.textContent = data.telefono || "(No especificado)";
        resetModal();
        modalInstance = new Modal(modalConfirmarEl);
        modalInstance.show();
      } else {
        // Activar directamente (sin modal)
        try {
          await updateDoc(doc(db, "supermercados", docSnap.id), { activo: true });
          mostrarSupermercados();
        } catch (error) {
          alert("Error al activar supermercado: " + error.message);
        }
      }
    });

    // Botón eliminar
    tr.querySelector(".btn-eliminar").addEventListener("click", async () => {
      if (confirm(`¿Eliminar supermercado "${data.nombre}"?`)) {
        try {
          await deleteDoc(doc(db, "supermercados", docSnap.id));
          mostrarSupermercados();
        } catch (error) {
          alert("Error al eliminar supermercado: " + error.message);
        }
      }
    });

    tbodySupermercados.appendChild(tr);
  });
}

// Agregar supermercado
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = document.getElementById("nombre").value.trim();
  const direccion = document.getElementById("direccion").value.trim();
  const telefono = document.getElementById("telefono").value.trim();

  if (!nombre) {
    alert("El nombre es obligatorio");
    return;
  }

  try {
    await addDoc(collection(db, "supermercados"), { nombre, direccion, telefono, activo: true });
    form.reset();
    mostrarSupermercados();
    cargarSupermercadosSelect();
  } catch (error) {
    alert("Error al agregar supermercado: " + error.message);
  }
});

mostrarSupermercados();

// -------------------- INVITACIONES --------------------

const formInvitacion = document.getElementById("form-invitacion");
const selectSupermercado = document.getElementById("select-supermercado");

// Cargar supermercados en el select
async function cargarSupermercadosSelect() {
  selectSupermercado.innerHTML = '<option value="" disabled selected>Selecciona un supermercado</option>';
  const querySnapshot = await getDocs(collection(db, "supermercados"));
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const option = document.createElement("option");
    option.value = docSnap.id;
    option.textContent = data.nombre;
    selectSupermercado.appendChild(option);
  });
}

function generarToken() {
  return Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
}

formInvitacion.addEventListener("submit", async (e) => {
  e.preventDefault();
  const supermercadoId = selectSupermercado.value;
  if (!supermercadoId) {
    alert("Selecciona un supermercado");
    return;
  }

  const token = generarToken();

  try {
    await addDoc(collection(db, "invitaciones"), {
      token,
      supermercadoId,
      rol: "editor",
      usado: false,
      fechaCreacion: serverTimestamp(),
    });
    alert(`Invitación creada. Token: ${token}`);
    formInvitacion.reset();
    cargarInvitaciones();
  } catch (error) {
    alert("Error al crear invitación: " + error.message);
  }
});

async function cargarInvitaciones() {
  const tbody = document.getElementById("tbody-invitaciones");
  tbody.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "invitaciones"));

  for (const docSnap of querySnapshot.docs) {
    const data = docSnap.data();
    if (!data.usado) {
      let nombreSupermercado = data.supermercadoId; // fallback

      try {
        const supermercadoRef = doc(db, "supermercados", data.supermercadoId);
        const supermercadoSnap = await getDoc(supermercadoRef);
        if (supermercadoSnap.exists()) {
          nombreSupermercado = supermercadoSnap.data().nombre;
        }
      } catch (error) {
        console.error("Error al obtener supermercado:", error);
      }

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${nombreSupermercado}</td>
        <td>${data.supermercadoId}</td>
        <td>${data.token}</td>
        <td>${data.rol}</td>
        <td>
          <button class="btn btn-danger btn-sm btn-eliminar">Eliminar</button>
        </td>
      `;

      tr.querySelector(".btn-eliminar").addEventListener("click", async () => {
        if (confirm("¿Eliminar esta invitación?")) {
          await deleteDoc(doc(db, "invitaciones", docSnap.id));
          cargarInvitaciones();
        }
      });

      tbody.appendChild(tr);
    }
  }
}



cargarSupermercadosSelect();
cargarInvitaciones();
