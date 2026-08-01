const toggle = document.querySelector(".menu-toggle");
const menu = document.querySelector("#site-menu");

if (toggle && menu) {
  const close = () => {
    toggle.setAttribute("aria-expanded", "false");
    menu.dataset.open = "false";
  };

  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(open));
    menu.dataset.open = String(open);
  });

  for (const link of menu.querySelectorAll("a")) link.addEventListener("click", close);
}
