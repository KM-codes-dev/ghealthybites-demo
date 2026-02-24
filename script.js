const cart = [];
const cartDiv = document.getElementById("cart");
const totalSpan = document.getElementById("total");

function updateCart(){
  cartDiv.innerHTML = "";

  let total = 0;

  cart.forEach(item=>{
    total += item.price;

    const div = document.createElement("div");
    div.textContent = `${item.name} — ₹${item.price}`;
    cartDiv.appendChild(div);
  });

  totalSpan.textContent = total;
}

document.querySelectorAll(".addBtn").forEach(btn=>{
  btn.onclick = ()=>{
    cart.push({
      name:btn.dataset.item,
      price:Number(btn.dataset.price)
    });
    updateCart();
  };
});

document.getElementById("menuSearch").addEventListener("input", e=>{
  const q = e.target.value.toLowerCase();

  document.querySelectorAll(".menu-card").forEach(card=>{
    card.style.display =
      card.innerText.toLowerCase().includes(q)
        ? ""
        : "none";
  });
});

document.getElementById("btnCheckout").onclick = ()=>{
  alert("Demo order placed!");
};

function scrollToMenu(){
  document.getElementById("menu").scrollIntoView({
    behavior:"smooth"
  });
}

/* Genesys Messenger hooks */

document.getElementById("btnOpenMessenger").onclick = ()=>{
  if(window.Genesys){
    window.Genesys("command","Messenger.open",{});
  }else{
    alert("Messenger not installed yet.");
  }
};