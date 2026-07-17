/* =========================================================================
   MAIN.JS — compatibil cu toate paginile
   - Cart global (badge, sidebar, +/−/remove)
   - Product page: listare dinamică, filtre, sortări, "Mai multe"
   - Modal produs + adăugare în coș cu unități (kg/buc)
   - Checkout: formular + trimitere la Google Sheets
   =======================================================================*/

/* ======================
   0) CONFIG
   ====================== */
const GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/AKfycbysBrIRsnjh-7-6PZAUqEnTAOJWZ_2n68b5g8Y5zVaVD5yQC5j75CjAPvJNvJ9m_o4ELA/exec"; // <- pune linkul tău

// câte produse se arată inițial/pe click
const STEP = 8;

/* ======================
   1) UTIL coș
   ====================== */
function readCart(){ try{return JSON.parse(localStorage.getItem("cart")||"[]");}catch(_){return[];} }
function writeCart(cart){ localStorage.setItem("cart", JSON.stringify(cart)); }
function updateCartBadge(cart = readCart()){
  const el = document.getElementById("cart-count");
  if (!el) return;
  // badge = număr PRODUSE DISTINCTE (nu kg/buc)
  el.textContent = String(cart.length);
}

/* ======================
   2) RANDARE COȘ
   ====================== */
function renderCart(){
  const cart = readCart();
  updateCartBadge(cart);

  const list = document.getElementById("cart-items");
  const totalEl = document.getElementById("total-price");
  if(!list || !totalEl) return; // pe alte pagini nu avem coș detaliat

  list.innerHTML = "";
  let total = 0;

  if(cart.length===0){
    list.innerHTML = "<p class='text-center text-muted my-2'>Coșul este gol 🍰</p>";
  }

  cart.forEach((p,i)=>{
let qtyDisplay;

// cozonaci cu preț fix
if ((p.id.startsWith("s013") || p.id.startsWith("s014")) && p.qty === 1) {
  if (p.price === 60) qtyDisplay = "650 g";
  else if (p.price === 120) qtyDisplay = "1300 g";
  else qtyDisplay = "1 buc";
}

// produse pe kg
else if (p.unit === "kg") {
  qtyDisplay = p.qty.toFixed(2).replace(".",",") + " kg";
}

// produse pe buc
else {
  qtyDisplay = parseInt(p.qty,10) + " buc";
}

    total += p.price * p.qty;

    list.insertAdjacentHTML("beforeend", `
      <div class="cart-item d-flex justify-content-between align-items-center mb-2">
        <div class="d-flex align-items-center">
          <img src="${p.img}" alt="${p.name}" style="width:50px;height:50px;border-radius:8px;margin-right:10px;">
          <div>
            <strong>${p.name}</strong><br>
            <small>${qtyDisplay}</small>

          </div>
        </div>
        <div>
          <button class="btn btn-sm btn-outline-secondary" data-cart-action="dec" data-index="${i}">−</button>
          <button class="btn btn-sm btn-outline-secondary" data-cart-action="inc" data-index="${i}">+</button>
          <button class="btn btn-sm btn-outline-danger ml-1" data-cart-action="rem" data-index="${i}">✖</button>
        </div>
      </div>
    `);
  });

  totalEl.textContent = total.toFixed(2).replace(".", ",") + " lei";
}
window.renderCart = renderCart; // folosit și după submit

// Delegare acțiuni coș (merge pe toate paginile)
document.addEventListener("click", (e)=>{
  const btn = e.target.closest("[data-cart-action]");
  if(!btn) return;
  const idx = parseInt(btn.getAttribute("data-index"),10);
  const action = btn.getAttribute("data-cart-action");
  let cart = readCart();
  const item = cart[idx]; if(!item) return;

  const step = item.step || ((item.unit==="kg") ? 0.5 : 1);

  if(action==="inc"){ item.qty += step; }
  else if(action==="dec"){ item.qty = Math.max(item.qty - step, step); }
  else if(action==="rem"){ cart.splice(idx,1); }

  writeCart(cart);
  renderCart();
});

/* ======================
   3) CART SIDEBAR (deschide/închide)
   ====================== */
document.addEventListener("DOMContentLoaded", ()=>{
  updateCartBadge();
  const cartBtn = document.getElementById("cart-btn");
  const sidebar = document.getElementById("cart-sidebar");
  const closeCart = document.getElementById("close-cart");

  if(cartBtn && sidebar){
    cartBtn.addEventListener("click", (e)=>{
      e.preventDefault();
      sidebar.classList.add("active"); // presupune .cart-sidebar.active în CSS
      renderCart();
    });
  }
  if(closeCart && sidebar){
    closeCart.addEventListener("click", ()=>{
      sidebar.classList.remove("active");
    });
  }
});

/* ======================================================================
   SECȚIUNI DOAR PENTRU PAGINA "product.html"
   (toate sunt protejate prin verificarea elementelor din DOM)
   ====================================================================== */
const hasProductList = document.getElementById("product-list") !== null;
const productList = document.getElementById("product-list");

const PRODUCTS = [
  // === PRAJITURI ===
  { id:"p001", name:"Ruladă Pavlova", price:15.6, img:"img/pavlova.jpg", category:"prajituri", desc:"Bezea crocantă, cremă ușoară de frișcă și fructe delicate – o prăjitură fină care se topește în gură. Porție de 120g. Ingrediente: albuș de ou, zahăr, frișcă, fructe de pădure, amidon, oțet, vanilie. Alergeni: ouă, lapte.", unit:"buc" },
  { id:"p002", name:"Prajitură Oreo", price:15.3, img:"img/oreo.jpg", category:"prajituri", desc:"Blat pufos de cacao, cremă fină cu biscuiți Oreo și aromă de vanilie. Porție de 120g.\nIngrediente: făină, ouă, zahăr, cacao, biscuiți Oreo, unt, lapte.\nAlergeni: gluten, ouă, lapte, soia.", unit:"buc" },
  { id:"p003", name:"Medovic cu vișină", price:14.5, img:"img/medovik.jpg", category:"prajituri", desc:"Blat cu miere, cremă fină de smântână și vișine acrișoare. Porție de 110g.\nIngrediente: făină, miere, ouă, zahăr, smântână, vișine.\nAlergeni: gluten, ouă, lapte.", unit:"buc" },
  { id:"p004", name:"Mousse de ciocolată", price:15, img:"img/no-photo.jpg", category:"prajituri", desc:"Cremă aerată din ciocolată belgiană, cu textură catifelată și gust intens. Porție de 120g.\nIngrediente: ciocolată neagră, frișcă, ouă, unt.\nAlergeni: lapte, ouă, soia.", unit:"buc" },
  { id:"p005", name:"Prajitură Snickers", price:15.5, img:"img/snikers.jpg", category:"prajituri", desc:"Blat de ciocolată, cremă caramel și arahide crocante – gustul clasic Snickers reinterpretat. Porție de 120g.\nIngrediente: făină, ouă, zahăr, ciocolată, caramel, arahide, frișcă.\nAlergeni: arahide, ouă, lapte, gluten.", unit:"buc" },
  { id:"p006", name:"Amandină", price:15.6, img:"img/amandina.jpg", category:"prajituri", desc:"Blat însiropat cu ciocolată și cremă de cacao, glazură lucioasă și decor rafinat. Porție de 120g.\nIngrediente: făină, zahăr, ouă, cacao, unt, ciocolată.\nAlergeni: gluten, ouă, lapte.", unit:"buc" },
  { id:"p007", name:"Diplomat", price:14.2, img:"img/diplomat.jpg", category:"prajituri", desc:"Cremă de frișcă și fructe exotice într-un desert lejer și răcoritor. Porție de 120g.\nIngrediente: frișcă, ouă, zahăr, gelatină, fructe exotice.\nAlergeni: ouă, lapte.", unit:"buc" },
  { id:"p008", name:"Smântănel cu nuci", price:14.5, img:"img/smantanel.jpg", category:"prajituri", desc:"Cremă de smântână dulce și nuci caramelizate, o combinație perfectă între crocant și fin. Porție de 110g.\nIngrediente: smântână, zahăr, nuci, ouă, făină.\nAlergeni: nuci, ouă, lapte, gluten.", unit:"buc" },
  { id:"p009", name:"Paradis", price:15.6, img:"img/paradis.jpg", category:"prajituri", desc:"Prăjitură fină cu cremă de vanilie și blat ușor, inspirată de gustul copilăriei. Porție de 120g.\nIngrediente: făină, ouă, lapte, zahăr, unt, vanilie.\nAlergeni: gluten, ouă, lapte.", unit:"buc" },
  { id:"p010", name:"Pădurea Neagră", price:15.6, img:"img/pafureaneagra.jpg", category:"prajituri", desc:"Blat de cacao, frișcă naturală și vișine aromate – desertul clasic german reinterpretat. Porție de 120g.\nIngrediente: făină, cacao, ouă, frișcă, vișine.\nAlergeni: gluten, ouă, lapte.", unit:"buc" },
  { id:"p011", name:"Iaurt cu fructe", price:15, img:"img/iaurtfructe.jpg", category:"prajituri", desc:"Cremă ușoară de iaurt și fructe proaspete, un desert răcoritor de vară. Porție de 120g.\nIngrediente: iaurt, frișcă, gelatină, fructe.\nAlergeni: lapte.", unit:"buc" },
  { id:"p012", name:"Carla", price:15.5, img:"img/no-photo.jpg", category:"prajituri", desc:"Blat pufos și cremă fină de vanilie cu note subtile de ciocolată albă. Porție de 120g.\nIngrediente: făină, ouă, zahăr, lapte, ciocolată albă, unt, vanilie.\nAlergeni: gluten, ouă, lapte.", unit:"buc" },
  { id:"p013", name:"Savarina", price:12, img:"img/no-photo.jpg", category:"prajituri", desc:"Clasic românesc: blat însiropat, frișcă naturală și aromă de rom. Porție de 150g.\nIngrediente: făină, ouă, zahăr, frișcă, rom.\nAlergeni: gluten, ouă, lapte.", unit:"buc" },
  { id:"p014", name:"Brioșă asortată", price:8, img:"img/no-photo.jpg", category:"prajituri", desc:"Brioșe moi și aromate, în sortimente variate: ciocolată, vanilie, fructe. Porție de 70g.\nIngrediente: făină, ouă, zahăr, unt, lapte, fructe.\nAlergeni: gluten, ouă, lapte.", unit:"buc" },
  { id:"p015", name:"Cușma lui Guguță", price:15.6, img:"img/no-photo.jpg", category:"prajituri", desc:"Ruladă de clătite cu vișine și cremă de smântână – gust autentic moldovenesc. Porție de 130g.\nIngrediente: făină, ouă, lapte, smântână, vișine.\nAlergeni: gluten, ouă, lapte.", unit:"buc" },
  { id:"p016", name:"Ecler clasic", price:13, img:"img/eclervanilie.jpg", category:"prajituri", desc:"Patiserie franțuzească fină, cremă de vanilie și glazură de ciocolată. Porție de 110g.\nIngrediente: făină, ouă, lapte, unt, ciocolată.\nAlergeni: gluten, ouă, lapte.", unit:"buc" },
  { id:"p017", name:"Ecler fistic", price:14.3, img:"img/eclerfistic.jpg", category:"prajituri", desc:"Ecler umplut cu cremă de fistic și glazură verde pastel – un deliciu rafinat. Porție de 110g.\nIngrediente: făină, ouă, lapte, fistic, unt, zahăr.\nAlergeni: gluten, ouă, lapte, fistic.", unit:"buc" },
  { id:"p018", name:"Ecler Snickers", price:14.3, img:"img/ecler.jpg", category:"prajituri", desc:"Ecler cu cremă caramel, arahide și glazură de ciocolată – inspirat de Snickers. Porție de 110g.\nIngrediente: făină, ouă, lapte, ciocolată, caramel, arahide.\nAlergeni: gluten, ouă, lapte, arahide.", unit:"buc" },
  { id:"p019", name:"Cakesicles", price:6.5, img:"img/cakesicles.jpg", category:"prajituri", desc:"Mini-prăjitură glazurată în formă de înghețată, colorată și festivă. Porție de 50g.\nIngrediente: blat de vanilie, cremă de unt, ciocolată colorată.\nAlergeni: gluten, ouă, lapte, soia.", unit:"buc" },
  { id:"p020", name:"Cake Pops", price:4, img:"img/cakepops.jpg", category:"prajituri", desc:"Biluțe dulci din blat și cremă, pe băț, glazurate cu ciocolată fină. Porție de 30g.\nIngrediente: blat de pandișpan, cremă de unt, ciocolată.\nAlergeni: gluten, ouă, lapte.", unit:"buc" },

  // === PATISERIE ===
  { id:"pa001", name:"Covrigi fragezi", price:95, img:"img/no-photo.jpg", category:"patiserie", desc:"Covrigi fragezi, rumeniți perfect și aromați, ideali alături de cafea. Preț/kg.\nIngrediente: făină, drojdie, sare, ulei, ou, susan.\nAlergeni: gluten, ouă, susan.", unit:"kg" },
  { id:"pa002", name:"Fursec cu semințe", price:90, img:"img/furssusan.jpg", category:"patiserie", desc:"Biscuiți fragezi cu semințe crocante, aromați și perfecți pentru ceai. Preț/kg.\nIngrediente: făină, unt, semințe de floarea-soarelui, mac, ouă.\nAlergeni: gluten, ouă, lapte, semințe.", unit:"kg" },
  { id:"pa003", name:"Fursec Linzer", price:90, img:"img/brown.jpg", category:"patiserie", desc:"Fursecuri fine cu gem natural între foi fragede. Preț/kg.\nIngrediente: făină, zahăr, unt, ouă, gem de caise.\nAlergeni: gluten, ouă, lapte.", unit:"kg" },
  { id:"pa004", name:"Cornulețe asortate", price:95, img:"img/no-photo.jpg", category:"patiserie", desc:"Cornulețe umplute cu nucă, vișină sau rahat – tradiționale și fragede. Preț/kg.\nIngrediente: făină, untură, zahăr, nuci, rahat, gem.\nAlergeni: gluten, nuci, lapte.", unit:"kg" },
  { id:"pa005", name:"Plăcinte asortate", price:9, img:"img/placintabranza.jpg", category:"patiserie", desc:"Plăcinte cu brânză, cartofi, varză sau mere – coapte pe vatră. Preț/buc.\nIngrediente: făină, drojdie, brânză, cartofi, mere, varză.\nAlergeni: gluten, lapte.", unit:"buc" },
  { id:"pa006", name:"Covrigei crocanți", price:5, img:"img/no-photo.jpg", category:"patiserie", desc:"Covrigei crocanți, ușor sărați, ideali pentru gustări. Preț/buc.\nIngrediente: făină, unt, brânză, semințe, sare.\nAlergeni: gluten, lapte, semințe.", unit:"buc" },
  { id:"pa007", name:"Croissant asortat", price:15, img:"img/no-photo.jpg", category:"patiserie", desc:"Croissante pufoase cu fistic, ciocolată, vanilie sau caramel. Preț/buc.\nIngrediente: făină, unt, lapte, zahăr, drojdie, ouă, ciocolată sau fistic.\nAlergeni: gluten, ouă, lapte, soia, nuci.", unit:"buc" },
  { id:"pa008", name:"Fursec cu ovăz și nuci", price:89, img:"img/ovaznuci.jpg", category:"patiserie", desc:"Fursecuri rustice cu ovăz și nuci prăjite, aromă de casă. Preț/kg.\nIngrediente: ovăz, făină, zahăr, unt, nuci, ouă.\nAlergeni: gluten, ouă, lapte, nuci.", unit:"kg" },
  { id:"pa009", name:"Fursec cu scorțișoară", price:95, img:"img/no-photo.jpg", category:"patiserie", desc:"Fursecuri cu scorțișoară și zahăr brun – parfumate și crocante. Preț/kg.\nIngrediente: făină, unt, zahăr brun, scorțișoară, ouă.\nAlergeni: gluten, lapte, ouă.", unit:"kg" },
  { id:"pa010", name:"Inelușe cu nucă", price:95, img:"img/inelenuci.jpg", category:"patiserie", desc:"Inelușe fragede cu nucă măcinată, coapte aurii. Preț/kg.\nIngrediente: făină, nuci, zahăr, ouă, unt.\nAlergeni: gluten, ouă, nuci, lapte.", unit:"kg" },
  { id:"pa011", name:"American Cookie", price:6, img:"img/no-photo.jpg", category:"patiserie", desc:"Cookie american cu bucăți mari de ciocolată și miez moale. Preț/buc.\nIngrediente: făină, zahăr, unt, ouă, ciocolată.\nAlergeni: gluten, lapte, ouă, soia.", unit:"buc" },
  { id:"pa012", name:"Turtă dulce", price:5, img:"img/turtadulce.jpg", category:"patiserie", desc:"Turtă dulce moale, glazurată, aromată cu scorțișoară. Preț/buc.\nIngrediente: făină, miere, scorțișoară, zahăr, ouă.\nAlergeni: gluten, ouă.", unit:"buc" },
  { id:"pa013", name:"Macarons", price:220, img:"img/no-photo.jpg", category:"patiserie", desc:"Delicate și colorate, macarons cu diverse umpluturi rafinate. Preț/kg.\nIngrediente: albuș, zahăr, făină de migdale, cremă de unt.\nAlergeni: ouă, migdale, lapte.", unit:"kg" },
  { id:"pa014", name:"Faguri", price:115, img:"img/no-photo.jpg", category:"patiserie", desc:"Foi crocante umplute cu cremă dulce, desert clasic de casă. Preț/kg.\nIngrediente: făină, ouă, zahăr, unt, lapte, cacao.\nAlergeni: gluten, ouă, lapte.", unit:"kg" },
  { id:"pa015", name:"Fursec cu nucă", price:95, img:"img/fursnuci.jpg", category:"patiserie", desc:"Fursecuri fine cu nucă măcinată, fragede și aromate. Preț/kg.\nIngrediente: făină, nuci, unt, zahăr, ouă.\nAlergeni: gluten, nuci, lapte, ouă.", unit:"kg" },
  { id:"pa016", name:"Palmieri", price:95, img:"img/no-photo.jpg", category:"patiserie", desc:"Foietaj dulce caramelizat în formă de inimă. Preț/kg.\nIngrediente: făină, unt, zahăr.\nAlergeni: gluten, lapte.", unit:"kg" },
  { id:"pa017", name:"Saleuri", price:90, img:"img/saleuri.jpg", category:"patiserie", desc:"Foietaj sărat cu brânză și semințe, perfect pentru gustări. Preț/kg.\nIngrediente: făină, brânză, unt, ouă, semințe.\nAlergeni: gluten, lapte, ouă, semințe.", unit:"kg" },
  { id:"pa018", name:"Sărățele", price:95, img:"img/saratele.jpg", category:"patiserie", desc:"Sărățele crocante și aromate, tradiționale. Preț/kg.\nIngrediente: făină, unt, brânză, ouă, sare.\nAlergeni: gluten, lapte, ouă.", unit:"kg" },
  { id:"pa019", name:"Nuci", price:110, img:"img/nuci.jpg", category:"patiserie", desc:"Fursecuri în formă de nucă, umplute cu cremă fină. Preț/kg.\nIngrediente: făină, ouă, zahăr, unt, lapte, nuci, cacao.\nAlergeni: gluten, ouă, lapte, nuci.", unit:"kg" },
  { id:"pa020", name:"Piersicuțe", price:110, img:"img/piersicute.jpg", category:"patiserie", desc:"Biscuiți colorați, umpluți cu cremă aromată – nostalgici și delicioși. Preț/kg.\nIngrediente: făină, zahăr, ouă, unt, coloranți alimentari naturali, esențe de fructe.\nAlergeni: gluten, ouă, lapte.", unit:"kg" },

  // === TORTURI ===
  { id:"t011", name:"Tort Bento", price:90, img:"img/bento1.jpg", category:"torturi", desc:"Mini tort Bento delicat, perfect pentru ocazii speciale. Preț/kg.\nIngrediente: făină, lapte, ouă, frișcă, zahăr.\nAlergeni: gluten, lapte, ouă.", unit:"kg" },
  { id:"t001", name:"Tort Oreo", price:128, img:"img/Oreo-cake.jpeg", category:"torturi", desc:"Blaturi fine de cacao, cremă de vanilie și bucăți de biscuiți Oreo. Preț/kg.\nIngrediente: făină, cacao, biscuiți Oreo, frișcă, lapte, ouă.\nAlergeni: gluten, ouă, lapte, soia.", unit:"kg" },
  { id:"t002", name:"Tort Pădurea Neagră", price:130, img:"img/Padurea-neagra-cake.jpeg", category:"torturi", desc:"Clasic german cu vișine, frișcă naturală și ciocolată rasă. Preț/kg.\nIngrediente: făină, cacao, ouă, frișcă, vișine, ciocolată neagră.\nAlergeni: gluten, ouă, lapte.", unit:"kg" },
  { id:"t003", name:"Tort Paradis", price:130, img:"img/paradis-cake.jpeg", category:"torturi", desc:"Cremă ușoară de vanilie și blat aerat, gust delicat. Preț/kg.\nIngrediente: făină, ouă, zahăr, lapte, vanilie, frișcă.\nAlergeni: gluten, ouă, lapte.", unit:"kg" },
  { id:"t004", name:"Tort Smântănel cu Nuci", price:133, img:"img/smantanel-cake.jpeg", category:"torturi", desc:"Cremă de smântână dulce cu nuci caramelizate. Preț/kg.\nIngrediente: smântână, nuci, zahăr, ouă, făină.\nAlergeni: nuci, lapte, ouă, gluten.", unit:"kg" },
  { id:"t005", name:"Tort Medovic cu Vișină", price:133, img:"img/medovik-cake.jpeg", category:"torturi", desc:"Blat cu miere, cremă fină și vișine acrișoare. Preț/kg.\nIngrediente: făină, miere, ouă, zahăr, frișcă, vișine.\nAlergeni: gluten, ouă, lapte.", unit:"kg" },
  { id:"t006", name:"Tort Diplomat", price:119, img:"img/Diplomat-cake.jpeg", category:"torturi", desc:"Cremă de frișcă și fructe exotice, desert ușor și răcoritor. Preț/kg.\nIngrediente: frișcă, ouă, zahăr, fructe exotice, gelatină.\nAlergeni: ouă, lapte.", unit:"kg" },
  { id:"t007", name:"Tort Mousse Trio Ciocolată", price:130, img:"img/no-photo.jpg", category:"torturi", desc:"Trei straturi de mousse din ciocolată albă, cu lapte și neagră. Preț/kg.\nIngrediente: ciocolată albă, ciocolată neagră, frișcă, ouă, unt.\nAlergeni: lapte, ouă, soia.", unit:"kg" },
  { id:"t008", name:"Tort Iaurt cu Fructe", price:125, img:"img/iaurt-fructe.jpeg", category:"torturi", desc:"Cremă de iaurt și fructe proaspete, gust echilibrat și răcoritor. Preț/kg.\nIngrediente: iaurt, fructe, frișcă, gelatină, zahăr.\nAlergeni: lapte.", unit:"kg" },
  { id:"t009", name:"Tort Snickers", price:129, img:"img/snikers-cake.jpeg", category:"torturi", desc:"Cremă caramel, arahide și blat de cacao – gust bogat și intens. Preț/kg.\nIngrediente: făină, ouă, cacao, caramel, arahide, frișcă.\nAlergeni: gluten, ouă, lapte, arahide.", unit:"kg" },
  { id:"t010", name:"Tort Amandină", price:131, img:"img/amandina-cake.jpeg", category:"torturi", desc:"Blat de cacao însiropat, cremă de ciocolată și glazură lucioasă. Preț/kg.\nIngrediente: făină, ouă, cacao, unt, zahăr, ciocolată.\nAlergeni: gluten, ouă, lapte.", unit:"kg" },

  // === DE SEZON ===
  
{
  id:"s011",
  name:"Cozonac cu umplutură de fistic",
  price:140,
  img:"img/cozonacfistic.jpg",
  category:"de-sezon",
  desc:"Cozonac artizanal cu inserție generoasă de cremă de fistic și aluat pufos, aromat. Porție de aproximativ 800g.\nIngrediente: făină, zahăr, gălbenuș de ou, lapte, unt, drojdie, nuci, cacao, cremă de fistic.\nAlergeni: gluten, ouă, lapte, nuci, fistic.",
  unit:"buc",
  fixedQty: 1,
},
{
  id:"s012",
  name:"Cozonac cu umplutură de ciocolată",
  price:140,
  img:"img/cozonaccioco.jpg",
  category:"de-sezon",
  desc:"Cozonac pufos cu inserție cremoasă de Nutella, ideal pentru iubitorii de ciocolată. Porție de aproximativ 800g.\nIngrediente: făină, zahăr, gălbenuș de ou, lapte, unt, drojdie, nuci, cacao, Nutella.\nAlergeni: gluten, ouă, lapte, nuci, soia.",
  unit:"buc",
  fixedQty: 1,
},
{
  id:"s013",
  name:"Cozonac clasic",
  price:90,            // lei / kg
  img:"img/cozonacclasicc.png",
  category:"de-sezon",
  desc:"Cozonac tradițional pufos, cu aluat bogat și umplutură generoasă de nucă, cacao, rahat și stafide. Porție de 650g sau 1300g.\nIngrediente: făină, zahăr, gălbenuș de ou, lapte, unt, drojdie, nuci, rahat, stafide, cacao.\nAlergeni: gluten, ouă, lapte, nuci.",
  unit:"kg",
  fixedOptions: [0.65, 1.3]
},
{
  id:"s014",
  name:"Cozonac cu nucă și mac",
  price:90,            // lei / kg
  img:"img/coconacclasic.jpg",
  category:"de-sezon",
  desc:"Cozonac pufos cu două umpluturi clasice – nucă aromată și mac cremos – pentru un gust bogat și echilibrat. Porție de 650g sau 1300g.\nIngrediente: făină, zahăr, gălbenuș de ou, lapte, unt, drojdie, nuci, rahat, stafide, cacao, mac.\nAlergeni: gluten, ouă, lapte, nuci.",
  unit:"kg",
  fixedOptions: [0.65, 1.3]
},
{ id:"s001", name:"New York Roll", price:20, img:"img/no-photo.jpg", category:"de-sezon", desc:"Foietaj stratificat cu umpluturi fine de fistic, ciocolată, vanilie sau caramel. Preț/buc.\nIngrediente: făină, unt, lapte, zahăr, fistic, ciocolată.\nAlergeni: gluten, lapte, ouă, fistic.", unit:"buc" },
  { id:"s002", name:"Mango", price:29, img:"img/mango.jpg", category:"de-sezon", desc:"Desert exotic, mousse de mango și blat ușor de vanilie. Porție individuală.\nIngrediente: piure de mango, frișcă, ouă, gelatină, făină.\nAlergeni: lapte, ouă, gluten.", unit:"buc" },
  { id:"s003", name:"Fistic", price:29, img:"img/fistic.jpg", category:"de-sezon", desc:"Cremă bogată de fistic într-un desert fin și colorat. Porție individuală.\nIngrediente: fistic, frișcă, ouă, zahăr, unt.\nAlergeni: fistic, lapte, ouă.", unit:"buc" },
  { id:"s004", name:"Nucă de cocos", price:25, img:"img/cocos.jpg", category:"de-sezon", desc:"Desert cu cremă de cocos și blat alb pufos, aromă tropicală. Porție individuală.\nIngrediente: cocos, lapte, frișcă, făină, ouă.\nAlergeni: cocos, lapte, ouă, gluten.", unit:"buc" },
  { id:"s005", name:"Caisă", price:18, img:"img/piersica.jpg", category:"de-sezon", desc:"Mousse de caise proaspete, desert ușor și fructat. Porție individuală.\nIngrediente: caise, zahăr, frișcă, gelatină.\nAlergeni: lapte.", unit:"buc" },
  { id:"s006", name:"Bob de cafea", price:17, img:"img/cafea.jpg", category:"de-sezon", desc:"Desert cu cremă de cafea intensă și blat fin de cacao. Porție individuală.\nIngrediente: cafea, făină, ouă, frișcă, cacao.\nAlergeni: gluten, ouă, lapte.", unit:"buc" },
  { id:"s007", name:"Lămâie", price:30, img:"img/lamaie.jpg", category:"de-sezon", desc:"Desert răcoritor cu cremă de lămâie și glazură lucioasă. Porție individuală.\nIngrediente: lămâie, zahăr, făină, ouă, frișcă.\nAlergeni: gluten, ouă, lapte.", unit:"buc" },
  { id:"s008", name:"Portocală", price:21, img:"img/portocala.jpg", category:"de-sezon", desc:"Mousse fin de portocale, perfect pentru iubitorii de citrice. Porție individuală.\nIngrediente: portocale, zahăr, gelatină, frișcă.\nAlergeni: lapte.", unit:"buc" },
  { id:"s009", name:"Banana", price:10, img:"img/banana.jpg", category:"de-sezon", desc:"Desert cremos cu aromă naturală de banană, ușor și parfumat. Porție individuală.\nIngrediente: banane, lapte, frișcă, ouă.\nAlergeni: lapte, ouă.", unit:"buc" },
  { id:"s010", name:"Zmeură", price:25, img:"img/zmeura.jpg", category:"de-sezon", desc:"Mousse fin de zmeură și blat alb delicat – dulce și acrișor. Porție individuală.\nIngrediente: zmeură, frișcă, făină, ouă, zahăr.\nAlergeni: lapte, gluten, ouă.", unit:"buc" }
];

/* ======================
   5) CARD PRODUS + LISTARE
   ====================== */
function createProductCard(p){
  return `
    <div class="col-lg-3 col-md-6 mb-4 pb-2">
      <div class="product-item d-flex flex-column align-items-center text-center bg-light rounded py-5 px-3 "
     data-id="${p.id}" 
     data-category="${p.category}" 
     data-price="${p.price}" 
     data-desc="${p.desc}"
     data-unit="${p.unit}">

        <div class="bg-primary mt-n5 py-3" style="width: 80px;">
          <h4 class="font-weight-bold text-white mb-0">${p.price}<br>lei</h4>
        </div>
        <div class="position-relative bg-primary rounded-circle mt-n3 mb-4 p-3">
          <img class="rounded-circle w-100 h-100" src="${p.img}" style="object-fit: cover;">
        </div>
        <h5 class="font-weight-bold mb-3">${p.name}</h5>
        ${p.fixedLabel ? `<small class="text-muted mb-3">${p.fixedLabel}</small>` : ""}
        <a href="#" class="btn btn-sm btn-secondary order-btn">Comanda</a>
      </div>
    </div>
  `;
}

let VISIBLE_COUNT = STEP;
let activeCategory = "all";
let sortMode = "default";

function applyFiltersAndSort(){
  if(!hasProductList) return;
  let filtered = PRODUCTS.slice();

  // filtrare
  if(activeCategory!=="all"){
    filtered = filtered.filter(p => (p.category||"").toLowerCase() === activeCategory);
  }
  // sortare
  if(sortMode==="asc"){
    filtered.sort((a,b)=>a.price-b.price);
  }else if(sortMode==="desc"){
    filtered.sort((a,b)=>b.price-a.price);
  }else if(sortMode==="name"){
    filtered.sort((a,b)=>a.name.localeCompare(b.name));
  }

  const list = document.getElementById("product-list");
  list.innerHTML = filtered.slice(0, VISIBLE_COUNT).map(createProductCard).join("");

  const more = document.getElementById("load-more");
  if(more) more.style.display = (VISIBLE_COUNT>=filtered.length) ? "none" : "inline-block";
}

/* ======================
   6) MODAL PRODUS (doar pe product.html)
   ====================== */
const modal = document.getElementById('product-modal');
const pmImg  = document.getElementById('pm-img');
const pmName = document.getElementById('pm-name');
const pmDesc = document.getElementById('pm-desc');
const pmPrice= document.getElementById('pm-price');
const pmQty  = document.getElementById('pm-qty');
const pmLabel= document.getElementById('pm-label');
const pmAdd  = document.getElementById('pm-add');
const pmClose= document.getElementById('pm-close');
const pmMinus= document.getElementById('pm-minus');
const pmPlus = document.getElementById('pm-plus');
const zoomOverlay = document.getElementById("img-zoom-overlay");
const zoomDisplay = document.getElementById("img-zoom-display");

// click pe imaginea din popup → deschide zoom
pmImg?.addEventListener("click", () => {
  zoomDisplay.src = pmImg.src;
  zoomOverlay.style.display = "flex";
});

// click oriunde pe overlay → inchide zoom
zoomOverlay?.addEventListener("click", () => {
  zoomOverlay.style.display = "none";
});


let currentItem = null;

// deschidere
document.addEventListener('click', (e) => {
  const card = e.target.closest('.product-item');
  if (!card || !modal) return;

  // prevenim refresh-ul de la <a href="#">
  e.preventDefault();

  currentItem = card;

  const img = card.querySelector('img')?.src || '';
  const name = card.querySelector('h5')?.innerText || 'Produs';
  const priceText = card.querySelector('h4')?.innerText || '0';
  const cat = (card.dataset.category||"").toLowerCase();
  const isCake = (cat === "torturi");


  pmImg.src = img;
  pmName.textContent = name;
  pmDesc.textContent = card.dataset.desc || 'Făcut cu drag în cofetăria noastră.';
  pmPrice.textContent = priceText;

  if (card.dataset.id === "s013" || card.dataset.id === "s014") {
    pmPrice.textContent = priceText + " / kg";
  }
  const unit = card.dataset.unit; 
const isKgNonCake = (unit === "kg" && cat !== "torturi");

// === LOGICĂ SPECIALĂ COZONACI ===

// ===== LOGICĂ CANTITATE (CURATĂ) =====
const productId = card.dataset.id;
// ===== RESET COMPLET UI MODAL =====
pmQty.style.display = "";
pmMinus.style.display = "";
pmPlus.style.display = "";
pmLabel.style.display = "";

pmLabel.textContent = unit === "kg" ? "Cantitate (kg)" : "Cantitate (buc)";

// șterge opțiuni cozonac DOAR dacă există
const oldOptions = document.getElementById("cozonac-options");
if (oldOptions) oldOptions.remove();


// reset UI
pmLabel.style.display = "";
pmQty.style.display = "";
pmMinus.style.display = "";
pmPlus.style.display = "";

// curățăm opțiuni vechi cozonac
document.getElementById("cozonac-options")?.remove();

// --- Cozonac fistic / ciocolată (800g FIX) ---
if (productId === "s011" || productId === "s012") {
  pmLabel.textContent = "Cantitate (buc)";
  pmQty.style.display = "";
  pmMinus.style.display = "";
  pmPlus.style.display = "";
  pmQty.min = 1;
  pmQty.step = 1;
  pmQty.value = 1;
}


// --- Cozonac clasic: DOAR 2 OPȚIUNI ---
else if (productId === "s013" || productId === "s014") {
  pmLabel.textContent = "Alege gramajul";

  pmQty.style.display = "none";
  pmMinus.style.display = "none";
  pmPlus.style.display = "none";

  pmLabel.insertAdjacentHTML("afterend", `
    <div id="cozonac-options">
      <label>
        <input type="radio" name="cozonac-size" value="0.65" checked>
        650 g
      </label><br>
      <label>
        <input type="radio" name="cozonac-size" value="1.3">
        1300 g
      </label>
    </div>
  `);
}

// --- RESTUL PRODUSELOR (CODUL TĂU ORIGINAL) ---
else {
  pmLabel.textContent = unit === "kg" ? "Cantitate (kg)" : "Cantitate (buc)";

  const isBento = name.toLowerCase().includes("bento");

  pmQty.min  = isCake && !isBento ? 0.5 : (isBento ? 0.4 : (isKgNonCake ? 0.1 : 1));
  pmQty.step = isCake && !isBento ? 0.5 : (isBento ? 0.1 : (isKgNonCake ? 0.1 : 1));
  pmQty.value = isCake && !isBento ? 1 : (isBento ? 0.4 : (isKgNonCake ? 0.1 : 1));
}


  modal.classList.add('active');
});



pmClose?.addEventListener('click', (e)=>{ e.preventDefault(); modal?.classList.remove('active'); });
modal?.addEventListener('click',(e)=>{ if(e.target===modal) modal.classList.remove('active'); });
pmMinus?.addEventListener('click',(e)=>{
  e.preventDefault();
  let v = parseFloat(pmQty.value) || 0;
  const s = parseFloat(pmQty.step) || 1;
  const m = parseFloat(pmQty.min) || 0;
  let newVal = Math.max(v - s, m);

  // rotunjire anti 0.79 bug
  newVal = Math.round(newVal * 10) / 10;
  pmQty.value = (s < 1) ? newVal.toFixed(1) : newVal;
});

pmPlus?.addEventListener('click',(e)=>{
  e.preventDefault();
  let v = parseFloat(pmQty.value) || 0;
  const s = parseFloat(pmQty.step) || 1;
  let newVal = v + s;

  // rotunjire anti 0.79 bug
  newVal = Math.round(newVal * 10) / 10;
  pmQty.value = (s < 1) ? newVal.toFixed(1) : newVal;
});

// adăugare în coș
pmAdd?.addEventListener('click',(e)=>{
  e.preventDefault(); e.stopPropagation();
  if(!currentItem) return;

  const cat = (currentItem.dataset.category||"").toLowerCase();
const unit = currentItem.dataset.unit; 
let qty;

if (currentItem.dataset.id === "s013") {
  // cozonac clasic
  qty = parseFloat(
    document.querySelector('input[name="cozonac-size"]:checked')?.value
  );
} else {
  qty = parseFloat(pmQty.value);
}

// fallback sigur
if (!qty || isNaN(qty)) qty = 1;






const isCake = (cat === "torturi");
const isBento = pmName.textContent.toLowerCase().includes("bento");
const isKgNonCake = (unit === "kg" && !isCake) || isBento;

if (currentItem.dataset.id !== "s013") {
  if (isCake && !isBento) {
    qty = Math.round(qty * 2) / 2;   // 0.5 kg
  } else {
    qty = Math.round(qty * 10) / 10; // 0.1
  }
}
// s013 rămâne EXACT 0.65 / 1.3

// s013 rămâne exact 0.65 sau 1.3



  const name = pmName.textContent.trim();
  let displayName = name;

if (currentItem.dataset.id === "s013" || currentItem.dataset.id === "s014") {
  displayName = name + (qty === 1 ? "" : "");
}

let id = currentItem.dataset.id || name;

// diferențiere cozonac clasic
if (id === "s013" || id === "s014") {
  id = id + "_" + qty; // ex: s013_0.65 / s013_1.3
}

  const img = pmImg.src;
  let price = parseFloat(pmPrice.textContent.replace(/[^\d.,]/g,"").replace(",",".") ) || 0;

// preț FIX cozonaci clasici
if (currentItem.dataset.id === "s013" || currentItem.dataset.id === "s014") {
  if (qty === 0.65) price = 60;
  if (qty === 1.3)  price = 120;
}
// pentru cozonac cu preț fix, qty devine 1
if (currentItem.dataset.id === "s013" || currentItem.dataset.id === "s014") {
  qty = 1;
}


  let cart = readCart();
  const existing = cart.find(i=>i.id===id);
  if(existing){ existing.qty += qty; }
  else { cart.push({ id, name, price, qty, img, unit }); }

  writeCart(cart);
  renderCart();
  modal.classList.remove('active');
});

/* ======================
   7) CHECKOUT (formular + Sheets)
   ====================== */
document.addEventListener("click",(e)=>{
  const checkoutBtn = e.target.closest('#checkout-btn');
  if(!checkoutBtn) return;
  e.preventDefault();
  const overlay = document.getElementById('order-form-overlay');
  if(overlay) overlay.style.display = 'flex';
});
document.getElementById('order-cancel')?.addEventListener('click',(e)=>{
  e.preventDefault();
  const overlay = document.getElementById('order-form-overlay');
  if(overlay) overlay.style.display='none';
});
document.getElementById('order-submit')?.addEventListener('click', (e) => {
  e.preventDefault();
  const name  = document.getElementById('order-name')?.value.trim();
  const phone = document.getElementById('order-phone')?.value.trim();
  const date  = document.getElementById('order-date')?.value.trim();
  const cart  = readCart();

  if (!name || !phone || !date) { 
    alert("Te rugăm să completezi toate câmpurile obligatorii."); 
    return; 
  }
  if (cart.length === 0) { 
    alert("Coșul tău este gol!"); 
    return; 
  }
const selectedDate = new Date(date);

const today = new Date();
today.setHours(0,0,0,0);

const minAllowed = new Date(today);
minAllowed.setDate(minAllowed.getDate() + 2);

if (selectedDate < minAllowed) {
  alert("Comenzile pot fi ridicate începând cu poimâine.");
  return;
}



  if (!GOOGLE_SHEETS_URL || GOOGLE_SHEETS_URL.includes("PASTE_YOUR_WEB_APP_URL_HERE")) {
    alert("Setează GOOGLE_SHEETS_URL din main.js cu linkul Web App din Google Apps Script.");
    return;
  }

  const order = { name, phone, date, items: cart, time: new Date().toLocaleString("ro-RO") };

  // === Se trimite comanda... ===
  const msg = document.createElement('div');
  msg.textContent = "Se trimite comanda...";
  msg.style.position = "fixed";
  msg.style.bottom = "20px";
  msg.style.left = "50%";
  msg.style.transform = "translateX(-50%)";
  msg.style.background = "#3498db";
  msg.style.color = "#fff";
  msg.style.padding = "12px 20px";
  msg.style.borderRadius = "8px";
  msg.style.zIndex = "99999";
  msg.style.fontWeight = "500";
  document.body.appendChild(msg);

  // === Trimiterea efectivă ===
  fetch(GOOGLE_SHEETS_URL, { 
    method: "POST", 
    mode: "no-cors", 

    body: JSON.stringify(order) 
  })
  .then(() => {
    // succes
    msg.textContent = "✅ Comanda a fost înregistrată cu succes!";
    msg.style.background = "#4BB543";
    setTimeout(() => msg.remove(), 3000);

    // închide formularul + golește coșul
    const overlay = document.getElementById('order-form-overlay');
    if (overlay) overlay.style.display = 'none';
    localStorage.removeItem('cart');
    renderCart();
  })
  .catch(() => {
    // eroare
    msg.textContent = "❌ Eroare la trimiterea comenzii.";
    msg.style.background = "#d9534f";
    setTimeout(() => msg.remove(), 3000);
});
});

/* ======================
   8) INIT PAGE-SPECIFIC (product.html)
   ====================== */
document.addEventListener("DOMContentLoaded", ()=>{
  // badge + coș (să fie corecte pe orice pagină)
  updateCartBadge();
  renderCart();

  if(!hasProductList) return; // dacă nu suntem pe product.html, ieșim

  // prima randare produse
  VISIBLE_COUNT = STEP;
  applyFiltersAndSort();

  // "Mai multe produse"
  const more = document.getElementById("load-more");
  if(more){
    more.addEventListener("click", ()=>{
      VISIBLE_COUNT += STEP;
      applyFiltersAndSort();
    });
  }

  // filtre
  document.querySelectorAll(".filter-btn").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      activeCategory = (btn.dataset.filter||"all").toLowerCase();
      VISIBLE_COUNT = STEP;
      document.querySelectorAll(".filter-btn").forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
      applyFiltersAndSort();
    });
  });

  // sortare
  const sortSelect = document.getElementById("sort-select");
  if(sortSelect){
    sortSelect.addEventListener("change",(e)=>{
      const val = e.target.value;
      sortMode = (val==="asc"||val==="desc"||val==="name") ? val : "default";
      applyFiltersAndSort();
    });
  }
// === DATA + ORA RIDICARE: minim POIMÂINE (LOCAL TIME) ===
const pickupInput = document.getElementById("order-date");

if (pickupInput) {
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 2); // poimâine
  minDate.setHours(0, 0, 0, 0);

  const yyyy = minDate.getFullYear();
  const mm = String(minDate.getMonth() + 1).padStart(2, "0");
  const dd = String(minDate.getDate()).padStart(2, "0");

  // format LOCAL pentru datetime-local
  pickupInput.min = `${yyyy}-${mm}-${dd}T00:00`;
}



});
