import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/11.7.1/firebase-auth.js";

// Configuración Firebase (usa la tuya)
const firebaseConfig = {
  apiKey: "AIzaSyActULR2Fqu4F3A_A1TUOXQbfrORZecqiI",
  authDomain: "ofertassuper-a9841.firebaseapp.com",
  projectId: "ofertassuper-a9841",
  storageBucket: "ofertassuper-a9841.appspot.com",
  messagingSenderId: "29615340161",
  appId: "1:29615340161:web:bbca60564936cdc9e1ab80"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const form = document.getElementById("form-registro");
const mensajeDiv = document.getElementById("mensaje");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  mensajeDiv.textContent = "";

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const token = document.getElementById("token").value.trim();

  if (!email || !password || !token) {
    mensajeDiv.textContent = "Completa todos los campos.";
    return;
  }

  try {
    // Validar token en Firestore
    const q = query(collection(db, "invitaciones"), where("token", "==", token), where("usado", "==", false));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      mensajeDiv.textContent = "Token inválido o ya usado.";
      return;
    }

    const invitacionDoc = querySnapshot.docs[0];
    const invitacionData = invitacionDoc.data();

    // Crear usuario en Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // Guardar usuario en colección usuarios con rol y supermercadoId
    await setDoc(doc(db, "usuarios", uid), {
      rol: invitacionData.rol,
      supermercadoId: invitacionData.supermercadoId,
      email: email,
      nombre: "",
    });

    // Marcar token como usado
    await updateDoc(invitacionDoc.ref, { usado: true });

    mensajeDiv.textContent = "Registro exitoso. Ya puedes iniciar sesión.";
    form.reset();
  } catch (error) {
    mensajeDiv.textContent = "Error en el registro: " + error.message;
  }
});
