
class Componente {
    constructor(id, nombre, precio, stock) {
        this.id = id;
        this.nombre = nombre;
        this.precio = precio;
        this.stock = stock;
    }

    vender(cantidad) {
        if (this.stock >= cantidad) {
            this.stock -= cantidad;
        } else {
            console.warn(`No hay suficiente stock para vender ${cantidad} unidades de ${this.nombre}`);
        }
    }

    aplicarDescuento(porcentaje) {
        let descuento = (this.precio * porcentaje) / 100;
        this.precio -= descuento;
    }
}

const pruebaProcesador = new Componente(101, "Intel Core i9", 450000, 10);
const pruebaVideo = new Componente(102, "Nvidia RTX 4090", 1200000, 3);
const pruebaRAM = new Componente(103, "RAM 32GB Kingston", 90000, 15);

console.log("--- ESTADO ANTES DE EJECUTAR MÉTODOS ---");
console.log(pruebaProcesador);
console.log(pruebaVideo);
console.log(pruebaRAM);

pruebaProcesador.vender(2);
pruebaVideo.aplicarDescuento(10);
pruebaRAM.vender(5);

console.log("--- ESTADO DESPUÉS DE EJECUTAR MÉTODOS ---");
console.log(pruebaProcesador);
console.log(pruebaVideo);
console.log(pruebaRAM);
console.log("------------------------------------------");

let catalogo = [];
const contenedorProductos = document.getElementById("contenedor-productos"); 
const formAgregar = document.getElementById("form-agregar");

setTimeout(() => {
    Toastify({
        text: "¡Bienvenido al gestor de stock!",
        duration: 3000,
        gravity: "bottom",
        style: { background: "#3498db" }
    }).showToast();
}, 1000);

const cargarStorage = () => {
    const datosGuardados = localStorage.getItem("catalogoPC");
    if (datosGuardados) {
        catalogo = JSON.parse(datosGuardados).map(item => new Componente(item.id, item.nombre, item.precio, item.stock));
        renderizarCatalogo(catalogo);
    } else {
        obtenerDatosDeJSON();
    }
};

const sincronizarStorage = () => {
    localStorage.setItem("catalogoPC", JSON.stringify(catalogo));
};

const obtenerDatosDeJSON = async () => {
    try {
        contenedorProductos.innerHTML = "<p>Cargando catálogo...</p>";
        
        const respuesta = await fetch("data.json");
        if (!respuesta.ok) throw new Error("No se pudo contactar al servidor local");
        
        const datos = await respuesta.json();
        catalogo = datos.map(item => new Componente(item.id, item.nombre, item.precio, item.stock));
        
        sincronizarStorage();
        renderizarCatalogo(catalogo);
    } catch (error) {
        contenedorProductos.innerHTML = `<p>Error de conexión: ${error.message}</p>`;
        Toastify({ text: "Error al cargar datos", style: { background: "#e74c3c" } }).showToast();
    } finally {
        console.log("Proceso de carga de JSON inicializado.");
    }
};

const renderizarCatalogo = (array) => {
    contenedorProductos.innerHTML = ""; 
    
    array.forEach(producto => {
        const { id, nombre, precio, stock } = producto; 
        
        const div = document.createElement("div");
        div.className = "producto-card";
        
        div.innerHTML = `
            <div>
                <h3>${nombre}</h3>
                <p>Precio: $${precio} | Stock: ${stock > 0 ? stock : "<strong>Agotado</strong>"}</p>
            </div>
            <button class="btn-eliminar" id="btn-eliminar-${id}">Eliminar</button>
        `;
        
        contenedorProductos.appendChild(div);

        const btnEliminar = document.getElementById(`btn-eliminar-${id}`);
        btnEliminar.addEventListener("click", () => eliminarComponente(id));
    });
};

const eliminarComponente = (idBuscado) => {
    catalogo = catalogo.filter(producto => producto.id !== idBuscado);
    sincronizarStorage();
    renderizarCatalogo(catalogo);
    
    Toastify({ text: "Componente eliminado", duration: 2000, style: { background: "#e74c3c" } }).showToast();
};

const agregarComponente = (e) => {
    e.preventDefault(); 
    
    const nombre = document.getElementById("input-nombre").value;
    const precio = parseFloat(document.getElementById("input-precio").value);
    const stock = parseInt(document.getElementById("input-stock").value);
    
    const nuevoId = catalogo.length > 0 ? Math.max(...catalogo.map(p => p.id)) + 1 : 1;
    const nuevoComponente = new Componente(nuevoId, nombre, precio, stock);
    
    catalogo.push(nuevoComponente);
    sincronizarStorage();
    renderizarCatalogo(catalogo);
    formAgregar.reset();
    
    Toastify({ text: "Agregado con éxito", duration: 2000, style: { background: "#2ecc71" } }).showToast();
};

formAgregar.addEventListener("submit", agregarComponente);

cargarStorage();
