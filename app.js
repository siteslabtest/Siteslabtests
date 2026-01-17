// ------------------- CONFIGURAÇÕES -------------------
const TAXA_BASE = 6.0;
const VALOR_POR_KM = 1.3;

// Backend Replit
const BACKEND_URL = "https://route-planner--siteslabtest.replit.app/frete";

// ------------------- VARIÁVEIS -------------------
let cart = [];
let subtotal = 0;
let frete = 0;

// Produtos exemplo
const produtos = [
  {name: "Pão Francês", price: 1.5},
  {name: "Bolo de Chocolate", price: 15},
  {name: "Refrigerante 2L", price: 8},
  {name: "Coxinha", price: 4},
  {name: "Pizza de Mussarela", price: 25},
  {name: "Combo Café + Pão", price: 12}
];

// ------------------- FUNÇÕES -------------------

// Adiciona produto ao carrinho
function addToCart(name, price){
    cart.push({name, price});
    subtotal += price;
    updateCart();
}

// Atualiza carrinho e total
function updateCart(){
    const cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = '';
    cart.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.name} - R$ ${item.price.toFixed(2)}`;
        cartItems.appendChild(li);
    });
    document.getElementById('subtotal').textContent = subtotal.toFixed(2);
    updateTotal();
}

// Atualiza total (subtotal + frete)
function updateTotal(){
    const total = subtotal + frete;
    document.getElementById('total').textContent = total.toFixed(2);
}

// ------------------- ENTREGA -------------------

// Mostra ou esconde opções de entrega
document.getElementById('delivery-checkbox').addEventListener('change', function(){
    const deliveryOptions = document.getElementById('delivery-options');
    if(this.checked){
        deliveryOptions.style.display = 'block';
    } else {
        deliveryOptions.style.display = 'none';
        frete = 0;
        document.getElementById('frete-display').style.display = 'none';
        updateTotal();
    }
});

// ------------------- GEOLOCALIZAÇÃO -------------------

// Usa localização atual do cliente
function useCurrentLocation(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(async pos => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            await calcularFreteORS(lat, lng);
        }, ()=>{alert("Não foi possível obter sua localização.");});
    } else {
        alert("Geolocalização não suportada neste navegador.");
    }
}

// Calcula frete a partir de endereço manual
async function calculateFrete(){
    const endereco = document.getElementById('manual-address').value;
    if(!endereco.trim()){ 
        alert("Digite seu endereço ou use sua localização."); 
        return; 
    }

    try {
        // Geocoding via backend ORS (Replit)
        const resCoords = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}`);
        const dataCoords = await resCoords.json();
        if(dataCoords.length === 0){ alert("Endereço não encontrado."); return; }

        const lat = parseFloat(dataCoords[0].lat);
        const lng = parseFloat(dataCoords[0].lon);

        await calcularFreteORS(lat, lng);
    } catch(err){
        alert("Erro ao obter coordenadas: " + err);
    }
}

// ------------------- FRETE REAL -------------------

// Calcula frete chamando o backend Replit
async function calcularFreteORS(latCliente, lngCliente){
    try{
        const res = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({lat: latCliente, lng: lngCliente})
        });
        const data = await res.json();
        const distancia_km = data.distancia_km;

        frete = TAXA_BASE + VALOR_POR_KM * distancia_km;
        document.getElementById('frete-display').style.display = 'block';
        document.getElementById('frete').textContent = frete.toFixed(2);
        updateTotal();
    } catch(err){
        alert("Erro ao calcular frete: " + err);
    }
}

// ------------------- CARREGAMENTO DE PRODUTOS -------------------
function loadProdutos(){
    const produtosDiv = document.getElementById('produtos');
    produtos.forEach(p => {
        const div = document.createElement('div');
        div.className = "produto";
        div.innerHTML = `
            <span>${p.name}</span>
            <span>R$ ${p.price.toFixed(2)}</span>
            <button onclick="addToCart('${p.name}', ${p.price})">Adicionar</button>
        `;
        produtosDiv.appendChild(div);
    });
}

// ------------------- INICIALIZAÇÃO -------------------
window.onload = function(){
    loadProdutos();
    document.getElementById('frete-display').style.display = 'none';
    document.getElementById('delivery-options').style.display = 'none';
};
