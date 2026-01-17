// Configurações de frete
const TAXA_BASE = 6.0;
const VALOR_POR_KM = 1.3;

// Endereço fixo da padaria (latitude/longitude)
const PADARIA_COORDS = [-23.46231, -46.53792]; // Guarulhos - R. Laranjeiras, 73

let cart = [];
let subtotal = 0;
let frete = 0;

// Inserir produtos no carrinho
function addToCart(name, price){
    cart.push({name, price});
    subtotal += price;
    updateCart();
}

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

// Mostrar opções de entrega
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

// Função para usar geolocalização do cliente
function useCurrentLocation(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(async pos => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            await calcularFreteORS(lat, lng);
        }, ()=>{alert("Não foi possível obter sua localização.")});
    } else {
        alert("Geolocalização não suportada neste navegador.");
    }
}

// Função para calcular frete a partir de endereço manual
async function calculateFrete(){
    const endereco = document.getElementById('manual-address').value;
    if(!endereco.trim()){ alert("Digite seu endereço ou use sua localização."); return; }

    const apiKey = "SUA_CHAVE_ORS_AQUI"; // substitua pela sua chave ORS gratuita
    const proxy = "https://cors-anywhere.herokuapp.com/";

    // Geocoding ORS para obter coordenadas
    const url = `${proxy}https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(endereco)}&size=1`;

    try{
        const res = await fetch(url);
        const data = await res.json();
        if(data.features.length === 0){ alert("Endereço não encontrado."); return; }
        const [lng, lat] = data.features[0].geometry.coordinates;
        await calcularFreteORS(lat, lng);
    } catch(err){
        alert("Erro ao obter coordenadas: " + err);
    }
}

// Função que calcula frete real usando ORS Directions API com proxy
async function calcularFreteORS(latCliente, lngCliente){
    const apiKey = "SUA_CHAVE_ORS_AQUI"; // substitua pela sua chave ORS gratuita
    const proxy = "https://cors-anywhere.herokuapp.com/";

    const url = `${proxy}https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${PADARIA_COORDS[1]},${PADARIA_COORDS[0]}&end=${lngCliente},${latCliente}`;

    try{
        const res = await fetch(url);
        const data = await res.json();

        const distancia_m = data.features[0].properties.summary.distance;
        const distancia_km = distancia_m / 1000;

        frete = TAXA_BASE + VALOR_POR_KM * distancia_km;
        document.getElementById('frete-display').style.display = 'block';
        document.getElementById('frete').textContent = frete.toFixed(2);
        updateTotal();
    } catch(err){
        alert("Erro ao calcular rota: " + err);
    }
}

function updateTotal(){
    const total = subtotal + frete;
    document.getElementById('total').textContent = total.toFixed(2);
}
